# Clerk authentication

The existing Google button signs users in or creates their Clerk account through Google OAuth. A confirmed, active Clerk session unlocks `/account`, showing the Google profile photo, name, email, and sign-out action. Loading, duplicate taps, cancellation, errors, and incomplete verification are handled without creating a fake signed-in state. Native sessions use Clerk's `expo-secure-store` token cache.

## Linked development application

- Clerk application: `app_3KHGWAXmBvmnk6OB8zBtC3ztYGK` (Yappr).
- Google is the only configured sign-in strategy; Native API is enabled.
- Native build return URL: `yappr://sso-callback`, registered in Clerk.
- Registered local callbacks: `http://localhost:8082/sso-callback` and `exp://192.168.100.35:8081/--/sso-callback` / `exp://192.168.100.35:8082/--/sso-callback`. Update the Expo Go entries if the LAN address changes.
- The local `.env` supplies `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`. Its contents are not committed. Use `.env.example` on a new checkout.
- A Clerk secret key is not required in this mobile client. The CLI doctor may warn that it is absent; do not add it to the app bundle.

## Run and verify

Run `npx expo start --clear --port 8082`. Secure Store and AuthSession are bundled Expo modules. A development build uses the stable `yappr` scheme. Expo Go uses an `exp://<LAN-host>:<port>/--/sso-callback` URL; that exact URL must be registered under Clerk Native applications → Redirect URLs when the host or port changes. Web uses `http://localhost:8082/sso-callback` for local verification.

Run `npm run test:auth`, `npm run lint`, `npm run typecheck`, `npm run check:clerk-auth`, and `npm run check:auth-ui`. The browser scripts need the server above and installed Google Chrome. Set `AUTH_PREVIEW_URL` to use a different origin. `test:auth` uses Node's built-in TypeScript stripping (Node 22.18+).

The browser check covers signed-out deep-link protection, opening Google's actual OAuth page, cancellation, and signed-out reload. It does not complete Google login. On the device, complete Google login, confirm your profile appears, close and reopen the app to check session persistence, then sign out and confirm `/account` is no longer accessible. Also cancel one sign-in attempt and verify you can retry.

## Boundaries

This is authentication and client route protection. No backend data API exists yet. Future Convex functions must validate Clerk identity and enforce access/ownership server-side; a client route guard is not data authorization. Public feeds, Convex profile records, unique username onboarding, final legal documents, and production Clerk/EAS setup remain separate work. Additional MFA or signup requirements fail closed; if enabled later, their completion UI must be implemented before enabling those requirements for users.

## Verification — 2026-10-06

- Passed Expo lint, TypeScript, five auth state tests, and Android production bundle export.
- Live browser test passed signed-out deep-link protection, Google's OAuth launch, cancellation recovery, and signed-out reload without runtime errors.
- Eight viewport sizes and enlarged-text layout checks passed.
- Clerk doctor confirmed the linked application and CLI login. Its missing-secret-key warning does not apply to this client-only integration; production is not configured.
- A completed real Google login, native session persistence after restart, and native sign-out still require the user's device check. No user account or session was fabricated to pass tests.

References: [Clerk Expo quickstart](https://clerk.com/docs/expo/getting-started/quickstart), [Clerk useSSO](https://clerk.com/docs/expo/reference/native-hooks/use-sso), [Expo protected routes](https://docs.expo.dev/router/advanced/protected/).
