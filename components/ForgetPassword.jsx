import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const ForgotPasswordLink = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} className="mt-2 p-4">
      <Text className="text-black text-base font-sfpro underline text-left">Forgot Password?</Text>
    </TouchableOpacity>
  );
};

export default ForgotPasswordLink;
