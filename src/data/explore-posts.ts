import { demoFeed } from './demo-feed';

export const exploreArtwork = require('../../assets/images/explore/reference.png');
export const detailArtwork = require('../../assets/images/explore/detail-reference.png');
export const homeArtwork = require('../../assets/images/feed/reference-media.png');
export const categories = ['For you', 'Travel', 'Nature', 'Food', 'Art'] as const;
export type Category = typeof categories[number];
export type DemoPost = {
  id: string; name: string; handle: string; age: string; location: string; caption: string;
  likes: number; comments: number; category: Category; video: boolean;
  source: number; region: readonly number[]; avatarSource: number; avatar: readonly number[];
};
const jamie = { name: 'Jamie Chen', handle: '@jamiechen', age: '2h', location: 'Santorini, Greece', avatarSource: exploreArtwork, avatar: [125, 490, 235, 235] };
export const explorePosts: DemoPost[] = [
  { ...jamie, id: 'jamie-santorini', caption: 'Sunset hits different out here. Still\npinching myself. 🌅', likes: 12000, comments: 56, category: 'Travel', video: false, source: exploreArtwork, region: [31, 452, 431, 310] },
  { ...jamie, id: 'amalfi', caption: 'Taking the scenic route. Every shade of blue. 💙', likes: 8900, comments: 42, category: 'Travel', video: false, source: exploreArtwork, region: [481, 452, 430, 310] },
  { ...jamie, id: 'golden-hour', name: 'Alex Morgan', handle: '@alexmorgan', caption: 'The best adventure buddy. 🐾', likes: 5200, comments: 28, category: 'Nature', video: false, source: exploreArtwork, region: [32, 837, 429, 279] },
  { ...jamie, id: 'skate-day', name: 'Noah Park', handle: '@noahpark', location: 'Venice Beach, California', caption: 'One more try. Then one more. 🛹', likes: 5100, comments: 34, category: 'Art', video: true, source: exploreArtwork, region: [481, 837, 351, 279] },
  { ...jamie, id: 'sunset-coast', caption: 'Stay a little longer. 🌅', likes: 28700, comments: 93, category: 'Nature', video: false, source: exploreArtwork, region: [32, 1185, 429, 253] },
  { ...jamie, id: 'slow-morning', location: 'Amalfi, Italy', caption: 'A slow morning, a good coffee, and this view. ☕', likes: 9100, comments: 47, category: 'Food', video: true, source: exploreArtwork, region: [481, 1184, 351, 254] },
];
export const allPosts: DemoPost[] = [...explorePosts, ...demoFeed.filter(p => p.id !== 'jamie-santorini').map(p => ({ ...p, category: 'Nature' as const, source: homeArtwork, region: p.media, avatarSource: homeArtwork }))];
export function compactCount(value: number) { return value >= 1000 ? `${Number((value / 1000).toFixed(1))}K` : `${value}`; }
