import { createContext, PropsWithChildren, useContext, useRef, useState } from 'react';
import { DemoComment, demoCommentAuthor, seededComments } from '../data/demo-comments';

type CommentState = {
  comments: Record<string, DemoComment[]>;
  add: (postId: string, text: string, parentId?: string, image?: boolean) => void;
  remove: (postId: string, id: string) => void;
  toggleLike: (postId: string, id: string) => void;
};
const Context = createContext<CommentState | null>(null);
export function CommentStateProvider({ children }: PropsWithChildren) {
  const [comments, setComments] = useState(seededComments);
  const sequence = useRef(0);
  return <Context.Provider value={{
    comments,
    add: (postId, text, parentId, image) => {
      if (!text.trim() && !image) return;
      const item: DemoComment = { ...demoCommentAuthor, id: `local-${Date.now()}-${sequence.current++}`, age: 'now', text: text.trim(), likes: 0, parentId, image };
      setComments(previous => {
        const items = previous[postId] ?? [];
        if (parentId && !items.some(c => c.id === parentId && !c.parentId)) return previous;
        return { ...previous, [postId]: [...items, item] };
      });
    },
    remove: (postId, id) => setComments(previous => {
      const items = previous[postId] ?? [];
      if (!items.some(c => c.id === id && c.own)) return previous;
      return { ...previous, [postId]: items.filter(c => c.id !== id && c.parentId !== id) };
    }),
    toggleLike: (postId, id) => setComments(previous => ({ ...previous, [postId]: (previous[postId] ?? []).map(c => c.id === id ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c) })),
  }}>{children}</Context.Provider>;
}
export function useComments() {
  const state = useContext(Context);
  if (!state) throw new Error('CommentStateProvider is missing');
  return state;
}
