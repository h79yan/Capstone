import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import LoginSection from '../../components/LoginSection';
import EyeIcon from '../../assets/images/eye.svg'; // Ensure the path to the icon is correct
import BackButton from '../../components/BackButton';
import API_BASE_URL from '../../config'; 

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { phone_number } = useLocalSearchParams(); // Retrieve `phone_number` from the query parameters

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone_number,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Change Password error:', errorData);
        if (errorData.detail === 'New password cannot be the same as the current password') {
          Alert.alert('Error', 'New password cannot be the same as the current password');
        } else {
          throw new Error(errorData.detail || 'Failed to change password');
        }
        return;
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      router.push('/sign-in');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton />
      {/* Title */}
      <Text className="font-bold text-4xl text-black px-5 pt-[50]">Reset{'\n'}Password</Text>

      {/* New Password Input */}
      <View className="px-5 mt-6 mb-4 relative">
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry={!showNewPassword}
          placeholder="New Password"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
        <TouchableOpacity
          onPress={() => setShowNewPassword(!showNewPassword)}
          style={{ position: 'absolute', right: 20, bottom: 8 }}
        >
          <EyeIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Confirm New Password Input */}
      <View className="px-5 mb-8 relative">
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm New Password"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          style={{ position: 'absolute', right: 20, bottom: 8 }}
        >
          <EyeIcon width={20} height={20} />
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <LoginSection title="Continue" onLoginPress={handleChangePassword} />
    </SafeAreaView>
  );
};

export default ChangePassword;
