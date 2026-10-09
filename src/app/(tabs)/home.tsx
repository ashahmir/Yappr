import { useAuth, useSession } from '@clerk/expo';
import { Redirect } from 'expo-router';
import HomeFeed from '../../components/home-feed';
import { canAccessAccount } from '../../lib/auth-state';
export default function Home() {
  const { isSignedIn } = useAuth();
  const { session } = useSession();
  return canAccessAccount(isSignedIn, session?.status) ? <HomeFeed /> : <Redirect href="/" />;
}
