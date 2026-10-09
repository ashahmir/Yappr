import { Image, ImageSource } from 'expo-image';
import { View } from 'react-native';

// Only artwork regions are displayed; labels and controls are real native UI.
export function DemoArtwork({ source, region, width, height = width, label }: { source: ImageSource | number; region: readonly number[]; width: number; height?: number; label?: string }) {
  const [x, y, w, h] = region;
  const scale = Math.max(width / w, height / h);
  return <View accessible={!!label} accessibilityLabel={label} style={{ width, height, overflow: 'hidden' }}>
    <Image source={source} contentFit="fill" accessible={false} style={{ position: 'absolute', width: 941 * scale, height: 1672 * scale, left: -x * scale + (width - w * scale) / 2, top: -y * scale + (height - h * scale) / 2 }} />
  </View>;
}

