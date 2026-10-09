// Session-only fixtures. Taylor is the demo author, independent of Clerk identity.
export type DemoComment = {
  id: string;
  name: string;
  handle: string;
  avatar: readonly number[];
  age: string;
  text: string;
  likes: number;
  liked?: boolean;
  own?: boolean;
  parentId?: string;
  image?: boolean;
};
export const commentArtwork = require('../../assets/images/comments/reference.png');
export const demoCommentAuthor = { name: 'Taylor Kim', handle: '@taylorkim', avatar: [36, 509, 129, 129], own: true };
export const seededComments: Record<string, DemoComment[]> = {
  'jamie-santorini': [
    { ...demoCommentAuthor, id: 'taylor', age: '1h', text: 'This is absolutely stunning! 😍', likes: 24 },
    { id: 'morgan', name: 'Morgan Lee', handle: '@morganlee', avatar: [36, 790, 129, 129], age: '45m', text: 'Adding this to my travel list! 💙', likes: 12 },
    { id: 'chris', name: 'Chris Ramos', handle: '@chrisramos', avatar: [36, 1071, 129, 129], age: '12m', text: 'The colors are unreal. What time was this?', likes: 8 },
    { ...demoCommentAuthor, id: 'reply-taylor', parentId: 'chris', age: '8m', text: 'Right before sunset! The light was beautiful. 🌅', likes: 2 },
  ],
  'golden-hour': [{ ...demoCommentAuthor, id: 'own-comment', age: '5m', text: 'Such a great spot! Would love to go back. 💙', likes: 4, liked: true }],
};
