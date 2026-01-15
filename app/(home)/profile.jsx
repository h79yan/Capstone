import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackButton from '../../components/BackButton';

const Profile = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Back Button */}
      <BackButton />

      {/* Title */}
      <Text className="font-bold text-4xl text-black px-5 pt-[30]">
        User{'\n'}Profile
      </Text>

      {/* Profile Menu */}
      <View className="bg-white rounded-lg mx-5 mt-6 flex-1">
        {/* Password Change */}
        <TouchableOpacity 
          className="flex-row items-center py-4 px-5 border-b border-gray-200"
          onPress={() => router.push('/(auth)/reset-password')}
        >
          <Ionicons name="lock-closed-outline" size={24} color="black" className="mr-4" />
          <Text className="flex-1 text-lg text-black">Password Change</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>

        {/* Terms & Conditions */}
        <TouchableOpacity 
          className="flex-row items-center py-4 px-5 border-b border-gray-200"
          onPress={() => router.push('/agreement')}
        >
          <Ionicons name="document-text-outline" size={24} color="black" className="mr-4" />
          <Text className="flex-1 text-lg text-black">Terms & Conditions</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>

        {/* Contact Information */}
        <TouchableOpacity 
          className="flex-row items-center py-4 px-5 border-b border-gray-200"
          onPress={() => router.push('/(contact)/contact')}
        >
          <Ionicons name="chatbox-ellipses-outline" size={24} color="black" className="mr-4" />
          <Text className="flex-1 text-lg text-black">Contact Information</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity 
          className="flex-row items-center py-4 px-5"
          onPress={() => router.push('/sign-in')}
        >
          <Ionicons name="log-out-outline" size={24} color="black" className="mr-4" />
          <Text className="flex-1 text-lg text-black">Logout</Text>
          <Ionicons name="chevron-forward-outline" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* App Version */}
      <Text className="text-center text-gray-400 text-sm mb-10">App Version: 1.0.12</Text>
    </SafeAreaView>
  );
};

export default Profile;
