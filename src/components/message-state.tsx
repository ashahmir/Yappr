import { createContext, Dispatch, PropsWithChildren, useContext, useReducer } from 'react';
import { Conversation, demoConversations, demoRequests } from '../data/demo-messages';
type State = { conversations: Conversation[]; requests: Conversation[] };
type Action = { type: 'delete' | 'accept' | 'decline'; id: string };
function reducer(state: State, action: Action): State {
  if (action.type === 'delete') return { ...state, conversations: state.conversations.filter(c => c.id !== action.id) };
  const request = state.requests.find(r => r.id === action.id);
  if (!request) return state;
  return {
    conversations: action.type === 'accept' ? [{ ...request, preview: request.preview.replace('\n', ' '), unread: 1 }, ...state.conversations] : state.conversations,
    requests: state.requests.filter(r => r.id !== action.id),
  };
}
const Context = createContext<(State & { dispatch: Dispatch<Action> }) | null>(null);
export function MessageStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, { conversations: demoConversations, requests: demoRequests });
  return <Context.Provider value={{ ...state, dispatch }}>{children}</Context.Provider>;
}
export function useMessages() {
  const state = useContext(Context);
  if (!state) throw new Error('MessageStateProvider is missing');
  return state;
}
