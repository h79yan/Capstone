import React, { useState } from 'react';
import { SafeAreaView, View, Text, Alert } from 'react-native';
import { router } from 'expo-router';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import LoginSection from '../../components/LoginSection';
import SocialLogin from '../../components/SocialLogin';
import BackButton from '../../components/BackButton';
import API_BASE_URL from '../../config'; 

const SignUp = () => {
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
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
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
      router.push({ pathname: '/phone-verification', params: { origin: 'SignUp', phone_number: formattedPhoneNumber } });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton />
      <Text className="font-bold text-4xl text-black px-5 pt-[50]">Create{'\n'}Account</Text>
      <PhoneNumberInput form={form} setForm={setForm} />
      <LoginSection title="Continue" onLoginPress={handleSendOTP} />
      <SocialLogin
        onGooglePress={() => console.log("Google login pressed")}
        onFacebookPress={() => console.log("Facebook login pressed")}
        onApplePress={() => console.log("Apple login pressed")}
      />
    </SafeAreaView>
  );
};

export default SignUp;
