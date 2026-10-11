import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react';
import { demoConversations, demoRequests } from '../data/demo-messages';
import { ChatMessage, MessageAction, messageReducer, MessageState } from '../lib/message-reducer';

export const conversationHandles: Record<string, string> = { jamie: '@jamiechen', marcus: '@marcuslee', taylor: '@taylorkim', priya: '@priyashah', alex: '@alexrivera', daniel: '@danielpark', sophia: '@sophiamartinez', chris: '@chrisnguyen' };
const jamieThread: ChatMessage[] = [
  { id: 'j1', text: 'Hey! Thanks for the message.\nI’d love to chat! Where was\nthat photo taken?', outgoing: false, time: '9:12 AM', date: 'Mar 12, 2024' },
  { id: 'j2', text: 'It was from my trip to Santorini!\nAbsolutely beautiful there.', outgoing: true, time: '9:15 AM', date: 'Mar 12, 2024' },
  { id: 'j3', photo: true, outgoing: true, time: '9:16 AM', date: 'Mar 12, 2024' },
  { id: 'j4', text: 'Wow! That looks amazing!\nI’m hoping to go next year.', outgoing: false, time: '9:16 AM', date: 'Mar 12, 2024' },
  { id: 'j5', text: 'You should! I can share\nsome recommendations.', outgoing: true, time: '9:17 AM', date: 'Mar 12, 2024' },
];
const initialState: MessageState = {
  conversations: demoConversations.map(c => ({ ...c, handle: conversationHandles[c.id] })),
  requests: demoRequests.map(c => ({ ...c, handle: conversationHandles[c.id] })),
  threads: Object.fromEntries(demoConversations.map(c => [c.id, c.id === 'jamie' ? jamieThread : [{ id: `${c.id}-1`, text: c.photo ? undefined : c.preview, photo: c.photo, outgoing: false, time: c.time, date: 'Conversation' }]])),
};
const Context = createContext<(MessageState & { dispatch: Dispatch<MessageAction> }) | null>(null);
export function MessageStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(messageReducer, initialState);
  return <Context.Provider value={{ ...state, dispatch }}>{children}</Context.Provider>;
}
export function useMessages() {
  const state = useContext(Context);
  if (!state) throw new Error('MessageStateProvider is missing');
  return state;
}
