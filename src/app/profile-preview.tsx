import { Redirect } from 'expo-router';
import ProfileScreen from '../components/profile-screen';

// Development-only fixture, separate from the authenticated Profile tab.
export default function ProfilePreview() {
  return __DEV__ ? <ProfileScreen own identity={{ name: 'Jamie Chen', handle: '@jamiechen', avatar: require('../../assets/images/profiles/jamie.png') }} /> : <Redirect href="/" />;
}
