import React, { useState, useEffect } from "react";
import { SafeAreaView, View, Text, ActivityIndicator, FlatList, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchMenuByRestaurantId } from "../HelperFunctions/api";
import { getRandomFoodImage } from "../HelperFunctions/imageUtils";
import { createOrGetCart, addItemToCart, getCart, removeItemFromCart } from "../HelperFunctions/cartUtil";
import { useRouter } from 'expo-router';


const Menu = () => {
  const { id, name } = useLocalSearchParams();
  const navigation = useNavigation();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(null);
  const [userPhoneNumber, setUserPhoneNumber] = useState(null);
  const [itemQuantities, setItemQuantities] = useState({});

  const restaurantImage = getRandomFoodImage(id);

  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      const data = await fetchMenuByRestaurantId(id);
      setMenuItems(data);
      //console.log("Menu items:", data);
      setLoading(false);
    };
    loadMenu();
  }, [id]);

  useEffect(() => {
    const setupCart = async () => {
      try {
        const restaurantId = parseInt(id, 10);
        const userPhoneNumber = await AsyncStorage.getItem("userPhoneNumber");
        if (!userPhoneNumber) {
          console.error("User phone number not found. Redirect to login.");
          return;
        }
        setUserPhoneNumber(userPhoneNumber);

        let existingCart;
        try {
          existingCart = await getCart(userPhoneNumber, restaurantId);
        } catch (error) {
          if (error.message.includes("Cart not found")) {
            console.log("No existing cart found, creating a new one.");
          } else {
            throw error;
          }
        }

        if (existingCart && existingCart.restaurant_id === restaurantId) {
          setCart(existingCart);
          //console.log("Existing cart found:", existingCart);
          const quantities = {};
          if (existingCart.fooditems) {
            existingCart.fooditems.forEach(item => {
              quantities[item.food_name] = item.quantity;
            });
          }
          setItemQuantities(quantities);
        } else {
          const newCart = await createOrGetCart(userPhoneNumber, restaurantId);
          setCart(newCart);
        }
      } catch (error) {
        console.error("Failed to setup cart:", error);
      }
    };

    setupCart();
  }, [id]);

  const groupedMenu = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const handleAddToCart = async (foodItem) => {
    if (!cart) return;
    try {
        const currentQuantity = itemQuantities[foodItem.food_name] || 0;
        const foodItemWithQuantity = {
            ...foodItem,
            quantity: currentQuantity + 1, 
        };
        const updatedCart = await addItemToCart(cart.order_number, foodItemWithQuantity);
        setCart(updatedCart);
        setItemQuantities(prevQuantities => ({
            ...prevQuantities,
            [foodItem.food_name]: (prevQuantities[foodItem.food_name] || 0) + 1
        }));
    } catch (error) {
        console.error("Add to cart error:", error.message);
    }
};

  const handleRemoveFromCart = async (foodItem) => {
    if (!cart) return;
    try {
      const currentQuantity = itemQuantities[foodItem.food_name] || 1;
      const foodItemWithQuantity = {
          ...foodItem,
          quantity: currentQuantity - 1, 
      };
      const updatedCart = await removeItemFromCart(cart.order_number, cart.menu_id, foodItemWithQuantity);
      setCart(updatedCart);
      setItemQuantities(prevQuantities => ({
        ...prevQuantities,
        [foodItem.food_name]: (prevQuantities[foodItem.food_name] || 1) - 1
    }));
    } catch (error) {
      console.error("Remove from cart error:", error.message);
    }
  };

  const getQuantityForItem = (foodItem) => {
    return itemQuantities[foodItem.food_name] || 0;
  };

  const handleCheckout = () => {  
    if (!cart || !cart.order_number) {
      console.error("❌ Cart or order_number is undefined. Cannot proceed to checkout.");
      return;
    }
  
    console.log("✅ Navigating to checkout with orderNumber:", cart.order_number);
  
    router.push({
      pathname: "checkout",
      params: { orderNumber: cart.order_number }
    });
  };
  
  

  const hasItemsInCart = Object.values(itemQuantities).some(quantity => quantity > 0);

  const calculateSubtotal = () => {
    return Object.entries(itemQuantities).reduce((total, [foodName, quantity]) => {
      const menuItem = menuItems.find(item => item.food_name === foodName);
      return total + (menuItem ? menuItem.food_price * quantity : 0);
    }, 0).toFixed(2);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="h-56 relative">
        <Image
          source={{ uri: restaurantImage }}
          className="absolute w-full h-full"
          style={{ resizeMode: "cover" }}
        />
        <View className="absolute w-full h-full bg-black opacity-20" />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute top-12 left-4 bg-white p-2 rounded-full shadow-lg"
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <View className="absolute bottom-4 left-4 right-4">
          <Text className="text-white text-2xl font-bold">{name}</Text>
        </View>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <FlatList
          data={Object.entries(groupedMenu)}
          keyExtractor={(item, index) => `${item[0]}-${index}`}
          renderItem={({ item }) => {
            const [categoryName, items] = item;
            return (
              <View className="mt-6 px-4">
                <Text className="text-xl font-semibold mb-2">{categoryName}</Text>
                {items.map((foodItem, idx) => {
                  const quantity = getQuantityForItem(foodItem);
                  //console.log("image url", foodItem.image_url);

                  return (
                    <View
                      key={`${foodItem.food_name}-${idx}`}
                      className="flex-row items-center py-4 border-b border-gray-300"
                      style={{ opacity: foodItem.availability === "available" ? 1 : 0.5 }}
                    >
                      {foodItem.image_url && (
                        <Image
                          source={{ uri: foodItem.image_url }}
                          className="w-24 h-24 rounded-lg mr-4"
                        />
                      )}

                      <View className="flex-1">
                        <Text className="text-lg font-semibold">{foodItem.food_name}</Text>
                        <Text className="text-gray-500">{foodItem.food_description || "No description"}</Text>
                        <Text className="text-black font-bold mt-1">
                          ${foodItem.food_price.toFixed(2)}
                        </Text>
                      </View>

                      {foodItem.availability === "available" && (
                        <View className="flex-row items-center">
                          <TouchableOpacity
                            onPress={() => handleRemoveFromCart(foodItem)}
                            className="w-8 h-8 rounded-full border border-gray-400 flex items-center justify-center"
                            disabled={quantity === 0}
                          >
                            <Text className={`text-black font-semibold ${quantity === 0 ? "opacity-50" : ""}`}>-</Text>
                          </TouchableOpacity>

                          <Text className="mx-3 text-lg font-semibold">{quantity}</Text>

                          <TouchableOpacity
                            onPress={() => handleAddToCart(foodItem)}
                            className="w-8 h-8 rounded-full bg-black flex items-center justify-center"
                          >
                            <Text className="text-white font-semibold">+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          }}
        />
      )}

      {hasItemsInCart && (
        <View className="absolute bottom-0 left-0 w-full px-4 pb-6">
          <TouchableOpacity
            onPress={handleCheckout}
            activeOpacity={0.8}
            className="bg-black flex-row items-center justify-between rounded-full px-6 py-4 shadow-lg"
          >
            <Text className="text-white font-semibold">
              {Object.values(itemQuantities).reduce((total, quantity) => total + quantity, 0)}{" "}
              {Object.values(itemQuantities).reduce((total, quantity) => total + quantity, 0) === 1 ? "Item" : "Items"}
            </Text>
            <Text className="text-white font-semibold">Checkout</Text>
            <Text className="text-white font-semibold">
              ${calculateSubtotal()}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </SafeAreaView>
  );
};

export default Menu;
