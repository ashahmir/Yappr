# Yappr — Beta Implementation Plan

Prepared: 2026-10-03

Status: Planning document only. App implementation has not started as part of this task. Work through the phases below later; resolve decision gates before dependent implementation.

## 1. Product and constraints

Yappr is a general-interest social app where people discover accounts, publish image/video posts, follow others, and communicate privately. It should have a distinct identity, not be an Instagram clone.

- Android-first beta distributed as an installable APK.
- Initially target up to 20 active users.
- Open Google signup; no invitation requirement. This supersedes the earlier invite-only idea.
- Public posts and profiles accessible without signing in.
- Adults only, 18+, during the beta.
- Free service tiers are a hard requirement.
- No deadline; prioritize correctness and a complete core experience.
- Test on the user's Infinix Note 40. Confirm its actual Android version during setup; the user reported `16.3.0`.
- Group chats are a likely v2 feature.

### Required technology

- Existing Expo SDK 57 project and React Native.
- Expo Router, with route files under `src/app/`; non-route code stays outside that directory.
- Four native tabs: **Home, Messages, Explore, Profile**.
- NativeWind for styling.
- Clerk for Google authentication.
- Convex for backend logic and database.
- Expo/EAS for APK builds and distribution.

Use the existing npm setup unless explicitly changed. Follow `AGENTS.md`, consult version-matched Expo documentation before API work, and install dependencies through `expo install`. Do not silently replace the selected stack. Do not hand-create or edit generated native directories.

### Design boundary

- Final product name: **Yappr**.
- Light theme only.
- Modern, clean, minimal, mobile-first, and visually distinct.
- The user will provide design direction, logo, and accent color later.
- Typography, detailed screen composition, and visual tokens remain pending.
- Existing starter branding is not approved branding.
- Do not finalize visual screens before receiving the user's direction.

## 2. Agreed experience

### Browsing and authentication

- Visitors land in Explore and can view public posts and profiles.
- Posting, following, liking, commenting, and messaging require authentication.
- Google is the only signup/sign-in method.
- New users must choose a unique username.
- Prefill display name and avatar from Google; both remain editable. Bio is optional.
- Proposed navigation default: preserve the intended destination when an interaction prompts sign-in.
- Proposed navigation default: returning authenticated users normally land in Home; notification links open their conversation after access checks.

### Home and Explore

- Home: newest-first posts from followed accounts and the current user.
- Empty Home: a clear prompt leading to Explore.
- Explore: newest-first public media grid.
- Search by username and display name.
- Selecting a post opens its detail view and comments; selecting an account opens its profile.
- Use pagination instead of downloading the entire feed or user directory.

### Creating and managing posts

- Create buttons appear in Home and Profile headers.
- Select existing media from the device gallery; no in-app capture in v1.
- Each post contains one image or one video and an optional caption.
- Compress images before uploading.
- Videos: maximum **60 seconds and 10 MB**.
- Reject oversized videos with guidance; automatic video compression is not promised.
- Video playback starts only after tapping.
- Maximum five successful posts per account daily.
- Owners can edit captions and delete posts. Replacing media requires a new post.
- Uploads require the app to remain open and show progress/failure states with retry options.
- A failed upload must not create a visible incomplete post.

### Social interactions and profiles

- Follow/unfollow public accounts immediately.
- Like/unlike posts.
- Comments are a flat chronological list of text.
- Users can delete their own comments; no comment editing, replies, or comment likes.
- Profiles show posts, follower/following counts, and their corresponding lists.
- Editable profile fields: username, display name, avatar, and bio.

### Direct messages

- V1 supports one-to-one conversations.
- A new contact may send one text-only introduction.
- Acceptance enables text and image messages.
- Declining prevents further messages unless the recipient initiates.
- Follow relationships do not bypass message requests.
- Include unread badges and sending/sent/failed states.
- Users can unsend their own messages for both participants.
- Previously delivered notification previews cannot be recalled.
- No read receipts, typing indicators, or online status.
- Structure conversations around memberships to support future group chats without building group behavior in v1.

### Notifications

- Push notifications for accepted conversations, showing sender and message preview.
- Proposed default: use an image-message label for image-only messages.
- Opening a notification navigates to the conversation after authentication and authorization checks.
- Do not send push for pending message requests or social activity.
- Notification permission denial must not prevent in-app messaging.

### Blocking and moderation

Blocking removes follows in both directions, hides each account's content from the other while signed in, and prevents new follows, likes, comments, and messages between them. It cannot prevent viewing public content after signing out.

- Users can report posts, comments, and messages.
- Only the owner's designated account is an admin.
- Assign admin privileges securely on the backend; no role-management UI in v1.
- Provide a protected moderation screen through Profile settings.
- Admin capabilities: review reports, remove content, suspend accounts, and pause media uploads or playback.
- The moderation interface exposes only explicitly reported messages, not an unrestricted private inbox.

### Account deletion

- Provide an explicit confirmation flow.
- Remove the account's profile, posts, comments, and sent messages/media.
- Remove associated follows, likes, and device registrations.
- Preserve other conversation participants' messages.
- Coordinate Clerk identity deletion and Convex cleanup with retryable progress.
- Make the account inaccessible while deletion is underway.
- Clearly distinguish deletion in progress, completed deletion, and recoverable failure.
- Report-evidence retention is an unresolved decision; do not silently retain content contrary to the deletion promise.

### Offline behavior and privacy

- Show already-loaded content with an offline notice.
- Disable new network-dependent interactions while offline.
- Preserve unsent text for retry; persistence duration is a pending technical decision.
- Uploads require connectivity and the app to remain open.
- Standard authenticated messaging, without end-to-end encryption, is accepted for the beta.
- Admin access through the moderation interface is limited to reported messages; this is not a claim that infrastructure operators cannot access backend data.

## 3. Architecture and data responsibilities

### Client and backend

The Expo app handles navigation, presentation, media selection, local drafts, upload progress, and interaction feedback. NativeWind styles application content; native tab appearance uses the customization supported by Expo Router's native tab API.

- Clerk owns authentication identity and sessions.
- The app contains the Clerk **publishable key**.
- Convex verifies Clerk identity and enforces application authorization.
- A publishable key does not replace service/dashboard setup or backend permissions.
- Keep privileged credentials out of the APK and source control.
- Prefer Convex functions and subscriptions over introducing a separate API server.
- Convex is the source of truth for profiles and social data; Google values only seed the editable profile.
- Proposed default: Convex file storage for public media and access-controlled DM attachments.

### Core records

| Record | Essential information and relationships |
| --- | --- |
| Profile | Clerk identity, unique normalized username, display name, avatar, bio, account status |
| Post | Author, media reference/type, caption, creation/edit timestamps |
| Follow | Follower and followed account; unique pair |
| Like | User and post; unique pair |
| Comment | Author, post, text, creation timestamp |
| Conversation | Type, request state, initiator, creation timestamp |
| Membership | Conversation, user, unread/read-position metadata |
| Message | Conversation, sender, text or image, send ordering, retry identifier |
| Block | Blocking and blocked account |
| Report | Reporter, target, reason, review state |
| Device registration | User, push token, registration status |
| Admin action | Acting admin, action, target, timestamp |
| Operational settings | Upload/playback pause flags and user-facing notice |

Use stable record identifiers for relationships so username changes do not break ownership or navigation. Read-position metadata supports unread counts; it does not expose read receipts to senders.

### Enforcement and background work

- Enforce authorization inside every protected backend operation.
- Validate ownership, membership, account status, blocks, and upload limits.
- Prevent duplicate likes, follows, direct conversations, and retried message submissions.
- Separate public-media access from private DM attachment access.
- Use retryable background jobs for push delivery and cleanup.
- Remove abandoned uploads and media belonging to deleted content.
- A push failure must not lose or duplicate the underlying message.
- Recheck account access when opening stale notifications or cached screens.
- Implement bounded retries and actionable failure states, not infinite retry loops.

## 4. Implementation sequence

### Phase 1 — Verify foundations and configure services

- [ ] Inspect the starter project and preserve unrelated existing work.
- [ ] Confirm installed versions and consult version-matched documentation.
- [ ] Verify compatible Clerk, Convex, and NativeWind versions before installation.
- [ ] Configure Clerk Google authentication and its Convex integration.
- [ ] Create/connect Convex development and beta deployments.
- [ ] Configure Expo/EAS and Android application identifiers.
- [ ] Configure Android push delivery credentials.
- [ ] Document required environment variables without committing secrets.
- [ ] Verify NativeWind rendering, native tabs, authentication, and a protected Convex call.

**Exit:** The required stack works together on an Android development build.

### Phase 2 — Establish data and authorization

- [ ] Define records, indexes, pagination, and validation.
- [ ] Implement profile creation and unique username assignment.
- [ ] Enforce visitor, signed-in user, owner, participant, suspended-user, and admin boundaries.
- [ ] Establish public/private media access.
- [ ] Add idempotency for operations that can be retried.
- [ ] Test authorization directly against backend operations.

**Exit:** Restricted data and mutations remain protected independently of the UI.

### Phase 3 — Apply the approved design and build discovery

**Gate:** Receive the user's design direction before final visual implementation.

- [ ] Establish approved design tokens and reusable components.
- [ ] Implement the four native tabs and supporting detail/settings screens.
- [ ] Build visitor Explore, account search, public profiles, and onboarding.
- [ ] Implement profile editing and follower/following lists.
- [ ] Add loading, empty, error, and offline states.
- [ ] Verify accessibility labels, text sizing, and touch targets.

**Exit:** Visitors can discover content and users can complete onboarding and manage profiles.

### Phase 4 — Complete posting and social interaction

- [ ] Implement media selection, compression, validation, and uploading.
- [ ] Enforce daily posting and video limits.
- [ ] Build Home and Explore feeds with pagination.
- [ ] Implement post details, video playback, caption editing, and deletion.
- [ ] Implement follows, likes, comments, and comment deletion.
- [ ] Verify cleanup after cancellation, failure, and deletion.

**Exit:** The complete publish–discover–follow–interact journey works.

### Phase 5 — Complete messaging and push

- [ ] Implement message requests, acceptance, and decline behavior.
- [ ] Add text and private-image messaging.
- [ ] Implement unread counts, retry states, and unsending.
- [ ] Preserve unsent text for retry.
- [ ] Register devices and handle notification permission.
- [ ] Send accepted-conversation notifications with previews.
- [ ] Verify notification navigation, duplicate prevention, and expired sessions.

**Exit:** Two users can request, accept, exchange messages, and receive notifications reliably.

### Phase 6 — Complete safety and operational controls

- [ ] Implement blocking across feeds, profiles, interactions, and messaging.
- [ ] Implement reports and protected admin review.
- [ ] Implement content removal and suspension.
- [ ] Add upload/playback pause controls.
- [ ] Implement account deletion and retryable cleanup.
- [ ] Add operational logging without message bodies or authentication tokens.
- [ ] Finalize content rules, privacy wording, and beta eligibility acknowledgement.

**Exit:** The owner can operate the beta and users can control interactions and account deletion.

### Phase 7 — Validate and distribute

- [ ] Run lint and TypeScript checks.
- [ ] Run backend authorization and state-transition tests.
- [ ] Test agreed journeys with at least two accounts.
- [ ] Verify on the Infinix Note 40.
- [ ] Build and test the actual installable APK, including Google sign-in and push.
- [ ] Check service usage before inviting testers.
- [ ] Document setup, build commands, environment configuration, and known limitations.

**Exit:** A verified APK and practical maintenance instructions are ready for initial testers.

## 5. Verification checklist

- [ ] Visitor browsing works; visitors cannot mutate data or access DMs.
- [ ] Google signup, cancellation, returning sessions, and username conflicts behave correctly.
- [ ] Users cannot modify another user's posts, comments, profile, or messages.
- [ ] Feed ordering, pagination, empty states, and search behave consistently.
- [ ] Unsupported, oversized, interrupted, and duplicate uploads are handled.
- [ ] Retrying an interaction does not create duplicate records.
- [ ] Request acceptance/decline rules remain enforced through direct backend calls.
- [ ] Private images are inaccessible to nonparticipants.
- [ ] Blocking and suspension prevent interaction across all entry points.
- [ ] Unread indicators and message states remain consistent after reconnecting.
- [ ] Push works with the app backgrounded; denial and delivery failure degrade gracefully.
- [ ] Account deletion removes owned content/media and preserves others' messages.
- [ ] Admin actions are unavailable to ordinary users.
- [ ] Offline, permission-denied, slow-network, and service-limit states remain understandable.
- [ ] Lint and typecheck pass before declaring implementation complete.

Use the current npm-compatible commands for lint and typecheck (`npx expo lint`, `npx tsc --noEmit`; use `.cmd` executables when required by PowerShell policy). Do not claim device verification or passing checks without recording actual results.

## 6. Assumptions and decision gates

### Proposed defaults, not individually confirmed product choices

- Convex file storage for uploaded media.
- English-only beta, with accessible labels, readable contrast, and system text-size support.
- Separate development and beta data/configuration.
- Manual APK releases initially.
- Daily posting allowance measured by UTC calendar day; deleting a post does not restore the allowance.
- Backend-maintained operational switches for feature pauses.
- Preserve intended navigation through sign-in; Home is the returning-user landing tab.
- Image-only push uses a descriptive label instead of an attachment URL.
- Operational logs cover failures, push attempts, moderation, and quota monitoring without message bodies or authentication tokens.
- No extra scope for bookmarks, hashtags, mentions, post sharing, or message editing.

Free tiers are confirmed, not an assumption: do not enable paid upgrades or metered paid plans without explicit approval.

### Resolve before dependent implementation

- Visual references, colors, typography, logo, and final screen composition.
- Exact compatible dependency versions.
- Image dimensions, image/DM file limits, supported video formats, and media-validation approach.
- Username and text-length validation limits.
- Report-evidence retention when reported content is deleted or unsent.
- Exact offline draft persistence behavior and cleanup on logout/account changes.
- Clerk, Convex, EAS, Google, and push configuration details.
- Android package identifier and admin account identity.
- Content rules, privacy wording, and age-eligibility acknowledgement.

## 7. Risks and exclusions

### Known risks

- Free capacity cannot guarantee continuous service for public media.
- Upload caps reduce usage but do not limit repeated public downloads.
- Provider limits may affect the entire backend despite application feature pauses.
- The owner must monitor usage and respond to moderation reports.
- Standard authenticated DMs are not end-to-end encrypted.
- Push previews can remain visible after a message is unsent.
- A blocked account can view public posts after signing out.
- Visual completion depends on the user's forthcoming design direction.
- Dependency compatibility and end-to-end service configuration remain unverified.

The pricing review during planning listed 1 GB file storage and 1 GB data egress in Convex's free allowance. Treat these as a dated snapshot, not a permanent guarantee. Recheck current quotas and account-wide usage before implementation and distribution. Convex documents possible backend failures after prolonged free-tier overuse.

### Outside v1

- iOS or web release; Android-first does not remove the cross-platform coding requirement.
- Dark theme.
- Private accounts.
- Stories, dedicated Reels feed, and live streaming.
- Group chats, voice/video calls, and monetization.
- Read receipts, typing indicators, and online status.
- In-app camera capture.
- Background uploading and offline posting.
- Comment replies, likes, or editing.
- Social-activity notifications.
- Personalized recommendation algorithms.

Group chats should influence conversation structure without adding group-chat UI or behavior to v1.

## 8. Official references

Consult current documentation again when implementation begins; versions and quotas may change.

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/)
- [Expo documentation index and corrections](https://docs.expo.dev/llms.txt)
- [Expo Router](https://docs.expo.dev/router/introduction.md)
- [EAS](https://docs.expo.dev/eas/index.md)
- [Clerk Expo quickstart](https://clerk.com/docs/expo/getting-started/quickstart)
- [Clerk integration with Convex](https://docs.convex.dev/auth/clerk)
- [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)
- [Convex pricing](https://www.convex.dev/pricing)
- [Convex pricing FAQ and limit behavior](https://www.convex.dev/pricing/faq)
- [Expo plans](https://docs.expo.dev/billing/plans/)
