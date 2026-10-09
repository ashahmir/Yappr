import { allPosts } from './explore-posts';

export type ProfileTile = { id: string; image: number; label: string; region?: readonly number[]; postId?: string; video?: boolean };
export type DemoProfile = { id: string; name: string; handle: string; avatar: number; avatarRegion?: readonly number[]; bio: string; posts: number; followers: number; following: number; tiles: ProfileTile[] };
export const ownProfileTiles: ProfileTile[] = [
  { id: 'mountain', image: require('../../assets/images/profiles/mountain.png'), label: 'A clear morning in the mountains' },
  { id: 'dog', image: require('../../assets/images/profiles/dog.png'), label: 'My favorite adventure buddy' },
  { id: 'coffee', image: require('../../assets/images/profiles/coffee.png'), label: 'Good coffee, slow mornings' },
  { id: 'coast', image: require('../../assets/images/profiles/coast.png'), label: 'The colorful coast' },
  { id: 'lake', image: require('../../assets/images/profiles/lake.png'), label: 'A quiet afternoon by the lake' },
  { id: 'sunset', image: require('../../assets/images/profiles/sunset.png'), label: 'One last sunset' },
];
export const alexProfile: DemoProfile = {
  id: 'alexrivera', name: 'Alex Rivera', handle: '@alexrivera', avatar: require('../../assets/images/profiles/alex.png'),
  bio: 'Exploring new places\nand meeting good people.\nMountains, music, and moments.', posts: 48, followers: 8100, following: 312,
  tiles: [
    { id: 'alex-mountain', image: require('../../assets/images/profiles/alex-mountain.png'), label: 'A mountain worth the climb' },
    { id: 'alex-dog', image: require('../../assets/images/profiles/alex-dog.png'), label: 'Always up for an adventure' },
    { id: 'alex-town', image: require('../../assets/images/profiles/alex-town.png'), label: 'Wandering through the old town' },
    { id: 'alex-sunset', image: require('../../assets/images/profiles/alex-sunset.png'), label: 'The city in the evening light' },
  ],
};
export const demoProfiles: DemoProfile[] = [alexProfile, ...Array.from(new Set(allPosts.map(p => p.handle))).map(handle => {
  const posts = allPosts.filter(p => p.handle === handle), first = posts[0];
  return { id: handle.slice(1), name: first.name, handle, avatar: first.avatarSource, avatarRegion: first.avatar,
    bio: handle === '@jamiechen' ? 'Good coffee, better people.\nTravel, photos, and random thoughts.' : 'Finding new places and sharing the little moments.',
    posts: handle === '@jamiechen' ? 66 : posts.length, followers: handle === '@jamiechen' ? 12400 : 1200, following: 420,
    tiles: posts.map(p => ({ id: p.id, image: p.source, region: p.region, label: p.caption, postId: p.id, video: p.video })),
  };
})];
