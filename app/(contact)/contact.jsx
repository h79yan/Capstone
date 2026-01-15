import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, Alert, Linking, ActionSheetIOS, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/BackButton';

const customerServicePhone = "+1 (519)-857-2246";
const customerServiceEmail = "wutongliuxue@gmail.com"; // Replace with your actual email

const Contact = () => {
  
  const handlePhoneCall = () => {
    if (Platform.OS === 'ios') {
      // Show Action Sheet on iOS
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [`Call ${customerServicePhone}`, "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) {
            Linking.openURL(`tel:${customerServicePhone}`);
          }
        }
      );
    } else {
      // ThatDirect Call for Android
      Alert.alert(
        "Confirm Call",
        `Call ${customerServicePhone}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Call", onPress: () => Linking.openURL(`tel:${customerServicePhone}`) }
        ]
      );
    }
  };

    const handleEmailSupport = () => {
    const subject = encodeURIComponent("Customer Support Inquiry");
    const body = encodeURIComponent("Hello, I need help with...");
    const mailtoURL = `mailto:${customerServiceEmail}?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoURL).catch((err) => 
        Alert.alert("Error", "Could not open email client")
    );
    };


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView className="flex-1 bg-white relative">
        <BackButton />

        <ScrollView className="flex-1">
          {/* Header */}
          <View className="px-5 pt-16">
            <Text className="text-4xl font-bold">Contact</Text>
            <Text className="text-4xl font-bold mb-5">Information</Text>
          </View>

          {/* Contact Options */}
          <View className="bg-white mx-5 rounded-lg shadow-sm overflow-hidden">
            {/* Customer Service via Phone */}
            <TouchableOpacity className="flex-row items-center px-5 py-4 border-b border-gray-200" onPress={handlePhoneCall}>
              <Ionicons name="call-outline" size={22} color="black" className="mr-4" />
              <Text className="flex-1 text-lg text-black">Customer Service via Phone</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="black" />
            </TouchableOpacity>

            {/* Customer Service via Email */}
            <TouchableOpacity 
            className="flex-row items-center px-5 py-4" 
            onPress={handleEmailSupport}
            >
            <Ionicons name="mail-outline" size={22} color="black" className="mr-4" />
            <Text className="flex-1 text-lg text-black">Customer Service via Email</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="black" />
            </TouchableOpacity>


          </View>
        </ScrollView>

        {/* App Version */}
        <Text className="text-center text-gray-400 text-sm mb-5">App Version: 1.0.12</Text>
      </SafeAreaView>
    </>
  );
};

export default Contact;
