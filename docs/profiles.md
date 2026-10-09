# Profiles

The authenticated Profile tab now shows the own-profile layout. Display name and photo come from the linked Google account via Clerk, with Clerk profile fields as fallbacks. The existing Yappr username is displayed when available; otherwise the screen says "Username not set". No username is invented from email, and no identity fields are written or edited.

The bio, counts, and photos are local sample data. Edit Profile, the photo plus, and post creation show deferred-feature notices. Settings preserves access to the existing account/sign-out page. Photo tiles open a sample-post viewer.

Public profiles live at `/explore/people/[handle]` inside the Explore stack, preserving the native bottom tabs. Open them from Home author names/photos, post-detail author names/photos, or a profile's sample follower list. Alex Rivera (`alexrivera`) reproduces the supplied public-profile reference. Other existing sample authors have profiles as well.

Follow/Following shares the existing post follow state and updates the accessible follower count. This state resets on app reload. Message renders in both states but only explains that messaging will be added later; it does not navigate to Messages or send a request.

Posts and Videos filter the displayed sample media. Saved appears as an active tab only on your own profile and reads the existing saved-post state. A public profile never reads or displays another person's saved posts. The faded bookmark is a private-content indicator. Videos and Saved have empty states.

## Verification

- `npm run test:profile`: Google identity selection, missing-field fallbacks, and no invented username.
- `npm run check:profile-ui`: rendered own/public fixtures, follow/unfollow, deferred actions, private saved state, photo viewing, and responsive screenshots. Start Expo web on port 8082, or set `PROFILE_PREVIEW_URL`.
- `npm run lint` and `npm run typecheck`.

Screenshots are in `artifacts/profiles/`. `/profile-preview` is a development-only own-profile fixture and does not bypass authentication on `/profile` or `/account`. Live Google identity rendering and native system-font scaling require signed-in device verification; fixture screenshots do not establish those results.
