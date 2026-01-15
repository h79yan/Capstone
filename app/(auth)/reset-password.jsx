import React, { useState } from 'react';
import { SafeAreaView, View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import LoginSection from '../../components/LoginSection';
import BackButton from '../../components/BackButton';
import API_BASE_URL from '../../config'; 

const ResetPassword = () => {
  const [form, setForm] = useState({
    countryCode: "+1",
    phone: "",
  });

const handleSendOTP = async () => {
  // Ensure the phone number is formatted correctly
  const formattedPhoneNumber = form.phone.replace(/\D/g, '');

  // Validate the phone number
  if (formattedPhoneNumber.length !== 10) {
    Alert.alert('Error', 'Please enter a valid 10-digit phone number');
    return;
  }

  // Log the data to be sent
  console.log('Send OTP Data:', {
    phone_number: formattedPhoneNumber,
  });

  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/request-password-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone_number: formattedPhoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Send OTP error:', errorData);
      throw new Error(errorData.detail || 'Failed to send OTP');
    }

    const data = await response.json();
    Alert.alert('Success', data.message);
    router.push({ pathname: '/phone-verification', params: { origin: 'resetPassword', phone_number: formattedPhoneNumber } });
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};


  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton />
      
      {/* Title */}
      <Text className="font-bold text-4xl font-bold text-black px-5 pt-[50]">Reset{'\n'}Password</Text>
      <Text className="font-sfpro text-xs text-gray-600 px-5 pt-3">Reset password via phone number</Text>

      {/* Phone Number Input */}
      <View className="px-5 mb-5">
        <PhoneNumberInput form={form} setForm={setForm} />
      </View>

      {/* Continue Button */}
      <LoginSection 
        title={"Continue"} 
        onLoginPress={handleSendOTP} 
      />
    </SafeAreaView>
  );
};

export default ResetPassword;
