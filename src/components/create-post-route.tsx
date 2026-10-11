import { useAuth, useSession, useUser } from '@clerk/expo';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { canAccessAccount } from '../lib/auth-state';
import { profileIdentity } from '../lib/profile-identity';
import CreatePostScreen from './create-post-screen';

export default function CreatePostRoute() {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  const { user } = useUser();
  const { preview } = useLocalSearchParams<{ preview?: string }>();
  if (user && canAccessAccount(isSignedIn, session?.status)) return <CreatePostScreen key={user.id} author={{ id: user.id, ...profileIdentity(user) }} />;
  // Explicit local fixture for browser QA; unavailable in production.
  if (__DEV__ && preview === '1') return <CreatePostScreen author={{ id: 'preview', name: 'Jamie Chen', handle: '@jamiechen' }} />;
  return <Redirect href="/" />;
}
