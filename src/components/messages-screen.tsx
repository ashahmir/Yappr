import { Image } from 'expo-image';
import { router } from 'expo-router';
import { PropsWithChildren, useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Conversation } from '../data/demo-messages';
import { useMessages } from './message-state';
import { UiIcon } from './ui-icon';

const ink = '#0a123d', muted = '#7685aa', blue = '#005cff';
function useCanvas() {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 600);
  return { canvas, s: canvas / 1080, insets, large: fontScale > 1.3 };
}
function Avatar({ item, size }: { item: Conversation; size: number }) {
  return <Image source={item.avatar} style={{ width: size, height: size, borderRadius: size }} contentFit="cover" accessible={false} />;
}
function Dialog({ title, body, onClose, children }: PropsWithChildren<{ title: string; body: string; onClose: () => void }>) {
  return <Modal transparent animationType="fade" visible onRequestClose={onClose}>
    <View style={styles.backdrop}>
      <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Dismiss dialog" onPress={onClose} />
      <ScrollView style={styles.dialogScroll} contentContainerStyle={styles.dialog} accessibilityViewIsModal>
        <Text accessibilityRole="header" style={styles.dialogTitle}>{title}</Text>
        <Text style={styles.dialogBody}>{body}</Text>
        {children}
      </ScrollView>
    </View>
  </Modal>;
}
function Empty({ requests = false, search = false, s }: { requests?: boolean; search?: boolean; s: number }) {
  return <View testID={requests ? 'requests-empty' : search ? 'search-empty' : 'inbox-empty'} style={styles.empty}>
    <Image source={require('../../assets/images/messages/empty.svg')} contentFit="contain" style={{ width: 340 * s, height: 275 * s, marginBottom: 36 * s }} accessible={false} />
    <Text style={[styles.bold, { fontFamily: 'Inter_700Bold', fontSize: 38 * s, textAlign: 'center' }]}>{search ? 'No conversations found' : requests ? 'No message requests' : 'No conversations yet'}</Text>
    <Text style={[styles.body, { fontSize: 28 * s, lineHeight: 44 * s, textAlign: 'center', maxWidth: 620 * s, marginTop: 12 * s }]}>{search ? 'Try searching for a different name or message.' : requests ? 'New requests will appear here. You decide who can message you.' : 'When you message people, your conversations will appear here.'}</Text>
  </View>;
}

export default function MessagesScreen() {
  const { conversations, requests, dispatch } = useMessages();
  const { canvas, s, insets, large } = useCanvas();
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = conversations.filter(c => `${c.name} ${c.preview}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <View style={{ width: canvas, alignSelf: 'center', flex: 1 }}>
      <View style={[styles.header, { paddingHorizontal: 45 * s, minHeight: 140 * s }]}>
        <Text accessibilityRole="header" style={[styles.bold, { fontFamily: 'Inter_700Bold', fontSize: 60 * s, flex: 1, letterSpacing: -1.5 * s }]}>Messages</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={searching ? 'Close search' : 'Search conversations'} onPress={() => { setSearching(!searching); setQuery(''); }} style={styles.target}><UiIcon name="search" size={57 * s} color={ink} /></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="New message" onPress={() => setNotice('New message')} style={({ pressed }) => [styles.target, { alignItems: 'flex-end', opacity: pressed ? 0.7 : 1 }]}>
          <View style={[styles.newMessage, { width: 81 * s, height: 81 * s, borderRadius: 24 * s }]}><View style={{ width: 37 * s, height: 37 * s }}><View style={{ position: 'absolute', top: 16 * s, width: 37 * s, height: 6 * s, backgroundColor: 'white' }} /><View style={{ position: 'absolute', left: 16 * s, height: 37 * s, width: 6 * s, backgroundColor: 'white' }} /></View></View>
        </Pressable>
      </View>
      {searching && <View style={[styles.search, { marginHorizontal: 45 * s }]}>
        <TextInput autoFocus accessibilityLabel="Search conversations" placeholder="Search conversations" placeholderTextColor={muted} value={query} onChangeText={setQuery} returnKeyType="search" style={{ flex: 1, minWidth: 0, fontFamily: 'Inter_400Regular', color: ink, fontSize: 15, paddingVertical: 12 }} />
        {!!query && <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} style={styles.target}><Text style={{ color: blue, fontSize: 22 }}>{"\u00d7"}</Text></Pressable>}
      </View>}
      <View style={{ flexDirection: 'row', gap: 12 * s, marginHorizontal: 45 * s, marginTop: 14 * s, marginBottom: 20 * s }}>
        <Pressable accessibilityRole="button" accessibilityLabel="All conversations" accessibilityState={{ selected: true }} onPress={() => { setQuery(''); setSearching(false); }} style={[styles.pill, { backgroundColor: '#eaf1ff', minHeight: Math.max(44, 94 * s) }]}><Text style={[styles.bold, { color: blue, fontSize: 34 * s }]}>All</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`Message requests, ${requests.length} pending`} onPress={() => router.push('/message-requests')} style={[styles.pill, { minHeight: Math.max(44, 94 * s), gap: 32 * s }]}>
          <Text style={[styles.bold, { color: muted, fontSize: 34 * s }]}>Requests</Text>
          {requests.length > 0 && <View style={[styles.badge, { minWidth: 57 * s, minHeight: 57 * s, borderRadius: 40 * s, backgroundColor: '#ff3057' }]}><Text style={[styles.badgeText, { fontSize: 30 * s }]}>{requests.length}</Text></View>}
        </Pressable>
      </View>
      <FlatList testID="inbox-list" data={filtered} keyExtractor={item => item.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 45 * s, paddingBottom: 24 }}
        ListEmptyComponent={<Empty s={s} search={conversations.length > 0 && !!query.trim()} />}
        renderItem={({ item }) => <Pressable testID={`chat-${item.id}`} accessibilityRole="button" accessibilityLabel={`${item.name}, ${item.preview}, ${item.time}${item.unread ? `, ${item.unread} unread messages` : ''}`} accessibilityHint="Hold to delete this chat" accessibilityActions={[{ name: 'delete', label: 'Delete chat' }]} onAccessibilityAction={event => { if (event.nativeEvent.actionName === 'delete') setDeleting(item); }} delayLongPress={450} onLongPress={() => setDeleting(item)} onPress={() => setNotice(item.name)} style={({ pressed }) => ({ flexDirection: 'row', gap: 32 * s, paddingTop: 24 * s, paddingLeft: 7 * s, backgroundColor: pressed ? '#f5f8ff' : 'white' })}>
          <Avatar item={item} size={108 * s} />
          <View style={{ flex: 1, minWidth: 0, borderBottomWidth: 1, borderColor: '#e1e7f2', minHeight: 128 * s, paddingBottom: 23 * s }}>
            <View style={{ flexDirection: large ? 'column' : 'row', alignItems: large ? 'flex-start' : 'baseline', gap: 8 * s }}>
              <Text style={[styles.bold, { flex: large ? undefined : 1, fontSize: 36 * s }]}>{item.name}</Text>
              <Text style={[styles.body, { fontSize: 25 * s }]}>{item.time}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 * s, marginTop: 10 * s }}>
              {item.photo && <Image source={require('../../assets/images/messages/photo.svg')} style={{ width: 30 * s, height: 26 * s }} accessible={false} />}
              <Text numberOfLines={large ? undefined : 1} style={[styles.body, { fontSize: 29 * s, flex: 1 }]}>{item.preview}</Text>
              {!!item.unread && <View style={[styles.badge, { backgroundColor: blue, minWidth: 56 * s, minHeight: 50 * s, borderRadius: 20 * s }]}><Text style={[styles.badgeText, { fontSize: 28 * s }]}>{item.unread}</Text></View>}
            </View>
          </View>
        </Pressable>} />
    </View>
    {deleting && <Dialog title="Delete chat?" body={`Your conversation with ${deleting.name} will be removed from your inbox. This cannot be undone.`} onClose={() => setDeleting(null)}>
      <View style={styles.dialogActions}>
        <Pressable accessibilityRole="button" onPress={() => setDeleting(null)} style={[styles.dialogButton, { backgroundColor: '#f1f4fa' }]}><Text style={[styles.buttonText, { color: ink }]}>Cancel</Text></Pressable>
        <Pressable accessibilityRole="button" onPress={() => { dispatch({ type: 'delete', id: deleting.id }); setDeleting(null); }} style={[styles.dialogButton, { backgroundColor: '#ff3057' }]}><Text style={styles.buttonText}>Delete chat</Text></Pressable>
      </View>
    </Dialog>}
    {notice && <Dialog title={notice} body={notice === 'New message' ? 'Starting a conversation and sending message requests are coming in a later update.' : 'Private conversations are coming in a later update. For now, you can manage your inbox and message requests.'} onClose={() => setNotice(null)}>
      <Pressable accessibilityRole="button" onPress={() => setNotice(null)} style={[styles.dialogButton, { backgroundColor: blue }]}><Text style={styles.buttonText}>Got it</Text></Pressable>
    </Dialog>}
  </View>;
}

export function MessageRequestsScreen() {
  const { requests, dispatch } = useMessages();
  const { canvas, s, insets, large } = useCanvas();
  const [feedback, setFeedback] = useState('');
  const back = () => router.canGoBack() ? router.back() : router.replace('/messages');
  return <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right, paddingBottom: insets.bottom }]}>
    <View style={{ width: canvas, flex: 1, alignSelf: 'center' }}>
      <View style={[styles.header, { paddingHorizontal: 36 * s, minHeight: 140 * s }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back to messages" onPress={back} style={styles.target}><UiIcon name="back" size={64 * s} color={ink} /></Pressable>
        <Text accessibilityRole="header" style={[styles.bold, { fontFamily: 'Inter_700Bold', flex: 1, textAlign: 'center', fontSize: 48 * s, letterSpacing: -1.2 * s }]}>Message Requests</Text>
        <View style={{ width: 44 }} />
      </View>
      <FlatList testID="requests-list" data={requests} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 45 * s, paddingBottom: 40 * s }}
        ListHeaderComponent={<>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 34 * s, backgroundColor: '#eef5ff', borderRadius: 36 * s, paddingHorizontal: 32 * s, paddingVertical: 35 * s, marginTop: 12 * s, minHeight: 215 * s, marginBottom: 52 * s }}>
            {!large && <Image source={require('../../assets/images/messages/privacy.svg')} style={{ width: 100 * s, height: 100 * s }} accessible={false} />}
            <View style={{ flex: 1 }}><Text style={[styles.bold, { fontSize: 30 * s, letterSpacing: -0.5 * s }]}>You decide who can message you.</Text><Text style={[styles.body, { fontSize: 29 * s, lineHeight: 41 * s, marginTop: 7 * s }]}>Review requests and accept{!large ? '\n' : ' '}conversations you&apos;re comfortable with.</Text></View>
          </View>
          {!!feedback && <Text role="status" accessibilityLiveRegion="polite" style={[styles.body, { color: blue, fontSize: Math.max(13, 28 * s), marginBottom: 12 }]}>{feedback}</Text>}
        </>}
        ListEmptyComponent={<Empty requests s={s} />}
        renderItem={({ item, index }) => <View testID={`request-${item.id}`} style={{ paddingTop: 30 * s, paddingBottom: 46 * s, borderBottomWidth: index === requests.length - 1 ? 0 : 1, borderColor: '#e1e7f2' }}>
          <View style={{ flexDirection: 'row', gap: 30 * s }}>
            <Avatar item={item} size={136 * s} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <View style={{ flexDirection: large ? 'column' : 'row', alignItems: 'baseline', gap: 8 * s }}><Text style={[styles.bold, { flex: large ? undefined : 1, fontSize: 40 * s, letterSpacing: -0.7 * s }]}>{item.name}</Text><Text style={[styles.body, { fontSize: 26 * s }]}>{item.time}</Text></View>
              <Text style={[styles.body, { fontSize: 30 * s, lineHeight: 40 * s, marginTop: 12 * s }]}>{item.preview}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 * s, marginTop: 40 * s, marginLeft: large ? 0 : 300 * s }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Decline ${item.name}'s request`} onPress={() => { dispatch({ type: 'decline', id: item.id }); setFeedback(`Request from ${item.name} declined.`); }} style={({ pressed }) => [styles.requestButton, { flex: 0.8, backgroundColor: '#f2f4fa', minHeight: Math.max(44, 80 * s), opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.bold, { color: '#536383', fontSize: 30 * s }]}>Decline</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Accept ${item.name}'s request`} onPress={() => { dispatch({ type: 'accept', id: item.id }); setFeedback(`${item.name} added to your inbox.`); }} style={({ pressed }) => [styles.requestButton, { flex: 1, backgroundColor: blue, minHeight: Math.max(44, 80 * s), opacity: pressed ? 0.65 : 1 }]}><Text style={[styles.bold, { color: 'white', fontSize: 30 * s }]}>Accept</Text></Pressable>
          </View>
        </View>} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  bold: { fontFamily: 'Inter_600SemiBold', color: ink },
  body: { fontFamily: 'Inter_400Regular', color: muted },
  target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  newMessage: { backgroundColor: blue, alignItems: 'center', justifyContent: 'center' },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 100, paddingVertical: 6, backgroundColor: '#f2f4fa' },
  badge: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { fontFamily: 'Inter_600SemiBold', color: 'white' },
  search: { backgroundColor: '#f2f4fa', borderRadius: 16, paddingLeft: 16, flexDirection: 'row', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32, paddingHorizontal: 12 },
  requestButton: { borderRadius: 32, justifyContent: 'center', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8 },
  backdrop: { flex: 1, backgroundColor: '#030b2c55', justifyContent: 'center', alignItems: 'center', padding: 26 },
  dialogScroll: { width: '100%', maxWidth: 380, flexGrow: 0, borderRadius: 24, backgroundColor: 'white' },
  dialog: { padding: 26, gap: 16 },
  dialogTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, color: ink },
  dialogBody: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#595e90' },
  dialogActions: { gap: 12 },
  dialogButton: { minHeight: 48, padding: 12, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontFamily: 'Inter_600SemiBold', fontSize: 16, color: 'white', textAlign: 'center' },
});

