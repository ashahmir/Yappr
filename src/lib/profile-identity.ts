type ProfileUser = {
  fullName: string | null;
  username: string | null;
  imageUrl: string;
  externalAccounts: { provider: string; firstName: string; lastName: string; imageUrl: string }[];
};

// Display only: never derive a public username from an email or write to Clerk.
export function profileIdentity(user: ProfileUser) {
  const google = user.externalAccounts.find(account => account.provider === 'google' || account.provider === 'oauth_google');
  const googleName = google ? [google.firstName, google.lastName].filter(Boolean).join(' ').trim() : '';
  return {
    name: googleName || user.fullName?.trim() || user.username || 'Your profile',
    handle: user.username ? `@${user.username}` : '',
    imageUrl: google?.imageUrl || user.imageUrl,
  };
}
