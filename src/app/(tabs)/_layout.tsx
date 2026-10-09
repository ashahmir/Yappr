import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { WebTabStyles } from '../../components/web-tab-styles';

export const unstable_settings = { initialRouteName: 'explore' };
export default function TabLayout() {
  return <><WebTabStyles /><NativeTabs backgroundColor="#fff" indicatorColor="#eef4ff" tintColor="#005cff" iconColor={{ default: '#585c89', selected: '#005cff' }} labelStyle={{ default: { color: '#585c89', fontSize: 12 }, selected: { color: '#005cff', fontSize: 12, fontWeight: '600' } }} disableIndicator labelVisibilityMode="labeled">
    <NativeTabs.Trigger name="home"><NativeTabs.Trigger.Icon sf="house" md="home" /><NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="messages"><NativeTabs.Trigger.Icon sf="bubble" md="chat_bubble_outline" /><NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="explore"><NativeTabs.Trigger.Icon sf="safari" md="explore" /><NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    <NativeTabs.Trigger name="profile"><NativeTabs.Trigger.Icon sf="person" md="person_outline" /><NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label></NativeTabs.Trigger>
  </NativeTabs></>;
}
