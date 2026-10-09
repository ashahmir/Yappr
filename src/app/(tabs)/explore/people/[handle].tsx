import { useLocalSearchParams } from 'expo-router';
import ProfileScreen from '../../../../components/profile-screen';
import { demoProfiles } from '../../../../data/demo-profiles';
export default function PublicProfile() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  return <ProfileScreen key={handle} profile={demoProfiles.find(p => p.id === handle.replace(/^@/, ''))} />;
}
