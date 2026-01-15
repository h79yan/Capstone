import React, { useState } from "react";
import { Text, View, SafeAreaView, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const API_URL = "http://192.168.68.51:5678/api/ml/recommend";

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: "1", text: "Hello! How can I help you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    // Add user message to chat
    const newMessage = { id: Date.now().toString(), text: input, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");
    setLoading(true);

    try {
      // Send user input to API
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: input }),
      });

      const data = await response.json();
      setLoading(false);

      // Parse API response and format recommendation
      if (data.low_cal_recommendation || data.high_cal_recommendation) {
        let botResponse = "We have the following options for you!\n";

        const formatRecommendation = (recommendations) =>
          recommendations.map(
            (item) =>
              `🍽️ ${item.food_name} - 🏬 ${item.restaurant_id}\n🛒 ${item.food_type} - 🔥 ${item.estimated_calories} kcal - 💰 $${item.food_price}`
          ).join("\n\n");

        if (data.low_cal_recommendation.length > 0) {
          botResponse += `\n🌿 *Low-Calorie Options:*\n${formatRecommendation(data.low_cal_recommendation)}`;
        }
        if (data.high_cal_recommendation.length > 0) {
          botResponse += `\n🍗 *High-Calorie Options:*\n${formatRecommendation(data.high_cal_recommendation)}`;
        }

        // Add bot response to chat
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now().toString(), text: botResponse, sender: "bot" },
        ]);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { id: Date.now().toString(), text: "Sorry, no recommendations found.", sender: "bot" },
        ]);
      }
    } catch (error) {
      setLoading(false);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now().toString(), text: "Oops! Something went wrong. Please try again.", sender: "bot" },
      ]);
      console.error("API Error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <View className="flex-1 px-4 py-2">
          {/* Chat Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View className={`my-2 p-3 rounded-lg max-w-[80%] ${item.sender === "bot" ? "bg-gray-200 self-start" : "bg-blue-500 self-end"}`}>
                <Text className={`${item.sender === "bot" ? "text-black" : "text-white"} text-base`}>{item.text}</Text>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </View>

        {/* Loader */}
        {loading && (
          <View className="items-center py-2">
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        )}

        {/* Input Field */}
        <View className="flex-row items-center border-t border-gray-300 p-3">
          <TextInput
            className="flex-1 bg-gray-100 px-4 py-3 rounded-full text-base"
            placeholder="Type a message..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity onPress={handleSendMessage} className="ml-3 bg-blue-500 p-3 rounded-full">
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;