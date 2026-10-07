// Route visibility is a client-side convenience. Future Convex functions must
// also verify the Clerk token and enforce ownership on the server.
export function canAccessAccount(isSignedIn: boolean | undefined, status: string | undefined) {
  return isSignedIn === true && status === 'active';
}

type SSOResult = {
  createdSessionId: string | null;
  setActive?: (params: { session: string }) => Promise<unknown>;
  authSessionResult?: { type: string } | null;
};

export async function activateGoogleSession(result: SSOResult): Promise<'active' | 'cancelled' | 'incomplete'> {
  if (result.createdSessionId && result.setActive) {
    await result.setActive({ session: result.createdSessionId });
    return 'active';
  }
  if (result.authSessionResult?.type === 'cancel' || result.authSessionResult?.type === 'dismiss') {
    return 'cancelled';
  }
  return 'incomplete';
}
