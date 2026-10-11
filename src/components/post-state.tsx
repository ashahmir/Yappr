import { createContext, PropsWithChildren, useContext, useRef, useState } from 'react';
import { SampleMedia } from '../data/create-media';
import { allPosts } from '../data/explore-posts';
import { LocalPost, PostAuthor, publishLocal } from '../lib/local-publishing';

type State = { published: LocalPost[]; publish: (id: string, media: SampleMedia, caption: string, author: PostAuthor) => string; liked: Record<string, boolean>; saved: Record<string, boolean>; following: Record<string, boolean>; toggleLike: (id: string) => void; toggleSave: (id: string) => void; toggleFollow: (handle: string) => void };
const Context = createContext<State | null>(null);
export function PostStateProvider({ children }: PropsWithChildren) {
  const [liked, setLiked] = useState<Record<string, boolean>>({ 'jamie-santorini': true, 'marcus-yosemite': true });
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [published, setPublished] = useState<LocalPost[]>([]);
  const current = useRef(published);
  const publish = (id: string, media: SampleMedia, caption: string, author: PostAuthor) => {
    const post: LocalPost = { ...allPosts[0], id, ownerId: author.id, name: author.name, handle: author.handle, avatarUri: author.imageUrl, createdAt: Date.now(), age: 'Just now', location: 'Local preview', caption: caption.trim(), likes: 0, comments: 0, category: 'For you', video: media.video, source: media.source, region: media.region };
    current.current = publishLocal(current.current, post, media);
    setPublished(current.current);
    return id;
  };
  return <Context.Provider value={{ published, publish, liked, saved, following, toggleLike: id => setLiked(v => ({ ...v, [id]: !v[id] })), toggleSave: id => setSaved(v => ({ ...v, [id]: !v[id] })), toggleFollow: id => setFollowing(v => ({ ...v, [id]: !v[id] })) }}>{children}</Context.Provider>;
}
export function usePostState() { const state = useContext(Context); if (!state) throw new Error('PostStateProvider is missing'); return state; }
