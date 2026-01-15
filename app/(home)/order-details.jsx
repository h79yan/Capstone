import React from "react";
import { SafeAreaView, View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker } from "react-native-maps";
import { useLocalSearchParams } from "expo-router";
import BackButton from "../../components/BackButton";

const getStoreImage = (restaurant_id) => {
    const images = {
        1: require("../../assets/images/Smoothies.png"),
        81: require("../../assets/images/RedLobster.png"),
        87: require("../../assets/images/Burger.png"),
    };
    return images[restaurant_id];
};

const OrderDetails = () => {
    const params = useLocalSearchParams();
    const order = params.order ? JSON.parse(params.order) : null;

    if (!order) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <Text className="text-lg font-bold">Order not found</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="absolute top-10 left-[-8] z-10">
                <BackButton />
            </View>
            <ScrollView>
                {/* Header Image */}
                <View className="relative">
                    <Image
                        source={getStoreImage(order.restaurant_id)}
                        style={styles.restaurantImage}
                    />
                </View>

                {/* Order Details */}
                <View className="p-4">
                    <Text className="text-2xl font-bold">{order.restaurant_name}</Text>
                    <Text className="text-gray-500">{order.street_address || "No address provided"}</Text>

                    {/* Order Number & Status */}
                    <View className="flex-row justify-between items-center mt-3">
                        <Text className="text-gray-700 font-medium">
                            Order #{order.order_number}
                        </Text>
                        <View className="flex-row items-center">
                            <Ionicons 
                                name="radio-button-on-outline" 
                                size={16} 
                                color={order.status.toLowerCase() === "cancelled" ? "red" : "green"} 
                            />
                            <Text className="text-gray-700 ml-1 capitalize">{order.status}</Text>
                        </View>

                    </View>
                    

                    {/* Map View */}
                    <View style={styles.mapContainer}>
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: order.latitude || 37.7749,  // Default SF location
                                longitude: order.longitude || -122.4194,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                        >
                            <Marker
                                coordinate={{
                                    latitude: order.latitude || 37.7749,
                                    longitude: order.longitude || -122.4194,
                                }}
                                title={order.restaurant_name}
                                description={order.address}
                            />
                        </MapView>
                    </View>

                    {/* Order Items */}
                    <Text className="text-xl font-semibold mt-5">Your Items</Text>
                    {order.fooditems.map((item, index) => (
                        <View key={index} className="flex-row justify-between items-center mt-2">
                            <Text className="text-gray-700">
                                {item.quantity} x {item.food_name}
                            </Text>
                            <Text className="text-gray-700">
                                ${(item.unit_price).toFixed(2)}
                            </Text>
                        </View>
                    ))}

                    {/* Order Pricing Summary */}
                    <View className="mt-5 border-t border-gray-300 pt-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Subtotal</Text>
                            <Text className="text-gray-700">${order.subtotal.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Tax</Text>
                            <Text className="text-gray-700">${order.taxes.toFixed(2)}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Service Fee</Text>
                            <Text className="text-gray-700">$0.99</Text>
                        </View>
                        <View className="flex-row justify-between mt-2 border-t border-gray-300 pt-3">
                            <Text className="text-xl font-semibold">Total</Text>
                            <Text className="text-xl font-semibold">${order.total.toFixed(2)}</Text>
                        </View>
                    </View>

                    {/* Payment Method */}
                    <View className="mt-5">
                        <Text className="text-xl font-semibold">Payment</Text>
                        <View className="flex-row items-center mt-2">
                            <Ionicons name="card-outline" size={18} color="black" />
                            <Text className="text-gray-700 ml-2">{order.payment_method || "Apple Pay"}</Text>
                        </View>
                    </View>

                    {/* Order Time */}
                    <View className="mt-5">
                        <Text className="text-xl font-semibold">Order due date</Text>
                        <Text className="text-gray-700 mt-1">
                            {new Date(order.due_date).toLocaleString()}
                        </Text>
                    </View>
                </View>
            </ScrollView>
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

export default OrderDetails;
