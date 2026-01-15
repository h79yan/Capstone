import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCarts, getRestaurantName, deleteCart } from '../HelperFunctions/cartUtil';
import { getRandomFoodImage } from '../HelperFunctions/imageUtils';
import { useRouter } from 'expo-router';

const Cart = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCarts();
  }, []);

  const fetchCarts = async () => {
    try {
      const userPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
      if (!userPhoneNumber) {
        console.error("User phone number not found.");
        return;
      }

      const cartsData = await getAllCarts(userPhoneNumber);
      if (!cartsData) {
        setCarts([]);
        return;
      }

      if (Array.isArray(cartsData)) {
        const cartsWithRestaurantNames = await Promise.all(
          cartsData.map(async (cart) => {
            const restaurantName = await getRestaurantName(cart.restaurant_id);
            return { ...cart, restaurant_name: restaurantName };
          })
        );

        if (cartsWithRestaurantNames) {
          const filteredCarts = cartsWithRestaurantNames.filter(
            (cart) => cart.fooditems && cart.fooditems.length > 0
          );
          setCarts(filteredCarts);
        }
      } else {
        setCarts([]);
      }
    } catch (error) {
      console.error("Failed to fetch carts:", error);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCart = async (item) => {
    try {
      const userPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
      if (!userPhoneNumber) {
        console.error("User phone number not found.");
        return;
      }
      await deleteCart(userPhoneNumber, item.restaurant_id);
      fetchCarts();
    } catch (error) {
      console.error("Failed to delete cart:", error);
    }
  };

  const handleCheckout = (orderNumber) => {
    if (!orderNumber) {
      console.error(" No order number found for checkout.");
      return;
    }

    console.log("Navigating to checkout with orderNumber:", orderNumber);
    router.push({
      pathname: "/checkout",
      params: { orderNumber },
    });
  };

  const renderCartItem = ({ item }) => (
    <View className="bg-white mx-4 mb-4 rounded-lg overflow-hidden shadow-lg">
      {/* Clickable restaurant section */}
      <TouchableOpacity
        onPress={() => router.push({ pathname: "/menu", params: { id: item.restaurant_id, name: item.restaurant_name } })}
        className="flex-row items-center p-4 border-b border-gray-300"
      >
        {/* Random food image per restaurant */}
        <Image 
          source={{ uri: getRandomFoodImage(item.restaurant_id) }} 
          className="w-16 h-16 rounded-lg"
        />
        <View className="flex-1 ml-3">
          <Text className="text-lg font-semibold">{item.restaurant_name}</Text>
          <Text className="text-gray-500 text-sm">
            {item.fooditems.length} items · ${item.subtotal.toFixed(2)}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#aaa" />
      </TouchableOpacity>

      {/* Food items list inside cart */}
      {item.fooditems.map((foodItem, index) => (
        <View key={index} className="flex-row justify-between px-4 py-2 border-b border-gray-200">
          <Text className="text-sm text-gray-700">{foodItem.quantity} x {foodItem.food_name}</Text>
          <Text className="text-sm font-semibold">${foodItem.line_total.toFixed(2)}</Text>
        </View>
      ))}

      {/* Checkout & Delete Buttons */}
      <View className="p-4">
        <TouchableOpacity
          onPress={() => handleCheckout(item.order_number)}
          className="p-3 bg-black rounded-lg mb-2"
        >
          <Text className="text-white text-center font-bold">Go to Checkout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteCart(item)}
          className="p-3 bg-red-500 rounded-lg"
        >
          <Text className="text-white text-center font-bold">Remove Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <Text className="text-4xl font-bold mt-7">Shopping</Text>
        <Text className="text-4xl font-bold mb-3">Cart</Text>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text>Loading...</Text>
        </View>
      ) : carts.length > 0 ? (
        <FlatList
          data={carts}
          keyExtractor={(item, index) => `${item.order_number}-${index}`}
          renderItem={renderCartItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          nestedScrollEnabled={true} // Fix VirtualizedList error
        />
      ) : (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="cart-outline" size={64} color="#aaa" style={{ marginBottom: 10 }} />
          <Text className="text-lg font-semibold mb-2">Your cart is empty</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default Cart;
