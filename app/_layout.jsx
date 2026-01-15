import { StyleSheet, Text, View } from 'react-native'
import { SplashScreen, Stack } from 'expo-router'
import { useFonts } from 'expo-font';
import { useEffect } from 'react'
import { StripeProvider } from '@stripe/stripe-react-native';

// Import your global CSS file
import "../global.css";

const RootLayout = () => {
    const [fontsLoaded, error] = useFonts({
        "SF-Pro": require("../assets/fonts/SF-Pro.ttf"),
    });

    useEffect(() => {
        if (error) throw error;

        if (fontsLoaded) {
        SplashScreen.hideAsync();
        }
    }, [fontsLoaded, error]);

    if (!fontsLoaded && !error) {
        return null;
    }

    return (
        <StripeProvider publishableKey="pk_test_51R0qEyAmSPkTHzPbQImxagtcEBNFHUra0Chx2pLPcz9khTAT8UIAHe77Ng9UsrHIHG9GZeSIq1fljVclnxf5SlyR00bhNWifOs"> 
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(home)" options={{ headerShown: false }} />
        </Stack>  
        </StripeProvider>
    );
}

export default RootLayout;
