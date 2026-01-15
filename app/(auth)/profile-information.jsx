import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import LoginSection from '../../components/LoginSection';
import EyeIcon from '../../assets/images/eye.svg';
import BackButton from '../../components/BackButton';
import API_BASE_URL from '../../config'; 

const ProfileInformation = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { phone_number } = useLocalSearchParams();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    // Convert phone number to string format
    const formattedPhoneNumber = phone_number.replace(/\D/g, '');
  
    // Log the data to be sent
    console.log('Signup Data:', {
      manager_account_name: name,
      manager_account_password: password,
      email: email,
      phone_number: formattedPhoneNumber,
    });
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          manager_account_name: name,
          manager_account_password: password,
          phone_number: formattedPhoneNumber,
          email: email,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Signup error:', errorData);
        throw new Error(errorData.detail || 'Sign-up failed');
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
      <Text className="font-bold text-4xl text-black px-5 pt-[50]">
        Profile{'\n'}Information
      </Text>
      <View className="px-5 mt-6">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
      </View>
      <View className="px-5 mt-2 mb-4">
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          keyboardType="email-address"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
      </View>
      <View className="px-5 mb-4">
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholder="Password"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          className="absolute right-7 bottom-4"
        >
          <EyeIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
      <View className="px-5 mb-8">
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Confirm Password"
          className="border-b border-gray-400 text-gray-800 px-2 py-2 font-sfpro text-base"
        />
        <TouchableOpacity
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-7 bottom-4"
        >
          <EyeIcon width={20} height={20} />
        </TouchableOpacity>
      </View>
      <LoginSection title="Continue" onLoginPress={handleSignUp} />
    </SafeAreaView>
  );
};

export default ProfileInformation;
