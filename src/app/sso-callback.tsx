import { useAuth, useSession } from '@clerk/expo';
import { canAccessAccount } from '../lib/auth-state';
import { Link, Redirect } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function OAuthCallback() {
  const { isLoaded, isSignedIn } = useAuth();
  const { session } = useSession();
  if (isLoaded && canAccessAccount(isSignedIn, session?.status)) return <Redirect href="/home" />;
  return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 28, gap: 18 }}>
    <ActivityIndicator color="#0860ff" />
    <Text style={{ fontFamily: 'Inter_600SemiBold', color: '#030b2c', textAlign: 'center' }}>Returning to Yappr…</Text>
    <Link href="/" replace style={{ color: '#0860ff', padding: 12 }}>Return to sign in</Link>
  </View>;
}
