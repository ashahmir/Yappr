import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { allPosts, compactCount, detailArtwork } from '../data/explore-posts';
import { DemoArtwork } from './demo-artwork';
import { usePostState } from './post-state';
import { useComments } from './comment-state';
import { UiIcon } from './ui-icon';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = allPosts.find(p => p.id === id);
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width, 600), s = canvas / 941;
  const state = usePostState();
  const { comments } = useComments();
  const commentCount = (comments[id] ?? []).length;
  const [notice, setNotice] = useState<string | null>(null);
  const back = () => router.canGoBack() ? router.back() : router.replace('/explore');
  if (!post) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 }}><Text style={styles.name}>Post not found</Text><Pressable accessibilityRole="button" onPress={back}><Text style={styles.muted}>Back to Explore</Text></Pressable></View>;
  const liked = !!state.liked[id], saved = !!state.saved[id], following = !!state.following[post.handle];
  const likes = post.likes + (['jamie-santorini', 'marcus-yosemite'].includes(id) ? (liked ? 0 : -1) : (liked ? 1 : 0));
  const heroHeight = Math.max(340 * s, height - 465 * s - insets.bottom);
  return <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <StatusBar style="light" />
    <ScrollView testID="post-detail" showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingBottom: insets.bottom }}>
      <View style={{ width: canvas, height: heroHeight, backgroundColor: '#ddd' }}>
        <DemoArtwork source={id === 'jamie-santorini' ? detailArtwork : post.source} region={id === 'jamie-santorini' ? [0, 178, 941, 1028] : post.region} width={canvas} height={heroHeight} label={post.caption} />
        {post.video && <Pressable accessibilityRole="button" accessibilityLabel="Play sample video" onPress={() => setNotice('This is a dummy video thumbnail. Video playback will be connected when real media is added.')} style={{ position: 'absolute', alignSelf: 'center', top: '43%', padding: 16, borderRadius: 60, backgroundColor: '#0008' }}><UiIcon name="play" filled color="white" size={40} /></Pressable>}
      </View>
      <View style={{ width: canvas, backgroundColor: '#fff', borderTopLeftRadius: 12 * s, borderTopRightRadius: 12 * s, marginTop: -5 * s, paddingTop: 31 * s, paddingHorizontal: 46 * s }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 * s }}>
          <View style={{ borderRadius: 100, overflow: 'hidden' }}><DemoArtwork source={post.avatarSource} region={post.avatar} width={120 * s} height={120 * s} label={`${post.name}'s profile photo`} /></View>
          <View style={{ flex: 1 }}><Text style={[styles.name, { fontSize: 41 * s, letterSpacing: -1 * s }]}>{post.name}</Text><Text style={[styles.muted, { fontSize: 32 * s, marginTop: 3 * s }]}>{post.handle}</Text></View>
          <Pressable accessibilityRole="button" accessibilityLabel={following ? `Unfollow ${post.name}` : `Follow ${post.name}`} accessibilityState={{ selected: following }} onPress={() => state.toggleFollow(post.handle)} style={{ borderWidth: 1, borderColor: '#005cff', borderRadius: 100, minHeight: 44, paddingHorizontal: 27 * s, justifyContent: 'center', backgroundColor: following ? '#eef4ff' : '#fff' }}><Text style={{ fontFamily: 'Inter_600SemiBold', color: '#005cff', fontSize: (following ? 27 : 34) * s }}>{following ? 'Following' : 'Follow'}</Text></Pressable>
        </View>
        <Text style={{ marginTop: 23 * s, fontFamily: 'Inter_400Regular', fontSize: 43 * s, lineHeight: 49 * s, letterSpacing: -1.1 * s, color: '#080a35' }}>{fontScale > 1.1 ? post.caption.replace('\n', ' ') : post.caption}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 * s, marginTop: 18 * s, marginBottom: 23 * s }}><UiIcon name="pin" filled size={35 * s} color="#595e90" /><Text style={[styles.muted, { flex: 1, fontSize: 32 * s }]}>{post.location}  ·  {post.age}</Text></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#e8ebf5', paddingTop: 12 * s, paddingBottom: 8 * s, gap: 38 * s, flexWrap: fontScale > 1.3 ? 'wrap' : 'nowrap' }}>
          <Pressable testID="detail-like" accessibilityRole="button" accessibilityLabel={`${liked ? 'Unlike' : 'Like'} post, ${likes} likes`} accessibilityState={{ selected: liked }} onPress={() => state.toggleLike(id)} style={[styles.action, { gap: 24 * s }]}><UiIcon name="heart" filled={liked} color={liked ? '#ff193d' : '#080a35'} size={59 * s} /><Text style={[styles.count, { fontSize: 34 * s }]}>{compactCount(likes)}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`${commentCount} comments`} onPress={() => router.push({ pathname: '/comments/[id]', params: { id } })} style={[styles.action, { gap: 24 * s }]}><UiIcon name="message" size={57 * s} /><Text style={[styles.count, { fontSize: 34 * s }]}>{commentCount}</Text></Pressable>
          <View style={{ flex: 1 }} />
          <Pressable accessibilityRole="button" accessibilityLabel="Share post" onPress={async () => { try { await Share.share({ message: `${post.name}: ${post.caption} — ${post.location} (Yappr demo)` }); } catch { setNotice('Sharing is not available right now. Please try again.'); } }} style={styles.action}><UiIcon name="share" size={58 * s} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={saved ? 'Unsave post' : 'Save post'} accessibilityState={{ selected: saved }} onPress={() => state.toggleSave(id)} style={styles.action}><UiIcon name="bookmark" size={53 * s} color={saved ? '#005cff' : '#080a35'} filled={saved} /></Pressable>
        </View>
      </View>
    </ScrollView>
        <View style={{ position: 'absolute', top: insets.top + 20 * s, width: canvas, alignSelf: 'center', paddingHorizontal: 34 * s, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to feed" onPress={back} style={styles.topButton}><UiIcon name="back" color="white" size={52 * s} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Post options" onPress={() => setNotice('This is a sample post. Reporting and other moderation actions will be available with real posts.')} style={styles.topButton}><UiIcon name="more" color="white" size={49 * s} /></Pressable>
        </View>

    <Modal visible={!!notice} transparent animationType="fade" onRequestClose={() => setNotice(null)}><View style={styles.backdrop}><View style={styles.dialog}><Text style={[styles.name, { fontSize: 22 }]}>Demo post</Text><Text style={[styles.muted, { fontSize: 16, lineHeight: 24 }]}>{notice}</Text><Pressable accessibilityRole="button" onPress={() => setNotice(null)} style={{ minHeight: 48, borderRadius: 30, backgroundColor: '#005cff', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: 'white', fontFamily: 'Inter_600SemiBold' }}>Got it</Text></Pressable></View></View></Modal>
  </View>;
}
const styles = StyleSheet.create({ name: { fontFamily: 'Inter_700Bold', color: '#080a35' }, muted: { fontFamily: 'Inter_400Regular', color: '#595e90' }, count: { fontFamily: 'Inter_600SemiBold', color: '#080a35' }, action: { flexDirection: 'row', alignItems: 'center', minHeight: 44, minWidth: 44 }, topButton: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' }, backdrop: { flex: 1, backgroundColor: '#030b2c55', alignItems: 'center', justifyContent: 'center', padding: 24 }, dialog: { backgroundColor: 'white', borderRadius: 24, padding: 26, gap: 18, maxWidth: 380, width: '100%' } });
