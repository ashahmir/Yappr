import { useState } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGoogleSignIn } from '../hooks/use-google-sign-in';

type Notice = 'guest' | 'terms' | 'privacy';
const notices: Record<Notice, { title: string; body: string }> = {
  guest: { title: 'A little more to come', body: 'Public browsing is coming soon. You’ll be able to explore Yappr without an account.' },
  terms: { title: 'Terms of Service', body: 'Our beta terms are being prepared. Account creation will open once they’re available.' },
  privacy: { title: 'Privacy Policy', body: 'Our privacy policy is being prepared. Account creation will open once it’s available.' },
};

export default function AuthScreen() {
  const google = useGoogleSignIn();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [container, setContainer] = useState({ width, height });
  const canvasWidth = Math.min(container.width - insets.left - insets.right, 480);
  const scale = Math.min(1.1, Math.max(0.85, canvasWidth / 390));
  const bottomPadding = Math.max(insets.bottom, 24);
  // Preserve the reference composition; short screens scroll instead of cropping it.
  const heroHeight = canvasWidth * (401 / 390);

  return (
    <View style={styles.root} onLayout={({ nativeEvent: { layout } }) => {
      setContainer(previous => previous.width === layout.width && previous.height === layout.height
        ? previous : { width: layout.width, height: layout.height });
    }}>
      <ScrollView testID="auth-scroll" style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingLeft: insets.left, paddingRight: insets.right }]} showsVerticalScrollIndicator={false} contentInsetAdjustmentBehavior="never">
        <View testID="auth-canvas" style={[styles.canvas, { width: canvasWidth, minHeight: container.height, paddingBottom: bottomPadding }]}>
          <Image source={require('../../assets/images/auth-background.png')} contentFit="fill" accessible={false} style={{ position: 'absolute', left: 0, top: 0, width: canvasWidth, height: canvasWidth * 2.12 }} />
          <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.canGoBack() ? router.back() : setNotice('guest')} style={({ pressed }) => [styles.back, pressed && styles.pressed, { top: Math.max(insets.top + 8, 44 * scale), left: 12 * scale, width: 44, height: 44 }]}>
            <View style={{ width: 12 * scale, height: 12 * scale, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: '#101820', transform: [{ rotate: '45deg' }] }} />
          </Pressable>
          <View style={{ height: heroHeight, pointerEvents: 'none' }} />
          <View testID="auth-content" style={[styles.content, { paddingHorizontal: 27 * scale }]}>
            <Text accessibilityRole="header" style={[styles.title, { fontSize: 43 * scale, lineHeight: 43 * scale, letterSpacing: -1.8 * scale }]}>
              Welcome to{'\n'}Yappr<Text style={styles.brand}>.</Text>
            </Text>
            <Text style={[styles.subtitle, { marginTop: 14 * scale, fontSize: 19.5 * scale, lineHeight: 25 * scale, letterSpacing: -0.65 * scale }]}>
              Real people. Real moments.{'\n'}A more human social experience.
            </Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Continue with Google" accessibilityState={{ disabled: google.busy || !google.ready, busy: google.busy }} disabled={google.busy || !google.ready} onPress={google.signIn} testID="google-button" style={({ pressed }) => [styles.googleButton, (pressed || google.busy) && styles.pressed, { marginTop: 28 * scale, minHeight: 60 * scale, paddingVertical: 12 * scale, paddingHorizontal: 27 * scale, boxShadow: '0px 3px 9px rgba(53, 92, 165, 0.08)' }]}>
              <Image source={require('../../assets/images/google.svg')} contentFit="contain" accessible={false} style={{ width: 31 * scale, height: 31 * scale }} />
              <Text style={[styles.googleLabel, { fontSize: 18.5 * scale, letterSpacing: -0.65 * scale, marginLeft: 20 * scale }]}>{google.busy ? 'Connecting…' : 'Continue with Google'}</Text>
            </Pressable>
            {google.error ? <Text accessibilityRole="alert" style={{ color: '#b42318', textAlign: 'center', fontFamily: 'Inter_400Regular', marginTop: 12 }}>{google.error}</Text> : null}
            <Text style={[styles.legal, { marginTop: 17 * scale, fontSize: 13.2 * scale, lineHeight: 20 * scale, letterSpacing: -0.25 * scale }]}>
              By continuing, you agree to our{'\n'}
              <Text accessibilityRole="link" onPress={() => setNotice('terms')} style={styles.legalLink}>Terms of Service</Text>
              {' and '}
              <Text accessibilityRole="link" onPress={() => setNotice('privacy')} style={styles.legalLink}>Privacy Policy.</Text>
            </Text>
            <Text style={[styles.legal, { marginTop: 8 * scale, fontSize: 13.2 * scale, lineHeight: 20 * scale, letterSpacing: -0.2 * scale }]}>You must be 18+ to join Yappr Beta.</Text>
            <Pressable accessibilityRole="button" onPress={() => setNotice('guest')} style={({ pressed }) => [styles.guestButton, pressed && styles.pressed, { marginTop: 7 * scale, minHeight: 44, paddingHorizontal: 8 }]}>
              <Text style={[styles.guestLabel, { fontSize: 16 * scale, lineHeight: 23 * scale, letterSpacing: -0.6 * scale }]}>Browse without an account</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      <Modal visible={notice !== null} transparent animationType="fade" onRequestClose={() => setNotice(null)}>
        <View style={styles.modalBackdrop}>
          <View accessibilityViewIsModal style={styles.modalCard}>
            <Text accessibilityRole="header" style={styles.modalTitle}>{notice ? notices[notice].title : ''}</Text>
            <Text style={styles.modalBody}>{notice ? notices[notice].body : ''}</Text>
            <Pressable accessibilityRole="button" onPress={() => setNotice(null)} style={({ pressed }) => [styles.modalButton, pressed && styles.pressed]}>
              <Text style={styles.modalButtonLabel}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Essential styles are native on every platform, independent of CSS interop startup.
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#eef4fd' },
  scroll: { flex: 1, width: '100%' },
  scrollContent: { alignItems: 'center', flexGrow: 1 },
  canvas: { position: 'relative', overflow: 'hidden', backgroundColor: '#f8fbff' },
  content: { width: '100%', alignItems: 'center' },
  back: { position: 'absolute', zIndex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { textAlign: 'center', fontFamily: 'Inter_800ExtraBold', color: '#030b2c' },
  brand: { color: '#0860ff' },
  subtitle: { textAlign: 'center', fontFamily: 'Inter_400Regular', color: '#424f77' },
  googleButton: { width: '100%', flexDirection: 'row', alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: '#e8eefc', backgroundColor: 'rgba(255,255,255,0.9)' },
  googleLabel: { flex: 1, flexShrink: 1, textAlign: 'center', fontFamily: 'Inter_600SemiBold', color: '#030b2c' },
  legal: { textAlign: 'center', fontFamily: 'Inter_400Regular', color: '#596990' },
  legalLink: { fontFamily: 'Inter_600SemiBold', color: '#404f77' },
  guestButton: { alignItems: 'center', justifyContent: 'center' },
  guestLabel: { textAlign: 'center', fontFamily: 'Inter_600SemiBold', color: '#0860ff' },
  pressed: { opacity: 0.65 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)', padding: 28 },
  modalCard: { width: '100%', maxWidth: 384, borderRadius: 24, padding: 28, backgroundColor: '#fff' },
  modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: '#030b2c' },
  modalBody: { marginTop: 12, fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#596990' },
  modalButton: { marginTop: 24, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 999, backgroundColor: '#0860ff' },
  modalButtonLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: '#fff' },
});
