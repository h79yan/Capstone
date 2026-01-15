import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import EyeIcon from '../assets/images/eye.svg'; // Update the path as needed

const PasswordInput = ({ form, setForm, error }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const labelColor = error ? '#FF0000' : '#6b7280'; // Red if error, gray otherwise

  return (
    <View className="mx-4 mt-4">
      {/* Password Label (Changes to error message if there's an error) */}
      <Text className="text-xs mb-1" style={{ color: labelColor }}>
        {error ? "Incorrect Password" : ""}
      </Text>

      <View className="flex-row items-center border-b" style={{ borderColor: error ? '#FF0000' : '#D1D5DB' }}>
        <View className="flex-1">
          {/* Password Input */}
          <TextInput
            secureTextEntry={!isPasswordVisible}
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            placeholder="Password"
            placeholderTextColor={labelColor}
            placeholderClassName='text-xs text-gray-400 mb-1'
            style={{
              fontSize: 18,
              paddingVertical: 8,
              color: error ? '#FF0000' : '#000', // Red text if error
            }}
          />
        </View>

        {/* Toggle Visibility Icon */}
        <TouchableOpacity onPress={togglePasswordVisibility} style={{ padding: 4 }}>
          <EyeIcon width={24} height={24} fill={labelColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PasswordInput;
