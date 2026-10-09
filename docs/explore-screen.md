# Explore and post detail

Explore is public at `/explore`, including the **Browse without an account** entry on the sign-in screen. The main tab group uses Expo Router native tabs on Android and iOS. Expo's web fallback is positioned at the bottom with a small web-only stylesheet. Home and Profile retain active-session checks; Messages remains a placeholder.

`src/components/explore-screen.tsx` contains the two-column list, text search, category selection, and photo/video filter. `src/data/explore-posts.ts` contains the local fixtures. Artwork comes from clean image regions of the supplied references; screen text and interactive controls are rendered separately. No remote media service is used.

Both Home media cards and Explore tiles open `/post/[id]`, implemented in `src/components/post-detail.tsx`. The detail screen has back navigation, author information, caption, location, local follow/like/save toggles, and the system share action. `PostStateProvider` shares demo state across screens during the current app session. This is not persisted or connected to a backend. Video thumbnails and comments/options display explicit demo notices; there is no playable video fixture yet.

Verification commands:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:auth
node scripts/check-explore-ui.cjs
```

The browser check expects Metro at `http://localhost:8081`; set `HOME_PREVIEW_URL` to use another port. It covers responsive screenshots, filters, empty results, routing from both feeds, state continuity, invalid IDs, and signed-out route guards. Screenshots are written to `artifacts/explore/`.

Native tab dimensions, status bars, font rasterization, and dummy artwork crops vary from the reference. Browser screenshots alone do not verify native tab rendering or iOS behavior.

## Verified

- Lint, TypeScript, and all five auth logic tests pass.
- `check-explore-ui.cjs`, `check-home-ui.cjs`, and `check-auth-ui.cjs` pass, including the updated guest entry and shared detail navigation.
- The x86_64 Android development build succeeds. Native screenshots were inspected at approximately 393×698 and 360×640 logical sizes, plus 150% Android font scale. Native like/follow/save toggles, back navigation, and Messages/Explore tab switching were checked with UIAutomator.
- The screenshot loop corrected Android SVG rendering, content hidden behind the native tab bar, and the back button scrolling under the status bar.
- Reference comparisons: `artifacts/explore/explore-comparison.png` and `artifacts/explore/detail-comparison.png`. Small-screen and large-text captures are in the same folder. iOS and a fresh Google sign-in were not tested.
