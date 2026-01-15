import React from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Redirect, router } from "expo-router";
import Background from "../components/Background";
import Button from "../components/Button";

export default function Onboarding() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <Background />
      
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center items-center px-5 pb-32">
          {/* Introductory Text */}
          <Text className="text-xl font-bold mb-5 text-center">
            Welcome to QUE Foodhall!
          </Text>
          <Text className="text-base text-gray-600 mb-10 text-center">
            The best way to enjoy your food experience. Continue to start ordering.
          </Text>

          {/* Continue Button for Sign-in */}
          <Button
            containerStyles="w-full mt-7"
            handlePress={() => router.push('/sign-in')}
            title="Continue With Phone" 
          />
        </View>
      </ScrollView>

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}
