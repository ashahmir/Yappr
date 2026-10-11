# Create post prototype

Home and Profile header create buttons open a stack within their current native tab. The four states follow the supplied Create Post, caption, publishing, and published references. The existing Explore tab stays named Explore.

- Choose one sample photo or video thumbnail. Selecting another replaces it; clear/remove returns to an empty selection. Next requires a selection.
- Review the media and edit an optional caption up to 150 characters. Back preserves the caption and selection.
- Share Post animates demo progress, then commits one local post. Repeated presses/retries cannot duplicate a transaction. Back during publishing offers cancel; cancellation preserves the draft and does not consume the limit. Leaving the tab pauses progress; leaving the route cancels it.
- View Post opens the actual local post, with shared likes, saves, and comments. Create Another resets the composer. Local posts also appear in Home, Explore, and the author's own Profile.
- The local demo enforces five successful posts per author per device-local calendar day, 60-second / 10 MB video limits, and a 150-character caption. Limits reset with the app session; a backend must enforce real quotas.

As requested, media is a sample gallery and publishing is simulated. There is no device-library access, real upload, backend persistence, or real video playback. All local posts and their quota history disappear on full reload. The photo dimensions/file sizes shown are sample metadata. Only artwork regions from the supplied references are displayed; controls and text are native elements.

Development-only browser fixtures: `/home/create?preview=1` and `/profile/create?preview=1`. Without an authenticated session, production builds redirect these routes to sign-in. Fixtures never create an authenticated session.

Verification commands:

```powershell
npm.cmd run lint
npm.cmd run typecheck
node --test scripts/test-local-publishing.mjs
# With Expo web running on port 8082:
node scripts/check-create-post-ui.cjs
```

Browser screenshots are saved under `artifacts/create-post/`. Browser checks do not establish native keyboard, hardware Back, gesture, or signed-in device correctness.
