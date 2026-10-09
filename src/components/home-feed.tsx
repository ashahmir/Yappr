import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { demoFeed } from '../data/demo-feed';
import { usePostState } from './post-state';
import { useComments } from './comment-state';
import { FeedIcon } from './feed-icon';

// Display only the original artwork regions of the supplied reference. All
// typography, cards, navigation and interactive controls are native elements.
function ReferenceArtwork({ region, width, label }: { region: readonly number[]; width: number; label: string }) {
  const [x, y, w, h] = region;
  const scale = width / w;
  return <View accessibilityLabel={label} accessible style={{ width, height: h * scale, overflow: 'hidden' }}>
    <Image source={require('../../assets/images/feed/reference-media.png')} contentFit="fill" accessible={false} style={{ position: 'absolute', width: 941 * scale, height: 1672 * scale, left: -x * scale, top: -y * scale }} />
  </View>;
}

export default function HomeFeed() {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 540);
  const s = canvas / 941;
  const list = useRef<FlatList>(null);
  const { liked, toggleLike } = usePostState();
  const { comments } = useComments();
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const soon = (title: string, body = 'This part of Yappr is coming soon.') => setNotice({ title, body });

  return <View style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <View style={{ flex: 1, width: canvas, alignSelf: 'center' }}>
      <View style={[styles.header, { height: 137 * s, paddingHorizontal: 40 * s }]}>
        <ReferenceArtwork region={[40, 90, 289, 73]} width={289 * s} label="Yappr" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 41 * s }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications" onPress={() => soon('Notifications')} hitSlop={10} style={{ width: 57 * s, height: 92 * s, alignItems: 'center', justifyContent: 'center' }}><FeedIcon name="bell" size={57 * s} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Create post" hitSlop={6} onPress={() => soon('Create a post', 'Post creation is coming soon. For now, enjoy this sample feed.')} style={({ pressed }) => ({ width: 92 * s, height: 92 * s, borderRadius: 100, backgroundColor: '#005cff', alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}><FeedIcon name="plus" size={51 * s} color="#fff" /></Pressable>
        </View>
      </View>
      <FlatList ref={list} testID="home-feed" data={demoFeed} keyExtractor={item => item.id} extraData={{ liked, comments }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 * s, paddingTop: 8 * s, paddingBottom: 20 * s }} renderItem={({ item }) => {
        const isLiked = liked[item.id];
        const count = item.likes - (isLiked ? 0 : 1);
        const likes = isLiked ? (item.likes === 12000 ? '12K' : '8.4K') : count.toLocaleString('en-US');
        return <View style={[styles.card, { borderRadius: 26 * s, paddingHorizontal: 18 * s, paddingTop: 18 * s, marginBottom: 21 * s }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 9 * s, gap: 32 * s }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}'s profile photo`} onPress={() => router.push({ pathname: '/explore/people/[handle]', params: { handle: item.handle.slice(1) } })} style={{ borderRadius: 100, overflow: 'hidden' }}><ReferenceArtwork region={item.avatar} width={120 * s} label={`${item.name}'s profile photo`} /></Pressable>
            <View style={{ flex: 1, gap: 8 * s }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 12 * s }}>
                <Pressable accessibilityRole="button" accessibilityLabel={`View ${item.name}'s profile`} onPress={() => router.push({ pathname: '/explore/people/[handle]', params: { handle: item.handle.slice(1) } })}><Text style={[styles.name, { fontSize: 34 * s, lineHeight: 41 * s }]}>{item.name}</Text></Pressable>
                <Text style={[styles.muted, { fontSize: 29 * s, lineHeight: 37 * s }]}>{item.handle} · {item.age}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * s }}><FeedIcon name="pin" size={29 * s} color="#595e90" /><Text style={[styles.muted, { flex: 1, fontSize: 29 * s, lineHeight: 35 * s }]}>{item.location}</Text></View>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`More options for ${item.name}'s post`} onPress={() => soon('Post options', 'These are sample posts. Reporting and other post actions will be available with real posts.')} hitSlop={12} style={{ width: 38 * s, height: 62 * s, alignSelf: 'flex-start', justifyContent: 'center', marginRight: 0 }}><FeedIcon name="more" size={38 * s} color="#303667" /></Pressable>
          </View>
          <Text style={[styles.caption, { marginTop: 5 * s, marginBottom: 20 * s, paddingHorizontal: 9 * s, fontSize: 41 * s, lineHeight: 48 * s, letterSpacing: -1.1 * s }]}>{fontScale > 1.1 ? item.caption.replace('\n', ' ') : item.caption}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={item.video ? 'Play Marcus’s sample video' : 'View Jamie’s photo'} onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })} style={{ borderRadius: 24 * s, overflow: 'hidden' }}>
            <ReferenceArtwork region={item.media} width={canvas - 78 * s - 2} label={item.mediaLabel} />
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 52 * s, minHeight: 95 * s, paddingHorizontal: 8 * s }}>
            <Pressable testID={`like-${item.id}`} accessibilityRole="button" accessibilityLabel={`${isLiked ? 'Unlike' : 'Like'} ${item.name}'s post, ${count} likes`} accessibilityState={{ selected: isLiked }} onPress={() => toggleLike(item.id)} style={[styles.action, { gap: 13 * s, minWidth: 140 * s }]}><FeedIcon name="heart" size={51 * s} color={isLiked ? '#ff193d' : '#080a35'} filled={isLiked} /><Text style={[styles.count, { fontSize: 34 * s }]}>{likes}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`${(comments[item.id] ?? []).length} comments on ${item.name}'s post`} onPress={() => router.push({ pathname: '/comments/[id]', params: { id: item.id } })} style={[styles.action, { gap: 18 * s }]}><FeedIcon name="message" size={47 * s} /><Text style={[styles.count, { fontSize: 34 * s }]}>{(comments[item.id] ?? []).length}</Text></Pressable>
          </View>
        </View>;
      }} />

    </View>
    <Modal visible={!!notice} transparent animationType="fade" onRequestClose={() => setNotice(null)}><View style={styles.backdrop}><View style={styles.dialog}><Text accessibilityRole="header" style={styles.dialogTitle}>{notice?.title}</Text><Text style={styles.dialogBody}>{notice?.body}</Text><Pressable accessibilityRole="button" onPress={() => setNotice(null)} style={styles.dismiss}><Text style={{ color: 'white', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>Got it</Text></Pressable></View></View></Modal>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fcfdff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eef2fa', boxShadow: '0px 4px 18px rgba(73, 110, 168, 0.025)' },
  name: { fontFamily: 'Inter_700Bold', color: '#080a35', letterSpacing: -0.5 },
  muted: { fontFamily: 'Inter_400Regular', color: '#595e90', letterSpacing: -0.4 },
  caption: { fontFamily: 'Inter_400Regular', color: '#080a35' },
  count: { fontFamily: 'Inter_600SemiBold', color: '#080a35', letterSpacing: -0.5 },
  action: { flexDirection: 'row', alignItems: 'center', minHeight: 44 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eef2fa', boxShadow: '0px -3px 16px rgba(73, 110, 168, 0.035)' },
  backdrop: { flex: 1, backgroundColor: '#030b2c55', justifyContent: 'center', alignItems: 'center', padding: 26 },
  dialog: { width: '100%', maxWidth: 380, padding: 26, borderRadius: 24, backgroundColor: 'white', gap: 16 },
  dialogTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, color: '#080a35' },
  dialogBody: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: '#595e90' },
  dismiss: { backgroundColor: '#005cff', borderRadius: 25, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
});
