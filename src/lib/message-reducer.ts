import type { Conversation } from '../data/demo-messages';

export type ChatMessage = { id: string; text?: string; photo?: boolean; outgoing: boolean; time: string; date: string };
export type MessageState = { conversations: Conversation[]; requests: Conversation[]; threads: Record<string, ChatMessage[]> };
export type MessageAction = { type: 'delete' | 'accept' | 'decline' | 'read'; id: string }
  | { type: 'introduce'; conversation: Conversation; message: ChatMessage }
  | { type: 'send'; id: string; message: ChatMessage };

export function messageReducer(state: MessageState, action: MessageAction): MessageState {
  if (action.type === 'introduce') {
    if (!action.message.text?.trim() || action.message.text.length > 500 || state.conversations.some(c => c.id === action.conversation.id)) return state;
    return { ...state, conversations: [{ ...action.conversation, pending: true, preview: 'Request sent · Waiting for acceptance', unread: 0 }, ...state.conversations], threads: { ...state.threads, [action.conversation.id]: [action.message] } };
  }
  if (action.type === 'delete') {
    const threads = { ...state.threads }; delete threads[action.id];
    return { ...state, threads, conversations: state.conversations.filter(c => c.id !== action.id) };
  }
  if (action.type === 'read') return { ...state, conversations: state.conversations.map(c => c.id === action.id ? { ...c, unread: 0 } : c) };
  if (action.type === 'send') {
    const conversation = state.conversations.find(c => c.id === action.id);
    if (!conversation || conversation.pending || (!action.message.text?.trim() && !action.message.photo)) return state;
    return { ...state, conversations: [{ ...conversation, preview: action.message.photo ? 'Photo' : action.message.text!.trim(), photo: action.message.photo, time: action.message.time, unread: 0 }, ...state.conversations.filter(c => c.id !== action.id)], threads: { ...state.threads, [action.id]: [...(state.threads[action.id] ?? []), action.message] } };
  }
  const request = state.requests.find(r => r.id === action.id);
  if (!request) return state;
  return { ...state,
    conversations: action.type === 'accept' ? [{ ...request, preview: request.preview.replace('\n', ' '), unread: 1 }, ...state.conversations.filter(c => c.id !== request.id)] : state.conversations,
    threads: action.type === 'accept' ? { ...state.threads, [request.id]: [{ id: `${request.id}-intro`, text: request.preview.replace('\n', ' '), outgoing: false, time: request.time, date: 'Message request' }] } : state.threads,
    requests: state.requests.filter(r => r.id !== action.id),
  };
}
