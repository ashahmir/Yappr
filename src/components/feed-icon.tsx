import { Image } from 'expo-image';

const icons = {
  home: require('../../assets/images/feed/icons/home.svg'),
  message: require('../../assets/images/feed/icons/message.svg'),
  explore: require('../../assets/images/feed/icons/explore.svg'),
  profile: require('../../assets/images/feed/icons/profile.svg'),
  bell: require('../../assets/images/feed/icons/bell.svg'),
  plus: require('../../assets/images/feed/icons/plus.svg'),
  heart: require('../../assets/images/feed/icons/heart.svg'),
  pin: require('../../assets/images/feed/icons/pin.svg'),
  more: require('../../assets/images/feed/icons/more.svg'),
};
export type FeedIconName = keyof typeof icons;

export function FeedIcon({ name, size = 24, color, filled = false }: { name: FeedIconName; size?: number; color?: string; filled?: boolean }) {
  const source = name === 'heart' && !filled
    ? require('../../assets/images/feed/icons/heart-outline.svg')
    : name === 'message' && color === '#585c89'
      ? require('../../assets/images/feed/icons/message-muted.svg')
      : icons[name];
  return <Image source={source} contentFit="contain" style={{ width: size, height: size }} accessible={false} />;
}
