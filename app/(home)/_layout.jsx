import React from "react";
import { View } from "react-native";
import { router, Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BottomBar from "../../components/BottomBar";

const HomeLayout = () => {
  const pathname = usePathname();

  //active tab based on the current route pathname
  let activeTab = "";
  if (pathname.includes("order-history")) {
    activeTab = "order";
  } else if (pathname.includes("home")) {
    activeTab = "home";
  } else if (pathname.includes("cart")) {
    activeTab = "cart";
  } else if (pathname.includes("chat")) {
    activeTab = "chat";
  }

  const handleHomePress = () => {
    router.push("home");
  };
  const handleOrderPress = () => {
    router.push("order-history");
  };
  const handleCartPress = () => {
    router.push("cart");
  }
  const handleChatPress = () => {
    router.push("chat");
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Stack for screens */}
      <View style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="order-history" options={{ headerShown: false }} />
          <Stack.Screen name="cart" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="order-details" options={{ headerShown: false, title: 'Order Details' }} />
        </Stack>
      </View>

      {pathname !== "/profile" && (
        <BottomBar
          onHomePress={handleHomePress}
          onOrderPress={handleOrderPress}
          onCartPress={handleCartPress}
          onChatPress={handleChatPress}
          activeTab={activeTab}
        />
      )}

      <StatusBar style="dark" />
    </View>
  );
};

export default HomeLayout;