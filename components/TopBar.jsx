import React, { useState, useCallback, useEffect } from "react";
import { View, TextInput, TouchableOpacity, Alert, FlatList, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';
import debounce from 'lodash/debounce';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationTopBar = ({ form = { location: "" }, setForm, error, onProfilePress }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const labelColor = error ? "#FF0000" : "#6b7280";

  useEffect(() => {
    const loadSavedLocation = async () => {
      try {
        const savedLocation = await AsyncStorage.getItem("lastLocation");
        if (savedLocation) {
          setForm({ ...form, location: savedLocation });
        }
      } catch (error) {
        console.error("Failed to load saved location:", error);
      }
    };

    loadSavedLocation();
  }, []);

  const handleLocationPress = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Please enable location permissions in settings to use this feature.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    try {
      let result = await Location.reverseGeocodeAsync(location.coords);
      console.log("Geocoding result:", result);
      if (result && result.length > 0) {
        const address = `${result[0].name}, ${result[0].city}, ${result[0].region}, ${result[0].country}`;
        setForm({ ...form, location: address });
        await AsyncStorage.setItem("lastLocation", address);
      } else {
        Alert.alert('Address not found', 'Could not determine address for current location.');
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      Alert.alert('Geocoding Error', 'Failed to retrieve address from coordinates.');
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2) {
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`);
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const debouncedFetchSuggestions = useCallback(debounce(fetchSuggestions, 300), []); //300ms debounce

  const handleInputChange = async (val) => {
    setForm({ ...form, location: val });
    debouncedFetchSuggestions(val);
    await AsyncStorage.setItem("lastLocation", val);
  };

  const handleSuggestionPress = async (address) => {
    setForm({ ...form, location: address.display_name });
    setShowSuggestions(false);
    await AsyncStorage.setItem("lastLocation", address.display_name);
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <View
        className="flex-row items-center flex-1 mr-4 bg-gray-100 px-3 py-2 rounded-full"
        style={{
          borderColor: error ? "#FF0000" : "transparent",
          borderWidth: error ? 1 : 0,
        }}
      >
        <Ionicons name="location-outline" size={20} color={labelColor} />

        <TextInput
          value={form.location}
          onChangeText={handleInputChange}
          placeholder="Enter Location"
          placeholderTextColor={labelColor}
          style={{
            flex: 1,
            marginLeft: 4,
            fontSize: 16,
            paddingVertical: 0,
            color: error ? "#FF0000" : "#000",
          }}
        />

        <TouchableOpacity onPress={handleLocationPress}>
          <Ionicons
            name="navigate-outline"
            size={20}
            color={labelColor}
            style={{ marginLeft: 4 }}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onProfilePress}>
        <Ionicons name="person-circle-outline" size={36} color="#000" />
      </TouchableOpacity>

      {showSuggestions && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.place_id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleSuggestionPress(item)} style={{ flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ccc' }}>
              <Ionicons name="pin-outline" size={20} color="#000" style={{ marginRight: 8 }} />
              <Text>
                {item.display_name}
              </Text>
            </TouchableOpacity>
          )}
          style={{
            position: 'absolute',
            top: 50,
            left: 10,
            right: 10,
            backgroundColor: '#fff',
            borderRadius: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.8,
            shadowRadius: 2,
            elevation: 5,
            zIndex: 1000, // Ensure the suggestions list is on top
          }}
        />
      )}
    </View>
  );
};

export default LocationTopBar;
