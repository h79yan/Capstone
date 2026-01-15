import React from 'react';
import { View, Text} from 'react-native';
import Vector1 from "../assets/images/vector1.svg"; // Black shape
import Vector2 from "../assets/images/vector2.svg"; // Red shape
import Eclipse1 from "../assets/images/eclipse1.svg"; // Blue shape

export default function Background() {
  return (
    <View className="relative w-full h-[300px]">
      {/* Render Blue Shape - Eclipse1 */}
      <View className="absolute top-[70px] right-[-50px]">
        <Eclipse1 
          width={250} 
          height={200}
        />
      </View>
      {/* Render Black Shape - Vector1 */}
      <View className="absolute top-[-70px] left-[-100px]">
        <Vector1 
          width={650} 
          height={350} 
        />
      </View>
      {/* Render Red Shape - Vector2 */}
      <View className="absolute top-[-70px] left-[-70px]">
        <Vector2 
          width={450} 
          height={200} 
        />
      </View>

        {/* Text Overlay */}
      <View className="absolute top-[140px] left-[30px]">
        <Text className="text-5xl font-bold text-white">QUE</Text>
        <Text className="text-2xl font-bold text-white">FOODHALL</Text>
      </View>
      
    </View>
    
  );
}
