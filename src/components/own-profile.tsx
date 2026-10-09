import { useUser } from '@clerk/expo';
import { ActivityIndicator, View } from 'react-native';
import { profileIdentity } from '../lib/profile-identity';
import ProfileScreen from './profile-screen';

export default function OwnProfile() {
  const { user } = useUser();
  if (!user) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'white' }}><ActivityIndicator color="#005cff" /></View>;
  return <ProfileScreen own identity={profileIdentity(user)} />;
}
