import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { demoProfiles } from '../data/demo-profiles';
import { allPosts, homeArtwork } from '../data/explore-posts';
import { ChatMessage } from '../lib/message-reducer';
import { DemoArtwork } from './demo-artwork';
import { conversationHandles, useMessages } from './message-state';
import { UiIcon } from './ui-icon';

const blue = '#005cff', ink = '#0a123d', muted = '#7685aa';
const plane = require('../../assets/images/messages/send.svg');
export default function ConversationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ConversationContent key={id} id={id} />;
}
function ConversationContent({ id }: { id: string }) {
  const { conversations, requests, threads, dispatch } = useMessages();
  const profile = demoProfiles.find(p => p.id === id || p.handle === conversationHandles[id]);
  const conversation = conversations.find(c => c.id === id || (profile && c.handle === profile.handle));
  const incoming = requests.find(c => c.id === id || (profile && c.handle === profile.handle));
  const person = conversation ?? incoming ?? (profile ? { id: profile.id, name: profile.name, handle: profile.handle, avatar: profile.avatar, avatarRegion: profile.avatarRegion, preview: '', time: '' } : undefined);
  const { width, fontScale } = useWindowDimensions(), insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 600), s = canvas / 1080;
  const large = fontScale > 1.3;
  const [draft, setDraft] = useState('');
  const [options, setOptions] = useState(false);
  const [photo, setPhoto] = useState(false);
  const list = useRef<FlatList<ChatMessage>>(null);
  const introductionScroll = useRef<ScrollView>(null);
  const scrollToLatest = useRef(false);
  const pending = !!conversation?.pending, introduction = !conversation || pending;
  const messages = person ? threads[person.id] ?? [] : [];
  const back = () => router.canGoBack() ? router.back() : router.replace('/messages');
  useEffect(() => { if (conversation?.unread) dispatch({ type: 'read', id: conversation.id }); }, [conversation?.id, conversation?.unread, dispatch]);
  const interests = profile ? [...new Set(allPosts.filter(p => p.handle === profile.handle).map(p => p.category))].slice(0, 3) : [];
  const makeMessage = (text?: string, photo?: boolean): ChatMessage => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, photo, outgoing: true, time: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }), date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
  const send = (withPhoto = false) => {
    if (!person || pending || (!withPhoto && !draft.trim())) return;
    const message = makeMessage(withPhoto ? undefined : draft.trim(), withPhoto || undefined);
    if (introduction) {
      if (incoming) return;
      dispatch({ type: 'introduce', conversation: { ...person, time: message.time }, message });
      Keyboard.dismiss();
    } else {
      scrollToLatest.current = true;
      dispatch({ type: 'send', id: person.id, message });
    }
    setDraft(''); setPhoto(false);
  };
  const avatar = (size: number) => person && <View style={{ width: size, height: size, borderRadius: size, overflow: 'hidden', backgroundColor: '#eaf1ff' }}>{person.avatarRegion ? <DemoArtwork source={person.avatar} region={person.avatarRegion} width={size} /> : <Image source={person.avatar} style={{ width: size, height: size }} contentFit="cover" />}</View>;
  if (!person) return <View style={[styles.root, styles.empty, { paddingTop: insets.top }]}><Text style={styles.title}>Conversation not found</Text><Pressable accessibilityRole="button" onPress={back} style={styles.target}><Text style={styles.link}>Back to messages</Text></Pressable></View>;
  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <View style={{ width: canvas, flex: 1, alignSelf: 'center' }}>
      <View style={[styles.header, { paddingHorizontal: 30 * s, minHeight: 140 * s, borderBottomWidth: introduction ? 0 : 1 }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back from conversation" onPress={back} style={styles.target}><UiIcon name="back" size={64 * s} color={ink} /></Pressable>
        {introduction ? <Text accessibilityRole="header" style={[styles.title, { flex: 1, textAlign: 'center', fontSize: 46 * s }]}>Send Introduction</Text> : <View style={{ flexDirection: 'row', alignItems: 'center', gap: 27 * s, flex: 1, minWidth: 0 }}>
          {avatar(120 * s)}<View style={{ flex: 1 }}><Text accessibilityRole="header" style={[styles.title, { fontSize: 42 * s }]}>{person.name}</Text><Text style={[styles.body, { fontSize: 29 * s }]}>{person.handle}</Text></View>
        </View>}
        {introduction ? <View style={{ width: 44 }} /> : <Pressable accessibilityRole="button" accessibilityLabel="Conversation options" onPress={() => setOptions(true)} style={styles.target}><UiIcon name="more" size={48 * s} color={ink} /></Pressable>}
      </View>
      {introduction ? <ScrollView ref={introductionScroll} testID="introduction-screen" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 77 * s, paddingTop: 15 * s, paddingBottom: 40 * s }} onContentSizeChange={() => { if (pending) introductionScroll.current?.scrollToEnd({ animated: true }); }}>
        <View style={{ flexDirection: large ? 'column' : 'row', alignItems: large ? 'flex-start' : 'center', gap: 32 * s }}>
          {avatar(285 * s)}<View style={{ flex: 1, minWidth: 0 }}><Text style={[styles.title, { fontSize: 46 * s }]}>{person.name}</Text><Text style={[styles.body, { fontSize: 32 * s, marginTop: 10 * s }]}>{person.handle}</Text>
            {!!interests.length && <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 * s, marginTop: 30 * s }}>{interests.map(tag => <View key={tag} style={{ backgroundColor: '#eaf1ff', borderRadius: 30, paddingHorizontal: 30 * s, paddingVertical: 12 * s }}><Text style={{ color: blue, fontFamily: 'Inter_400Regular', fontSize: 25 * s }}>{tag}</Text></View>)}</View>}
          </View>
        </View>
        <Text style={[styles.body, { fontSize: 31 * s, lineHeight: 48 * s, marginTop: 30 * s, marginBottom: 50 * s }]}>Introduce yourself with a respectful{!large ? '\n' : ' '}message. They’ll need to accept{!large ? '\n' : ' '}your request before you can chat.</Text>
        {incoming ? <View style={styles.pending}><Text style={[styles.title, { fontSize: 20 }]}>They’ve sent you a request</Text><Text style={[styles.body, { fontSize: 16, lineHeight: 24 }]}>{incoming.preview}</Text><Pressable accessibilityRole="button" onPress={() => dispatch({ type: 'accept', id: incoming.id })} style={styles.primary}><Text style={styles.buttonText}>Accept request</Text></Pressable></View> : <>
          <TextInput testID="introduction-input" accessibilityLabel="Your introduction" placeholder={`Hi ${person.name.split(' ')[0]}! Introduce yourself…`} placeholderTextColor={muted} value={pending ? messages[0]?.text ?? '' : draft} onChangeText={setDraft} editable={!pending} multiline maxLength={500} textAlignVertical="top" style={[styles.introInput, { borderRadius: 28 * s, minHeight: 380 * s, fontSize: 32 * s, lineHeight: 54 * s, padding: 34 * s }]} />
          <Text style={[styles.body, { fontSize: 26 * s, textAlign: 'right', marginTop: 18 * s }]}>{(pending ? messages[0]?.text ?? '' : draft).length} / 500</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={pending ? 'Introduction sent' : 'Send Introduction'} disabled={pending || !draft.trim()} accessibilityState={{ disabled: pending || !draft.trim() }} onPress={() => send()} style={[styles.primary, { marginTop: 40 * s, minHeight: Math.max(48, 98 * s), borderRadius: 32 * s, opacity: pending ? 0.65 : draft.trim() ? 1 : 0.45 }]}><Text style={[styles.buttonText, { fontSize: 30 * s }]}>{pending ? 'Introduction sent' : 'Send Introduction'}</Text></Pressable>
          {pending && <View testID="request-sent" accessibilityLiveRegion="polite" style={[styles.pending, { marginTop: 57 * s, paddingVertical: 42 * s, borderRadius: 38 * s }]}>
            <View style={{ backgroundColor: '#dfeaff', width: 145 * s, height: 145 * s, borderRadius: 100, alignItems: 'center', justifyContent: 'center', marginBottom: 24 * s }}><Image source={plane} tintColor={blue} style={{ width: 105 * s, height: 105 * s }} /></View>
            <Text style={[styles.title, { fontSize: 40 * s, textAlign: 'center' }]}>Request sent.{ '\n' }Waiting for acceptance.</Text><Text style={[styles.body, { fontSize: 27 * s, textAlign: 'center', marginTop: 14 * s }]}>We’ll let you know if they accept{ '\n' }your message request.</Text>
          </View>}
        </>}
      </ScrollView> : <>
        <FlatList ref={list} testID="conversation-messages" data={messages} keyExtractor={item => item.id} keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 63 * s, paddingBottom: 38 * s }} onContentSizeChange={() => { if (scrollToLatest.current) { list.current?.scrollToEnd({ animated: true }); scrollToLatest.current = false; } }} renderItem={({ item, index }) => <View>
          {(index === 0 || messages[index - 1].date !== item.date) && <Text style={[styles.body, { textAlign: 'center', fontSize: 28 * s, marginVertical: 34 * s }]}>{item.date}</Text>}
          <View style={{ alignItems: item.outgoing ? 'flex-end' : 'flex-start', marginTop: index ? 24 * s : 0 }}>
            {item.photo ? <View accessibilityLabel="Photo of Santorini" style={{ borderRadius: 32 * s, overflow: 'hidden' }}><DemoArtwork source={homeArtwork} region={[39, 455, 864, 404]} width={590 * s} height={365 * s} /></View> : <View style={{ backgroundColor: item.outgoing ? blue : '#f2f4fa', maxWidth: item.outgoing ? '80%' : '84%', borderRadius: 38 * s, paddingHorizontal: 32 * s, paddingVertical: 25 * s }}><Text style={{ fontFamily: 'Inter_400Regular', color: item.outgoing ? 'white' : ink, fontSize: 33 * s, lineHeight: 49 * s }}>{item.text}</Text></View>}
            <Text style={[styles.body, { fontSize: 25 * s, marginTop: 12 * s, marginHorizontal: 15 * s }]}>{item.time}</Text>
          </View>
        </View>} />
        <View style={[styles.composer, { paddingHorizontal: 34 * s, paddingVertical: 22 * s, gap: 20 * s }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Attach photo" onPress={() => setPhoto(true)} style={styles.target}><Image source={require('../../assets/images/messages/photo.svg')} tintColor={ink} style={{ width: 48 * s, height: 48 * s }} /></Pressable>
          <TextInput accessibilityLabel="Message" placeholder="Message…" placeholderTextColor={muted} value={draft} onChangeText={setDraft} multiline maxLength={2000} style={{ flex: 1, minWidth: 0, backgroundColor: '#f2f4fa', borderRadius: 55 * s, fontFamily: 'Inter_400Regular', color: ink, fontSize: 33 * s, paddingHorizontal: 38 * s, paddingVertical: 24 * s, minHeight: 48, maxHeight: 140 }} />
          <Pressable accessibilityRole="button" accessibilityLabel="Send message" accessibilityState={{ disabled: !draft.trim() }} disabled={!draft.trim()} onPress={() => send()} style={{ backgroundColor: blue, opacity: draft.trim() ? 1 : 0.45, borderRadius: 100, width: Math.max(44, 98 * s), height: Math.max(44, 98 * s), alignItems: 'center', justifyContent: 'center' }}><Image source={plane} tintColor="white" style={{ width: 65 * s, height: 65 * s }} /></Pressable>
        </View>
      </>}
    </View>
    <Modal transparent visible={options || photo} animationType="fade" onRequestClose={() => { setOptions(false); setPhoto(false); }}><View style={styles.backdrop}><Pressable accessibilityRole="button" accessibilityLabel="Dismiss conversation dialog" style={StyleSheet.absoluteFill} onPress={() => { setOptions(false); setPhoto(false); }} /><View style={styles.dialog} accessibilityViewIsModal>
      <Text accessibilityRole="header" style={styles.title}>{photo ? 'Share a sample photo' : 'Conversation options'}</Text>
      {photo ? <><Text style={[styles.body, { fontSize: 15 }]}>Try photo messages with this sample. Device photo uploads are not connected yet.</Text><View style={{ borderRadius: 16, overflow: 'hidden' }}><DemoArtwork source={homeArtwork} region={[39, 455, 864, 404]} width={Math.min(canvas - 100, 280)} height={150} /></View><Pressable accessibilityRole="button" onPress={() => send(true)} style={styles.primary}><Text style={styles.buttonText}>Send sample photo</Text></Pressable></> : <><Text style={[styles.body, { fontSize: 16, lineHeight: 24 }]}>Delete this chat from your inbox? This cannot be undone.</Text><Pressable accessibilityRole="button" onPress={() => { dispatch({ type: 'delete', id: person.id }); setOptions(false); router.replace('/messages'); }} style={[styles.primary, { backgroundColor: '#ff3057' }]}><Text style={styles.buttonText}>Delete chat</Text></Pressable></>}
      <Pressable accessibilityRole="button" onPress={() => { setOptions(false); setPhoto(false); }} style={styles.target}><Text style={styles.link}>Cancel</Text></Pressable>
    </View></View></Modal>
  </KeyboardAvoidingView>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' }, empty: { alignItems: 'center', justifyContent: 'center', gap: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderColor: '#e1e7f2', gap: 8 },
  title: { fontFamily: 'Inter_700Bold', color: ink, fontSize: 23 }, body: { fontFamily: 'Inter_400Regular', color: muted },
  target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, link: { color: blue, fontFamily: 'Inter_600SemiBold', fontSize: 16 },
  introInput: { borderWidth: 1, borderColor: '#dfe6f3', borderRadius: 24, color: ink, fontFamily: 'Inter_400Regular' },
  primary: { minHeight: 48, padding: 12, backgroundColor: blue, alignItems: 'center', justifyContent: 'center', borderRadius: 24 }, buttonText: { color: 'white', fontFamily: 'Inter_600SemiBold', fontSize: 16, textAlign: 'center' },
  pending: { backgroundColor: '#eef5ff', alignItems: 'center', padding: 20, borderRadius: 20, gap: 4 },
  composer: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#e1e7f2' },
  backdrop: { flex: 1, backgroundColor: '#030b2c55', alignItems: 'center', justifyContent: 'center', padding: 24 }, dialog: { backgroundColor: 'white', borderRadius: 24, padding: 24, gap: 16, maxWidth: 360, width: '100%' },
});
