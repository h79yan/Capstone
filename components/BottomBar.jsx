import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BottomBar = ({ onHomePress, onOrderPress, onCartPress, onChatPress, activeTab }) => {
  const labelColor = '#6b7280';

  //black icon/text if this tab is active, else use gray
  const getIconColor = (tabName) => {
    return activeTab === tabName ? '#000' : labelColor;
  };

  const getTextStyle = (tabName) => {
    return {
      color: activeTab === tabName ? '#000' : labelColor,
      fontSize: 12,
      fontWeight: activeTab === tabName ? 'bold' : 'normal',
    };
  };

  return (
    <View
      className="bg-white border-t border-gray-200 flex-row items-center justify-around py-8"
      style={{ borderColor: labelColor }}
    >
      {/* Home */}
      <TouchableOpacity className="items-center" onPress={onHomePress}>
        <Ionicons name="home-outline" size={24} color={getIconColor('home')} />
        <Text style={getTextStyle('home')}>Home</Text>
      </TouchableOpacity>

      {/* Order */}
      <TouchableOpacity className="items-center" onPress={onOrderPress}>
        <Ionicons name="receipt-outline" size={24} color={getIconColor('order')} />
        <Text style={getTextStyle('order')}>Order</Text>
      </TouchableOpacity>

      {/* Cart */}
      <TouchableOpacity className="items-center" onPress={onCartPress}>
        <Ionicons name="cart-outline" size={24} color={getIconColor('cart')} />
        <Text style={getTextStyle('cart')}>Cart</Text>
      </TouchableOpacity>

      {/* AI Chat */}
      <TouchableOpacity className="items-center" onPress={onChatPress}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={getIconColor('chat')} />
        <Text style={getTextStyle('chat')}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BottomBar;
