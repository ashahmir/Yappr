import { useAuth, useSession } from '@clerk/expo';
import { Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { canAccessAccount } from '../lib/auth-state';

export function SessionNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: sessionLoaded, session } = useSession();
  if (!isLoaded || !sessionLoaded) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fbff', gap: 12 }}>
      <ActivityIndicator color="#0860ff" />
      <Text style={{ color: '#596990', fontFamily: 'Inter_400Regular' }}>Loading your session…</Text>
    </View>;
  }
  const authorized = canAccessAccount(isSignedIn, session?.status);
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f8fbff' } }}>
    <Stack.Protected guard={!authorized}><Stack.Screen name="index" /></Stack.Protected>
    <Stack.Protected guard={authorized}><Stack.Screen name="home" /><Stack.Screen name="account" /></Stack.Protected>
    <Stack.Protected guard={__DEV__}><Stack.Screen name="home-preview" /></Stack.Protected>
    <Stack.Screen name="sso-callback" />
  </Stack>;
}
