import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LoginSection = ({ title, onLoginPress }) => {
  return (
    <View className="flex-row items-center justify-between mt-4 px-6">
      {/* Log In Text */}
      <Text className="font-bold text-4xl font-bold text-black">{title}</Text>

      {/* Circular Button */}
      <TouchableOpacity
        onPress={onLoginPress}
        className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center ml-4"
      >
        <Ionicons name="arrow-forward" size={20} color="#9E9E9E" />
      </TouchableOpacity>
    </View>
  );
};

export default LoginSection;
