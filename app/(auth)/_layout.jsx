import { View, Text } from 'react-native'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

const AuthLayout = () => {
  return (
    <>
        <Stack>
            <Stack.Screen name='sign-in' options={{ headerShown: false }} />
            <Stack.Screen name='sign-up' options={{ headerShown: false }} />
            <Stack.Screen name='phone-verification' options={{ headerShown: false }} />
            <Stack.Screen name='reset-password' options={{ headerShown: false }} />
            <Stack.Screen name='change-password' options={{ headerShown: false }} />
            <Stack.Screen name='profile-information' options={{ headerShown: false }} />
            <Stack.Screen name='phone-input' options={{ headerShown: false }} />
        </Stack>

        <StatusBar style="dark" />
    </>
  )
}

export default AuthLayout