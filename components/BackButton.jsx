import React from 'react';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import BackIcon from '../assets/images/back.svg'; // Ensure this path is correct

const BackButton = ({ className = "top-[20px] left-[10px] w-12 h-12 justify-center items-center" }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        console.log("Back button pressed");
        router.back();
      }}
      className={className} 
    >
      <BackIcon width={24} height={24} />
    </TouchableOpacity>
  );
};

export default BackButton;
