import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import API_BASE_URL from '../../config'; 

// API endpoint
const API_URL = `${API_BASE_URL}/api/customer/orders`;

// Fetch order history function
const fetchOrderHistory = async (setOrders, setLoading) => {
  setLoading(true);
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) {
      console.error("No token found in AsyncStorage.");
      setOrders([]);
      return;
    }

    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    if (response.ok && Array.isArray(data.orders)) {
      setOrders(data.orders);
    } else {
      console.log("Error fetching orders:", data.detail);
      setOrders([]);
    }
  } catch (error) {
    console.error("Network error:", error);
    setOrders([]);
  }
  setLoading(false);
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrderHistory(setOrders, setLoading);
  }, []);

  // Navigate to Order Details
  const handleViewDetails = (order) => {
    router.push({
      pathname: "/(home)/order-details",
      params: { order: JSON.stringify(order) },
    });
  };

  // Status Color Logic
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "preparing":
        return "bg-yellow-500";
      case "complete":
      case "order completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Fetch Store Images
  const getStoreImage = (restaurant_id) => {
    const images = {
      1: require("../../assets/images/Smoothies.png"),
      81: require("../../assets/images/RedLobster.png"),
      87: require("../../assets/images/Burger.png"),
    };
    return images[restaurant_id];
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3">
        <Text className="text-3xl font-bold">Order History</Text>
      </View>

      {/* Loading State */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : orders.length > 0 ? (
        /* Orders List */
        <FlatList
          data={orders}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View className="mx-4 mb-4 bg-white rounded-2xl shadow-lg">
              {/* Order Image */}
              <View className="relative">
                <Image
                  source={getStoreImage(item.restaurant_id)}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                  resizeMode="cover"
                />

                {/* Status Label Overlay */}
                <View
                  className={`absolute top-4 left-4 px-3 py-1 rounded-full ${getStatusColor(
                    item.status
                  )}`}
                >
                  <Text className="text-white font-medium">
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Order Details */}
              <View className="p-4">
                <Text className="text-xl font-semibold">
                  {item.restaurant_name}
                </Text>
                <Text className="text-gray-500">
                  {new Date(item.due_date).toDateString()} at{" "}
                  {new Date(item.due_date).toLocaleTimeString()}
                </Text>
                <Text className="text-gray-600 mt-1">
                  Order #{item.order_number} • {item.items_count} items • $
                  {item.total.toFixed(2)}
                </Text>

                {/* Buttons */}
                <View className="flex-row justify-between mt-4">


                  <TouchableOpacity
                    className="bg-gray-200 flex-row items-center px-4 py-2 rounded-full"
                    onPress={() => handleViewDetails(item)}
                  >
                    <Ionicons name="book" size={18} color="black" />
                    <Text className="text-black font-medium ml-2">
                      View Details
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        /* No Orders View */
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons
            name="bag-handle-outline"
            size={64}
            color="#aaa"
            style={{ marginBottom: 10 }}
          />
          <Text className="text-xl font-semibold mb-2">No order history yet</Text>
          <Text className="text-center text-gray-500 mb-4">
            Try with one of our awesome restaurants and place your first order.
          </Text>
          <TouchableOpacity
            className="bg-black px-5 py-3 rounded-full"
            onPress={() => console.log("Go Shopping")}
          >
            <Text className="text-white font-medium">Go Shopping</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default OrderHistory;
