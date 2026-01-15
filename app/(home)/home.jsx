import React, { useState, useEffect, useRef } from "react";
import { 
  SafeAreaView, View, Text, ActivityIndicator, FlatList, 
  Image, TouchableOpacity, Dimensions 
} from "react-native";
import { fetchNearbyRestaurants } from "../HelperFunctions/api";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LocationTopBar from "../../components/TopBar"; 
import { getRandomFoodImage } from "../HelperFunctions/imageUtils";

const { width } = Dimensions.get("window");

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [bannerRestaurants, setBannerRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ location: "" });
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const router = useRouter();

  // Fetch restaurants when the component loads
  useEffect(() => {
    const loadRestaurants = async () => {
      if (!form.location) {
        setRestaurants([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      let data = await fetchNearbyRestaurants(form.location);

      // Assign a unique image to each restaurant using its ID
      data = data.map((restaurant) => ({
        ...restaurant,
        image: getRandomFoodImage(restaurant.restaurant_id), 
      }));

      setRestaurants(data);

      // Pick 4 random restaurants ONCE and store them
      if (data.length > 0) {
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setBannerRestaurants(shuffled.slice(0, 4));
      }

      setLoading(false);
    };

    loadRestaurants();
  }, [form.location]);

  // Auto-scroll logic (loops back to the first item after the last one)
  useEffect(() => {
    if (bannerRestaurants.length > 1) {
      const interval = setInterval(() => {
        setActiveIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerRestaurants.length;
          flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
          return nextIndex;
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [bannerRestaurants]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top Navigation Bar */}
      <LocationTopBar 
        form={form}
        setForm={setForm}
        error={error}
        onProfilePress={() => router.push('/profile')} 
      />

      {/* 🔥 Banner Section - Full Width, Auto-scroll with Circular Loop */}
      <View className="h-48 mb-4">
        <FlatList
          ref={flatListRef}
          data={bannerRestaurants}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.restaurant_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/menu", params: { id: item.restaurant_id, name: item.restaurant_name } })
              }
              style={{ width }}
              className="h-48 bg-black justify-center items-center"
            >
              <Image source={{ uri: item.image }} className="absolute w-full h-full opacity-40" />
              <Text className="text-white text-xl font-semibold">{item.restaurant_name}</Text>
              <Text className="text-white text-sm mb-2">{item.address.street_address}, {item.address.city}</Text>
              <TouchableOpacity 
                onPress={() => router.push({ pathname: "/menu", params: { id: item.restaurant_id, name: item.restaurant_name } })}
                className="bg-white px-5 py-2 rounded-full mt-2"
              >
                <Text className="text-black font-bold">View Menu</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
        />
        
        {/* Pagination Dots */}
        <View className="flex-row justify-center mt-2">
          {bannerRestaurants.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 mx-1 rounded-full ${index === activeIndex ? 'bg-black' : 'bg-gray-400'}`}
            />
          ))}
        </View>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#000" />
          <Text className="mt-4">Fetching restaurants...</Text>
        </View>
      ) : restaurants.length === 0 ? (
        <View className="flex-1 justify-center items-center px-8">
          <Ionicons name="sad-outline" size={64} color="#aaa" style={{ marginBottom: 10 }} />
          <Text className="text-xl font-semibold mb-2">No restaurants nearby</Text>
          <Text className="text-center text-gray-500 mb-4">
            We couldn’t find any restaurants near your location.
          </Text>
        </View>
      ) : (
        <FlatList
          data={restaurants}
          keyExtractor={(item) => item.restaurant_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: "/menu", params: { id: item.restaurant_id, name: item.restaurant_name } })}
              className="bg-white mx-4 mb-4 rounded-lg overflow-hidden shadow-lg"
            >
              <Image source={{ uri: item.image }} className="w-full h-48 bg-gray-200" />
              <View className="p-4">
                <Text className="text-lg font-bold">{item.restaurant_name}</Text>
                <Text className="text-gray-500">{item.address.street_address}, {item.address.city}</Text>
                <View className="flex-row items-center mt-2">
                  <Text className="text-gray-500">⭐ {item.ratings}</Text>
                  <Text className="text-gray-500 ml-2">💰 {item.pricing_levels}</Text>
                </View>
                <Text className="text-gray-400 mt-1">{item.distance_km} km away</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;
