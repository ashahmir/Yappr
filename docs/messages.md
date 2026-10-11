# Messages UI

The Messages native tab renders either the inbox list or the centered empty state, never both. The Requests button opens `/message-requests` in the root stack; Back returns to the inbox. Existing native tabs are preserved.

- Hold a chat for 450 ms to open the delete confirmation. Cancel, backdrop dismissal, and Android Back leave the chat intact. Confirm removes it. Screen readers have a named Delete chat accessibility action.
- Search filters names and message previews, ignoring case and surrounding whitespace. No search matches has its own state, separate from an empty inbox.
- Accept removes a request and adds its conversation to the inbox; Decline removes only the request. The pending count updates immediately. An empty requests screen appears after all requests are handled.
- Tap an inbox row or a profile Message button to open `/conversation/[id]`. Existing threads are reused by profile handle. The plus button explains how to find someone via Explore.
- New conversations require a nonblank introduction (maximum 500 characters). Sending shows the request-sent card and adds a pending inbox entry. Pending requests are read-only and cannot send again. Following alone does not bypass acceptance.
- Accepted conversations show text/photo bubbles, dates, timestamps, and a keyboard-aware composer. Local text and sample-photo messages update the inbox preview. Opening a conversation clears unread counts. The menu supports confirmed deletion.
- The attachment dialog explicitly uses a sample image; device photo uploads are not integrated.

## Data boundary

Like the existing feed/comments UI, this uses local fixtures. State survives navigation within the running app and resets on reload. There is no messaging backend, persistence, delivery, or request-sending integration yet. Small profile-photo regions were extracted from the supplied references; text and controls are native components, and empty/privacy artwork is SVG.

## Verification

Run `npx expo start --web --port 8082`, then `npm run check:messages-ui`. Override the origin with `MESSAGES_PREVIEW_URL` if necessary. Screenshots are saved in `artifacts/messages/`.

The browser check exercises long-press, cancellation, backdrop dismissal, deletion through the last chat, search, navigation, accept/decline, badges, and empty states at 360, 393, 412, and 768 pixel widths. It also captures a simulated 150% text-size layout; this is not native system font-scale verification. Run `npm run lint` and `npm run typecheck` for static checks.

Android bundle export checks JavaScript bundling, not on-device behavior. No physical device was connected during this task. Native tabs, Android Back, TalkBack actions, and native large-font settings still require a device pass.

## Conversation verification

Run `node --test scripts/test-conversations.mjs` for request-state guards and acceptance/send transitions. Run `node scripts/check-conversations-ui.cjs` against the same preview server for profile entry, pending/reopen, existing threads, text/sample-photo sends, accepted requests, responsive screenshots, and simulated large text. Screenshots: `artifacts/conversations/`. These checks do not establish native keyboard or real delivery behavior.
