import { Text, View } from 'react-native';
export default function Messages() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 12, backgroundColor: '#fff' }}><Text style={{ fontFamily: 'Inter_700Bold', fontSize: 28, color: '#080a35' }}>Messages</Text><Text style={{ fontFamily: 'Inter_400Regular', fontSize: 16, textAlign: 'center', color: '#595e90' }}>Your conversations will appear here when messaging is available.</Text></View>;
}
