import { useClerk, useUser } from '@clerk/expo';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AccountScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const insets = useSafeAreaInsets();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try { await signOut(); }
    catch { setError('Couldn’t sign out. Check your connection and try again.'); }
    finally { setBusy(false); }
  }

  return <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 }]}>
    <View style={styles.card}>
      <Pressable accessibilityRole="button" onPress={() => router.replace('/home')} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: '#0860ff', fontFamily: 'Inter_600SemiBold' }}>Back to Home</Text></Pressable>
      <Text style={styles.brand}>Yappr.</Text>
      {user?.imageUrl ? <Image source={{ uri: user.imageUrl }} style={styles.avatar} accessibilityLabel="Your profile photo" /> : null}
      <Text accessibilityRole="header" style={styles.title}>Welcome, {user?.firstName || user?.username || 'Yapper'}.</Text>
      <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      <Text style={styles.description}>You’re signed in. Your Yappr account is ready for what comes next.</Text>
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
      <Pressable accessibilityRole="button" accessibilityState={{ disabled: busy, busy }} disabled={busy} onPress={handleSignOut} style={({ pressed }) => [styles.button, { opacity: busy || pressed ? 0.65 : 1 }]}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonLabel}>Sign out</Text>}
      </Pressable>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28, backgroundColor: '#f8fbff' },
  card: { width: '100%', maxWidth: 420, alignItems: 'center', gap: 20 },
  brand: { fontFamily: 'Inter_800ExtraBold', fontSize: 30, color: '#0860ff', marginBottom: 20 },
  avatar: { width: 88, height: 88, borderRadius: 44 },
  title: { fontFamily: 'Inter_800ExtraBold', fontSize: 30, textAlign: 'center', color: '#030b2c' },
  email: { fontFamily: 'Inter_400Regular', fontSize: 15, textAlign: 'center', color: '#596990' },
  description: { fontFamily: 'Inter_400Regular', fontSize: 17, lineHeight: 26, textAlign: 'center', color: '#596990' },
  error: { color: '#b42318', textAlign: 'center', fontFamily: 'Inter_400Regular' },
  button: { backgroundColor: '#0860ff', borderRadius: 999, minHeight: 52, width: '100%', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  buttonLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 17, color: '#fff' },
});
