import React, { useState } from "react";
import { SafeAreaView, View, Text, Alert } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BackgroundShapes from "../../components/Background";
import PhoneNumberInput from "../../components/PhoneNumberInput";
import PasswordInput from "../../components/PasswordInput";
import ForgotPasswordLink from "../../components/ForgetPassword";
import LoginSection from "../../components/LoginSection";
import SocialLogin from "../../components/SocialLogin";
import API_BASE_URL from "../../config";

const SignIn = () => {
  const [form, setForm] = useState({
    countryCode: "+1",
    phone: "",
    password: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleSignIn = async () => {
    const formattedPhoneNumber = form.phone.replace(/\D/g, "");

    if (formattedPhoneNumber.length !== 10) {
      Alert.alert("Error", "Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: formattedPhoneNumber,
          password: form.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          setPasswordError("Incorrect password");
          Alert.alert("Error", "Incorrect password");
        } else if (response.status === 404) {
          Alert.alert("Error", "Phone number not registered. Please sign up.");
        } else {
          throw new Error(errorData.detail || "Failed to sign in");
        }
        return;
      }

      const data = await response.json();
      await AsyncStorage.setItem("token", data.access_token);
      await AsyncStorage.setItem("userPhoneNumber", formattedPhoneNumber);
      Alert.alert("Success", "Sign in successful!");
      router.push("/home");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Background Shapes */}
      <BackgroundShapes />

      {/* Phone Number Input */}
      <PhoneNumberInput form={form} setForm={setForm} />

      {/* Password Input with Error */}
      <PasswordInput form={form} setForm={setForm} error={passwordError} />

      {/* Forgot Password Link */}
      <ForgotPasswordLink onPress={() => router.push("/reset-password")} />

      {/* Login Section */}
      <LoginSection title="Sign In" onLoginPress={handleSignIn} />

      {/* Social Login */}
      <SocialLogin />

      {/* Sign Up Link */}
      <View className="items-center mt-4">
        <Text className="text-gray-500 text-sm font-sfpro">
          Don’t have an account?{" "}
          <Text
            onPress={() => router.push("/sign-up")}
            className="text-red-500 font-semibold"
          >
            Sign Up
          </Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default SignIn;