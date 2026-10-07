import { Redirect } from 'expo-router';
import HomeFeed from '../components/home-feed';

// Isolated local-fixture preview; never grants access to authenticated routes.
export default function HomePreview() {
  return __DEV__ ? <HomeFeed /> : <Redirect href="/" />;
}
