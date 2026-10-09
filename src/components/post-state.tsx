import { createContext, PropsWithChildren, useContext, useState } from 'react';

type State = { liked: Record<string, boolean>; saved: Record<string, boolean>; following: Record<string, boolean>; toggleLike: (id: string) => void; toggleSave: (id: string) => void; toggleFollow: (handle: string) => void };
const Context = createContext<State | null>(null);
export function PostStateProvider({ children }: PropsWithChildren) {
  const [liked, setLiked] = useState<Record<string, boolean>>({ 'jamie-santorini': true, 'marcus-yosemite': true });
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  return <Context.Provider value={{ liked, saved, following, toggleLike: id => setLiked(v => ({ ...v, [id]: !v[id] })), toggleSave: id => setSaved(v => ({ ...v, [id]: !v[id] })), toggleFollow: id => setFollowing(v => ({ ...v, [id]: !v[id] })) }}>{children}</Context.Provider>;
}
export function usePostState() { const state = useContext(Context); if (!state) throw new Error('PostStateProvider is missing'); return state; }
