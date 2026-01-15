import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, ScrollView, Image, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { getCartByOrderNumber } from "../HelperFunctions/cartUtil";
import { getRandomFoodImage } from "../HelperFunctions/imageUtils";
import API_BASE_URL from "../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackButton from "../../components/BackButton";

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const router = useRouter();
  const { orderNumber } = useLocalSearchParams();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    fetchCartDetails();
  }, [orderNumber]);

  const fetchCartDetails = async () => {
    try {
      if (!orderNumber) {
        console.error("Order number is undefined. Cannot fetch cart.");
        return;
      }
      const cartData = await getCartByOrderNumber(orderNumber.toString());
      setCart(cartData);
      console.log(cartData);
    } catch (error) {
      console.error("Failed to fetch cart details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentIntentClientSecret = async (total) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(parseFloat(total) * 100) }),
      });

      const data = await response.json();
      if (!data.client_secret) {
        throw new Error("No client_secret found in response");
      }

      return data.client_secret;
    } catch (err) {
      console.error("Error fetching client secret:", err);
      Alert.alert("Error", err.message);
      return null;
    }
  };

  const updateOrderStatus = async (orderNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/${orderNumber}/prepare`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update order status: ${response.status}`);
      }
  
      console.log(`Order ${orderNumber} status updated to 'prepare'`);
      return true;
    } catch (error) {
      console.error("Error updating order status:", error);
      return false;
    }
  };
  

  const addOrderToHistory = async (orderNumber) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found in AsyncStorage.");
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/api/customer/history`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_number: orderNumber }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.detail || "Failed to add order to history");
      }
  
      console.log("Order added to customer history:", data);
    } catch (err) {
      console.error("Error adding order to history:", JSON.stringify(err, null, 2));
    }
};




  
  
  
  const handleConfirmAndPay = async () => {
    setPaying(true);
    const totalAmount = (cart?.subtotal + cart?.taxes + 0.99).toFixed(2);
  
    const clientSecret = await fetchPaymentIntentClientSecret(totalAmount);
    if (!clientSecret) {
      setPaying(false);
      return;
    }
  
    const { error: initError } = await initPaymentSheet({
      paymentIntentClientSecret: clientSecret,
      merchantDisplayName: "Que Food Hall",
      allowsDelayedPaymentMethods: true,
    });
  
    if (initError) {
      setPaying(false);
      Alert.alert("Error", initError.message);
      return;
    }
  
    const { error: paymentSheetError } = await presentPaymentSheet();
    setPaying(false);
  
    if (paymentSheetError) {
      Alert.alert("Payment Failed", paymentSheetError.message);
    } else {

      // Then, add the order to history
      await addOrderToHistory(cart.order_number);

      // First, update the order status to "prepare"
      const orderUpdated = await updateOrderStatus(cart.order_number);
      if (!orderUpdated) {
        Alert.alert("Error", "Failed to update order status.");
        return;
      }
  
      
      Alert.alert("Success", "Your payment was successful!");
      router.push("/order-history");
    }
  };
  
  
  

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!cart || cart.fooditems.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Ionicons name="cart-outline" size={64} color="#aaa" style={{ marginBottom: 10 }} />
        <Text className="text-lg font-semibold mb-2">Your cart is empty</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
        <View className="absolute top-10 left-[-8] z-10">
          <BackButton />
        </View>
      <ScrollView>
        {/* Store Information */}
        <View className="relative">
          <Image source={{ uri: getRandomFoodImage(cart.restaurant_id) }} style={styles.restaurantImage} />
        </View>
        <View className="p-4">
          <Text className="text-2xl font-bold">{cart.restaurant_name}</Text>
          <Text className="text-gray-500">{cart.street_address || "No address provided"}</Text>

          {/* Map View */}
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: cart.latitude || 37.7749,
                longitude: cart.longitude || -122.4194,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
            >
              <Marker
                coordinate={{
                  latitude: cart.latitude || 37.7749,
                  longitude: cart.longitude || -122.4194,
                }}
                title={cart.restaurant_name}
                description={cart.address}
              />
            </MapView>
          </View>

          {/* Order Items */}
          <Text className="text-xl font-semibold mt-5">Your Items</Text>
          {cart.fooditems.map((item, index) => (
            <View key={index} className="flex-row justify-between items-center mt-2">
              <Text className="text-gray-700">
                {item.quantity} x {item.food_name}
              </Text>
              <Text className="text-gray-700">${item.line_total?.toFixed(2) ?? "0.00"}</Text>
            </View>
          ))}

          {/* Pricing Summary */}
          <View className="mt-5 border-t border-gray-300 pt-3">
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Subtotal</Text>
              <Text className="text-gray-700">${cart?.subtotal?.toFixed(2) ?? "0.00"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Tax</Text>
              <Text className="text-gray-700">${cart?.taxes?.toFixed(2) ?? "0.00"}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-gray-700">Service Fee</Text>
              <Text className="text-gray-700">$0.99</Text>
            </View>
            <View className="flex-row justify-between mt-2 border-t border-gray-300 pt-3">
              <Text className="text-xl font-semibold">Total</Text>
              <Text className="text-xl font-semibold">${(cart?.subtotal + cart?.taxes + 0.99).toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirm & Pay Button */}
      <TouchableOpacity onPress={handleConfirmAndPay} className="m-4 p-4 bg-black rounded-lg" disabled={paying}>
        {paying ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text className="text-white text-center font-bold text-lg">
            Confirm & Pay ${(cart?.subtotal + cart?.taxes + 0.99).toFixed(2)}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  restaurantImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  mapContainer: {
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
    height: 200,
  },
  map: {
    width: "100%",
    height: "100%",
  },
});

export default Checkout;
