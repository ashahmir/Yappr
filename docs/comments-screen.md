# Comments demo

Open comments from the speech-bubble button on Home or any post detail.

- **Populated + replies:** Jamie's Santorini post (`/comments/jamie-santorini`). Expand Chris's reply or tap Reply on any comment.
- **Empty:** Amalfi, the second Explore post (`/comments/amalfi`). Sending a comment replaces the empty state.
- **Own-comment menu:** Golden hour, the dog photo in Explore (`/comments/golden-hour`). Tap the ellipsis, then Delete comment to reach the empty state.

Taylor Kim is the local demo author for both comments and replies, independent of the signed-in Clerk account. The reference's own-comment state uses a different name for the same avatar; this demo keeps one consistent identity. Other authors' menus offer Reply, never Delete.

Likes, new comments, replies, and deletions persist across navigation during the current app session, and reset on a full reload. Counts in Home and post detail include replies and reflect the actual fixtures. Deleting an owned parent removes its replies. Photo attachment uses a selectable local sample, not the device gallery or uploads. There is no backend persistence yet.

The supplied artwork is used only for photo regions; all labels, controls, lists, and menus are native UI. The empty illustration and icons are SVG assets. No new dependency or native rebuild is required.

## Verification

With Metro running on port 8081:

```powershell
npm.cmd run lint
npm.cmd run typecheck
node scripts/check-comments-ui.cjs
node scripts/check-home-ui.cjs
node scripts/check-explore-ui.cjs
```

The comments check saves mobile and tablet web screenshots in `artifacts/comments/`, exercises comment/reply sending, likes, ownership, parent deletion, sample attachments, navigation, and shared counts, and checks for browser runtime errors. It also runs a browser-only 150% text enlargement check. This does not substitute for Android/iOS keyboard, safe-area, screen-reader, or system-font-scale validation on a real device.
