import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import LoginSection from '../../components/LoginSection';
import BackButton from '../../components/BackButton';
import API_BASE_URL from '../../config'; 

const PhoneVerification = () => {
  const [code, setCode] = useState(["", "", "", "", "", ""]); 
  const { phone_number, origin } = useLocalSearchParams();

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    // Automatically focus on the next input if available
    if (text && index < code.length - 1) {
      const nextInput = `codeInput${index + 1}`;
      this[nextInput].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      // Clear the previous field and move focus to it
      const newCode = [...code];
      newCode[index - 1] = "";
      setCode(newCode);
      const previousInput = `codeInput${index - 1}`;
      this[previousInput].focus();
    }
  };

  const handleResend = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Send OTP error:', errorData);
        throw new Error(errorData.detail || 'Failed to send OTP');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleConfirm = async () => {
    try {
      const otp = code.join('');
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone_number, otp }),
      });

      if (!response.ok) {
        throw new Error('Invalid OTP');
      }

      const data = await response.json();
      Alert.alert('Success', data.message);
      if (origin === 'SignUp') {
        //check if this line of code is reached 
        console.log('SignUp is reached');

        router.push({ pathname: '/profile-information', params: { phone_number } });
      } else if (origin === 'resetPassword') {
        router.push({ pathname: '/change-password', params: { phone_number } });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <BackButton />
      <Text className="font-bold text-4xl font-bold text-black px-5 pt-[50]">
        Phone{'\n'}Verification
      </Text>
      <Text className="font-sfpro text-xs text-gray-600 mb-8 px-5 pt-3">Phone Number {phone_number}</Text>
      <View className="flex-row justify-between mb-6 px-3 py-2">
        {code.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            ref={(input) => { this[`codeInput${index}`] = input }}
            className="font-sfpro border-b border-gray-400 text-2xl text-center w-[50] px-2 py-2"
          />
        ))}
      </View>
      <View className="flex-row justify-left mb-8 px-4">
        <Text className="font-sfpro text-gray-600">Don’t receive code? </Text>
        <TouchableOpacity onPress={handleResend}>
          <Text className="font-sfpro text-black font-semibold underline">Resend</Text>
        </TouchableOpacity>
      </View>
      <LoginSection title="Confirm" onLoginPress={handleConfirm} />
    </SafeAreaView>
  );
};

export default PhoneVerification;
