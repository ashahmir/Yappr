# Filled Home feed

Google sign-in activates the existing Clerk session. The protected navigator now opens `/home`; `/sso-callback` also redirects there. `/account` remains the profile/account destination with sign-out and a return to Home.

`src/data/demo-feed.ts` supplies two local posts matching `Design/home-authorized-ref.png`. Likes toggle locally and reset when the screen remounts. Counts, authors, locations and timestamps are fixtures. No backend, empty-user screen, posting, comments or video playback is implemented yet. Unimplemented controls show a brief explanatory dialog.

The feed uses native text, accessible pressable controls, a virtualized list and a fixed bottom bar. Reference artwork is displayed from a local image atlas: only the wordmark, avatars and media regions are clipped into their own views. The Yosemite thumbnail includes the original play artwork. Replace the atlas regions with standalone media sources when adding real data.

## Local verification

Start the development server with `npx.cmd expo start --go --port 8081`. Open `/home-preview` on web or `exp://127.0.0.1:8081/--/home-preview` in Expo Go. This development-only fixture route does not grant a session or access to `/home` or `/account`, and redirects away in production.

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:auth`
- `node scripts/check-home-ui.cjs` (server running on 8081; override with `HOME_PREVIEW_URL`)

The browser check captures four viewports, checks like toggles and placeholder interactions, and verifies signed-out access to both protected routes redirects to sign-in. Screenshot evidence is saved in `artifacts/home/` (gitignored). Real Google sign-in requires the user's account and is separate from fixture preview verification.

Verified on 2026-10-07: lint, typecheck, all five authentication tests, and the browser UI checks passed. Android screenshots were inspected at approximately 393×800 and 360×640, including scrolling and 150% system font size. The screenshot loop caught invisible inline SVG icons on Android; bundled SVG assets fixed them. Caption line breaks, header control spacing and action alignment were refined against the reference. At large font sizes, captions use natural wrapping. Platform font/emoji rendering and system safe areas still differ from the reference; this is not a pixel-identical claim. Expo Go's Tools button was hidden using its developer menu for the final capture.

Implementation references: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/), [Expo Image](https://docs.expo.dev/versions/v57.0.0/sdk/image/), [protected routes](https://docs.expo.dev/router/advanced/protected/), [safe areas](https://docs.expo.dev/versions/v57.0.0/sdk/safe-area-context/), [FlatList](https://reactnative.dev/docs/flatlist).
