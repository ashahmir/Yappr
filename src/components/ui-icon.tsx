import { Image } from 'expo-image';

const icons = {
  search: { outline: require('../../assets/images/explore/icons/search.svg'), filled: require('../../assets/images/explore/icons/search-filled.svg') },
  filter: { outline: require('../../assets/images/explore/icons/filter.svg'), filled: require('../../assets/images/explore/icons/filter-filled.svg') },
  back: { outline: require('../../assets/images/explore/icons/back.svg'), filled: require('../../assets/images/explore/icons/back-filled.svg') },
  more: { outline: require('../../assets/images/explore/icons/more.svg'), filled: require('../../assets/images/explore/icons/more-filled.svg') },
  heart: { outline: require('../../assets/images/explore/icons/heart.svg'), filled: require('../../assets/images/explore/icons/heart-filled.svg') },
  message: { outline: require('../../assets/images/explore/icons/message.svg'), filled: require('../../assets/images/explore/icons/message-filled.svg') },
  share: { outline: require('../../assets/images/explore/icons/share.svg'), filled: require('../../assets/images/explore/icons/share-filled.svg') },
  bookmark: { outline: require('../../assets/images/explore/icons/bookmark.svg'), filled: require('../../assets/images/explore/icons/bookmark-filled.svg') },
  play: { outline: require('../../assets/images/explore/icons/play.svg'), filled: require('../../assets/images/explore/icons/play-filled.svg') },
  pin: { outline: require('../../assets/images/explore/icons/pin.svg'), filled: require('../../assets/images/explore/icons/pin-filled.svg') },
};
export function UiIcon({ name, size = 24, color = '#080a35', filled = false }: { name: keyof typeof icons; size?: number; color?: string; filled?: boolean }) {
  return <Image source={filled ? icons[name].filled : icons[name].outline} tintColor={color} contentFit="contain" style={{ width: size, height: size }} accessible={false} />;
}
