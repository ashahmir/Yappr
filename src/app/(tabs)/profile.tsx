import { useAuth, useSession } from '@clerk/expo';
import { Redirect } from 'expo-router';
import AccountScreen from '../account';
import { canAccessAccount } from '../../lib/auth-state';
export default function Profile() {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  return canAccessAccount(isSignedIn, session?.status) ? <AccountScreen /> : <Redirect href="/" />;
}
