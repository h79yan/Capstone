import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import API_BASE_URL from "../../config";

const PhoneInput = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [decodedPhoneNumber, setDecodedPhoneNumber] = useState(null);

  useEffect(() => {
    const fetchDecodedPhoneNumber = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        if (!token) {
          Alert.alert("Error", "No token found, please log in again.");
          router.push("/signin");
          return;
        }

        // Call API to decode the token
        const response = await fetch(`${API_BASE_URL}/api/customer/decode-token`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to decode token");
        }

        const data = await response.json();
        setDecodedPhoneNumber(data.phone_number);
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    };

    fetchDecodedPhoneNumber();
  }, []);

  const handleSavePhoneNumber = async () => {
    const formattedPhoneNumber = phoneNumber.replace(/\D/g, "");

    if (formattedPhoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number.");
      return;
    }

    if (formattedPhoneNumber !== decodedPhoneNumber) {
      Alert.alert("Error", "Phone number does not match the account. Please try again.");
      return;
    }

    await AsyncStorage.setItem("userPhoneNumber", formattedPhoneNumber);
    Keyboard.dismiss();
    router.push("/home");
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      className="flex-1 justify-center items-center px-6 bg-white"
    >
      <View className="w-full max-w-sm">
        <Text className="text-xl font-bold text-center mb-6">Enter Your Phone Number</Text>
        <TextInput
          keyboardType="number-pad"
          autoFocus
          maxLength={10}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="border border-gray-300 rounded-lg p-4 w-full text-lg text-center"
          placeholder="Enter your phone number"
        />
        <TouchableOpacity
          onPress={handleSavePhoneNumber}
          activeOpacity={0.8}
          className="bg-blue-500 p-4 rounded-lg mt-6"
        >
          <Text className="text-white text-center text-lg font-semibold">OK</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default PhoneInput;
