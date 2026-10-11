import type { SampleMedia } from '../data/create-media';
import type { DemoPost } from '../data/explore-posts';

export type PostAuthor = { id: string; name: string; handle: string; imageUrl?: string };
export type LocalPost = DemoPost & { ownerId: string; createdAt: number; avatarUri?: string };
export function publishingError(media: SampleMedia, caption: string, posts: LocalPost[], ownerId: string, now: number) {
  if (caption.length > 150) return 'Keep your caption within 150 characters.';
  if (media.video && ((media.duration ?? 0) > 60 || media.bytes > 10000000)) return 'Choose a video up to 60 seconds and 10 MB.';
  const today = new Date(now).toDateString();
  if (posts.filter(p => p.ownerId === ownerId && new Date(p.createdAt).toDateString() === today).length >= 5) return 'You have shared five posts today. Come back tomorrow to share another.';
  return null;
}

// A local demo transaction. No upload or server persistence takes place.
export function publishLocal(posts: LocalPost[], post: LocalPost, media: SampleMedia) {
  if (posts.some(p => p.id === post.id)) return posts;
  const error = publishingError(media, post.caption, posts, post.ownerId, post.createdAt);
  if (error) throw new Error(error);
  return [post, ...posts];
}
