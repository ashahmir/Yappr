# Authentication welcome screen

The `/` route renders `src/components/auth-screen.tsx`, styled with React Native StyleSheet and local Inter fonts. The unused NativeWind Babel/Metro wrapper has been removed: it intercepted native components, including Pressable style callbacks, even though no screen uses className. The design reference is `Design/Auth-Screen-Ref.png`. The decorative background was recreated from that reference with imagegen; text and controls are native components, not a flattened screenshot. Portrait details and font rendering differ from the reference. The device bezel, camera, and simulated status icons are intentionally excluded; native devices display their own system status bar.

The screen measures its available container. Its centered canvas uses the available safe width, capped at 480 logical pixels on tablets. Type sizes have bounded scaling. The hero preserves the reference's width-based proportions and always starts at the top; short screens and larger text scroll instead of shrinking or cropping the artwork. Safe-area insets protect the back action and bottom controls. Artwork is anchored at the canvas left edge, independently of text padding.

The user confirmed **18+** beta copy, superseding the image’s 13+ wording.

## Scope

Google authentication is connected to Clerk; see [Clerk setup](clerk-auth.md). Public browsing and published legal documents are not connected and show dismissible availability notices. Back returns to a previous Router screen when present; at the root it shows the browsing notice. No fake session is created and no unpublished policy is presented as final.

## Preview and verification

Run `npx expo start --web --port 8082`, then `npm run check:auth-ui` in a second terminal. The capture script uses installed Google Chrome. Set `AUTH_PREVIEW_URL` for another port and `AUTH_CAPTURE` to label an iteration.

Screenshots and a side-by-side reference comparison are written to `artifacts/auth/` (gitignored). It checks eight browser sizes from 320×568 to 768×1024, including a 915×412 landscape window, dialog interactions, actual centering, button row layout, horizontal overflow, and browser runtime errors. An additional browser text enlargement check exercises reflow and footer reachability. These are Expo web captures, not native device or native font-scale verification. Short screens scroll; larger text retains normal system scaling.

Run `npm run lint` and `npm run typecheck` for static checks. The archived `example/` starter is excluded from both checks.

Native verification (2026-10-06): Expo Go 57.0.9 on the Pixel 8 Android emulator, using 390×795 and 360×640 logical viewports. Captures `artifacts/auth/android-390.png`, `android-360-top.png`, and `android-360-bottom.png` confirm the uncropped initial artwork, pill button, centered content, and reachable footer. `android-large-text.png` checks Android font scale 1.5 with scrolling and wrapping. The development-only Clerk warning toast was dismissed for the captures; it is not part of the screen design. Browser layout checks, Clerk OAuth launch/cancellation checks, lint, typecheck, and five auth unit tests also passed. These checks do not constitute a completed Google login on the user's physical phone.

After changing Babel/Metro configuration, restart Expo with `npx expo start --clear`; a fast refresh from an older server can retain the previous NativeWind transform.
