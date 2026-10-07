import { useAuth, useSSO } from '@clerk/expo';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { activateGoogleSession } from '../lib/auth-state';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const { isLoaded } = useAuth();
  const { startSSOFlow } = useSSO();
  const running = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync().catch(() => undefined);
    return () => { void WebBrowser.coolDownAsync().catch(() => undefined); };
  }, []);

  async function signIn() {
    if (!isLoaded || running.current) return;
    running.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: makeRedirectUri({ scheme: 'yappr', path: 'sso-callback' }),
      });
      const outcome = await activateGoogleSession(result);
      // The navigator reacts to Clerk's confirmed session state; don't race
      // provider updates by navigating into a route that is still protected.
      if (outcome === 'incomplete') {
        // Never treat an incomplete OAuth attempt as an authenticated session.
        setError('Google sign-in needs additional verification. Please try again or contact Yappr support.');
      }
    } catch {
      // Do not expose SDK responses, account details, or tokens in logs or UI.
      setError('We couldn’t sign you in. Check your connection and try again.');
    } finally {
      running.current = false;
      setBusy(false);
    }
  }

  return { signIn, busy, error, ready: isLoaded };
}
