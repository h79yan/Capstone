import { View, Text } from 'react-native';
import React from 'react';
import { MaskedTextInput } from 'react-native-mask-text';

const PhoneNumberInput = ({ form, setForm }) => {
  return (
    <View className="font-sfpro flex-row items-end mt-10 mx-4">
      {/* Country Code Input Section */}
      <View className="w-[40px] border-b border-gray-300 mr-4 py-[10] px-[10]">
        <MaskedTextInput
          mask="+999"
          value={form.countryCode}
          onChangeText={(value) => setForm({ ...form, countryCode: value })}
          placeholder="+1"
          placeholderTextColor="#6b7280"
          keyboardType="number-pad"
          className="text-xxl text-gray-800 font-sfpro text-center pb-3 pt-2" // Increased padding for spacing
        />
      </View>
      
      {/* Phone Number Input Section */}
      <View className="flex-1 border-b border-gray-300 py-[10] px-[10]">
        {/* Phone Number Label */}
        <Text className="text-xs font-sfpro text-gray-400 mb-1">Phone Number</Text>
        
        {/* Masked Phone Number Input */}
        <MaskedTextInput
          mask="(999) 999-9999"
          value={form.phone}
          onChangeText={(value) => setForm({ ...form, phone: value })}
          placeholder="(XXX) XXX-XXXX"
          placeholderTextColor="#6b7280"
          placeholderClassName='font-sfpro text-gray-400'
          keyboardType="number-pad"
          className="text-xl font-sfpro text-gray-900 w-full pb-3 pt-2" // Increased padding for spacing
        />
      </View>
    </View>
  );
};

export default PhoneNumberInput;
