// Local UI fixtures matching the supplied references. No messages are sent.
export type Conversation = { id: string; name: string; avatar: number; preview: string; time: string; unread?: number; photo?: boolean };
export const demoConversations: Conversation[] = [
  { id: 'jamie', name: 'Jamie Chen', avatar: require('../../assets/images/messages/jamie.png'), preview: 'That trail looks amazing!', time: '9:24 AM', unread: 2 },
  { id: 'marcus', name: 'Marcus Lee', avatar: require('../../assets/images/messages/marcus.png'), preview: "Let's plan for this weekend.", time: 'Yesterday' },
  { id: 'taylor', name: 'Taylor Kim', avatar: require('../../assets/images/messages/taylor.png'), preview: 'Photo', time: 'Mar 12', photo: true },
  { id: 'priya', name: 'Priya Shah', avatar: require('../../assets/images/messages/priya.png'), preview: 'Sounds great!', time: 'Mar 10' },
  { id: 'alex', name: 'Alex Rivera', avatar: require('../../assets/images/messages/alex.png'), preview: 'Thanks for the recs!', time: 'Mar 8' },
];
export const demoRequests: Conversation[] = [
  { id: 'daniel', name: 'Daniel Park', avatar: require('../../assets/images/messages/daniel.png'), preview: 'Hey! I loved your photo\nfrom Japan. Would love to...', time: '2d' },
  { id: 'sophia', name: 'Sophia Martinez', avatar: require('../../assets/images/messages/sophia.png'), preview: 'Your hiking photos are\nincredible! I’d love to chat...', time: '3d' },
  { id: 'chris', name: 'Chris Nguyen', avatar: require('../../assets/images/messages/chris.png'), preview: 'We have similar interests\nin travel. Would love to con...', time: '4d' },
];
