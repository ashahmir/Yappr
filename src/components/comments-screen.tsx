import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoComment, commentArtwork, demoCommentAuthor } from '../data/demo-comments';
import { allPosts } from '../data/explore-posts';
import { useComments } from './comment-state';
import { DemoArtwork } from './demo-artwork';
import { UiIcon } from './ui-icon';

const ink = '#080a35', muted = '#595e90', blue = '#005cff';

export default function CommentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Key the local composer by post so a draft can never move to another post.
  return <Conversation key={id} postId={id} />;
}

function Conversation({ postId }: { postId: string }) {
  const post = allPosts.find(p => p.id === postId);
  const { comments, add, remove, toggleLike } = useComments();
  const items = comments[postId] ?? [];
  const roots = items.filter(c => !c.parentId);
  const insets = useSafeAreaInsets();
  const { width, fontScale } = useWindowDimensions();
  const canvas = Math.min(width - insets.left - insets.right, 600), s = canvas / 941;
  const [draft, setDraft] = useState('');
  const [inputHeight, setInputHeight] = useState(44);
  const [replyTo, setReplyTo] = useState<DemoComment | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<string | null>(null);
  const [attachment, setAttachment] = useState(false);
  const [picker, setPicker] = useState(false);
  const input = useRef<TextInput>(null);
  const list = useRef<FlatList<DemoComment>>(null);
  const scrollAfterSend = useRef(false);
  const singleOwn = roots.length === 1 && roots[0].own;
  const back = () => router.canGoBack() ? router.back() : router.replace('/explore');
  const text = { fontFamily: 'Inter_400Regular', color: ink, fontSize: 36 * s, lineHeight: 49 * s };
  const small = { ...text, color: muted, fontSize: 34 * s, lineHeight: 43 * s };
  const avatar = (comment: Pick<DemoComment, 'avatar' | 'name'>, size: number) => <View style={{ borderRadius: size, overflow: 'hidden' }}><DemoArtwork source={commentArtwork} region={comment.avatar} width={size} label={`${comment.name}'s profile photo`} /></View>;
  const beginReply = (comment: DemoComment) => {
    setReplyTo(comment); setMenu(null);
    setExpanded(v => ({ ...v, [comment.parentId ?? comment.id]: true }));
    input.current?.focus();
  };
  const send = () => {
    if (!draft.trim() && !attachment) return;
    const parentId = replyTo ? replyTo.parentId ?? replyTo.id : undefined;
    add(postId, draft, parentId, attachment);
    if (parentId) {
      setExpanded(v => ({ ...v, [parentId]: true }));
      const index = roots.findIndex(c => c.id === parentId);
      if (index >= 0) list.current?.scrollToIndex({ index, animated: true, viewPosition: 0 });
    } else scrollAfterSend.current = true;
    setDraft(''); setInputHeight(44); setAttachment(false); setReplyTo(null); setMenu(null);
  };
  const renderComment = (comment: DemoComment, nested = false) => {
    const replies = items.filter(c => c.parentId === comment.id);
    return <View testID={`comment-${comment.id}`} style={{ paddingTop: (nested ? 20 : 38) * s, paddingBottom: (nested ? 8 : 25) * s }}>
      <View style={{ flexDirection: 'row', gap: (nested ? 22 : 36) * s }}>
        {avatar(comment, (nested ? 80 : 129) * s)}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingRight: singleOwn ? 0 : 40 * s }}>
            <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 14 * s }}>
              <Text style={[text, { fontFamily: 'Inter_700Bold', fontSize: 37 * s, letterSpacing: -0.8 * s }]}>{comment.name}</Text>
              <Text style={[small, { fontSize: 32 * s, letterSpacing: -0.6 * s }]}>{comment.handle} · {comment.age}</Text>
            </View>
            {!singleOwn && <Pressable accessibilityRole="button" accessibilityLabel={`Options for ${comment.name}'s comment`} accessibilityState={{ expanded: menu === comment.id }} onPress={() => setMenu(menu === comment.id ? null : comment.id)} style={[styles.target, { position: 'absolute', top: -10, right: -10 * s }]}><UiIcon name="more" size={46 * s} color={muted} /></Pressable>}
          </View>
          {!!comment.text && <Text style={[text, { marginTop: 8 * s, letterSpacing: -0.65 * s }, singleOwn && !nested && { fontSize: 38 * s, maxWidth: 600 * s }]}>{comment.text}</Text>}
          {comment.image && <View style={{ borderRadius: 14, overflow: 'hidden', alignSelf: 'flex-start', marginTop: 10 }}><DemoArtwork source={commentArtwork} region={[45, 230, 200, 209]} width={160} height={130} label="Attached sample sunset photo" /></View>}
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 75 * s, marginTop: 20 * s }}>
            <Pressable accessibilityRole="button" accessibilityLabel={`${comment.liked ? 'Unlike' : 'Like'} comment by ${comment.name}, ${comment.likes} likes`} accessibilityState={{ selected: !!comment.liked }} onPress={() => toggleLike(postId, comment.id)} style={[styles.target, { flexDirection: 'row', gap: 24 * s }]}><UiIcon name="heart" size={54 * s} filled={comment.liked} color={comment.liked ? '#ff2447' : '#494f83'} /><Text style={small}>{comment.likes}</Text></Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Reply to ${comment.name}`} onPress={() => beginReply(comment)} style={styles.target}><Text style={[small, { fontFamily: 'Inter_600SemiBold' }]}>Reply</Text></Pressable>
            {singleOwn && <Pressable accessibilityRole="button" accessibilityLabel={`Options for ${comment.name}'s comment`} accessibilityState={{ expanded: menu === comment.id }} onPress={() => setMenu(menu === comment.id ? null : comment.id)} style={styles.target}><UiIcon name="more" size={54 * s} /></Pressable>}
          </View>
          {menu === comment.id && <View style={[styles.menu, { padding: 24 * s, marginTop: 10 * s, borderRadius: 25 * s }, singleOwn && fontScale <= 1.3 && { marginHorizontal: 44 * s }]}>
            <Pressable accessibilityRole="button" accessibilityLabel={comment.own ? 'Delete comment' : 'Reply to comment'} onPress={() => {
              if (!comment.own) { beginReply(comment); return; }
              remove(postId, comment.id); setMenu(null);
              if (replyTo?.id === comment.id || replyTo?.parentId === comment.id) setReplyTo(null);
            }} style={[styles.target, { flexDirection: 'row', gap: 28 * s, paddingVertical: 14 * s }]}>
              {comment.own && <Image source={require('../../assets/images/comments/trash.svg')} style={{ width: 58 * s, height: 65 * s }} />}
              <Text style={[text, { color: comment.own ? '#ff2447' : blue, fontFamily: 'Inter_600SemiBold', flexShrink: 1 }]}>{comment.own ? 'Delete comment' : 'Reply to comment'}</Text>
            </Pressable>
          </View>}
          {!nested && replies.length > 0 && <Pressable accessibilityRole="button" accessibilityLabel={`${expanded[comment.id] ? 'Hide' : 'View'} ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`} accessibilityState={{ expanded: !!expanded[comment.id] }} onPress={() => setExpanded(v => ({ ...v, [comment.id]: !v[comment.id] }))} style={[styles.target, { alignSelf: 'flex-start' }]}><Text style={[small, { color: blue, fontSize: 30 * s }]}>{expanded[comment.id] ? 'Hide replies' : `View ${replies.length} ${replies.length === 1 ? 'reply' : 'replies'}`}</Text></Pressable>}
          {!nested && expanded[comment.id] && replies.map(reply => <View key={reply.id}>{renderComment(reply, true)}</View>)}
        </View>
      </View>
    </View>;
  };

  return <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined} style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <StatusBar style="dark" />
    <View style={{ width: canvas, flex: 1, alignSelf: 'center' }}>
      <View style={{ minHeight: 137 * s, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 28 * s }}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back from comments" onPress={back} style={styles.target}><UiIcon name="back" color={blue} size={57 * s} /></Pressable>
        <Text accessibilityRole="header" style={{ flex: 1, textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 49 * s, color: ink, letterSpacing: -1.5 * s }}>Comments</Text>
        <View style={{ width: 44 }} />
      </View>
      {!post ? <View style={styles.empty}><Text style={text}>Post not found</Text></View> : <>
        <FlatList ref={list} testID="comments-list" data={roots} keyExtractor={c => c.id} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => setMenu(null)}
          onScrollToIndexFailed={({ averageItemLength, index }) => list.current?.scrollToOffset({ offset: averageItemLength * index, animated: true })}
          onContentSizeChange={() => { if (scrollAfterSend.current) { list.current?.scrollToEnd({ animated: true }); scrollAfterSend.current = false; } }}
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 36 * s, paddingTop: singleOwn ? 42 * s : 5 * s, paddingBottom: 20 * s }}
          ListHeaderComponent={roots.length > 0 && !singleOwn ? <Pressable accessibilityRole="button" accessibilityLabel="View original post" onPress={() => router.push({ pathname: '/post/[id]', params: { id: postId } })} style={{ flexDirection: 'row', gap: 30 * s, padding: 23 * s, borderWidth: 1, borderColor: '#eef2fa', borderRadius: 25 * s, marginHorizontal: -15 * s, marginBottom: 6 * s }}>
            <View style={{ borderRadius: 17 * s, overflow: 'hidden' }}><DemoArtwork source={postId === 'jamie-santorini' ? commentArtwork : post.source} region={postId === 'jamie-santorini' ? [45, 230, 200, 209] : post.region} width={200 * s} height={209 * s} label={post.location} /></View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={[small, { fontSize: 32 * s }]}><Text style={{ fontFamily: 'Inter_700Bold', color: ink, fontSize: 37 * s }}>{post.name} </Text> {post.handle} · {post.age}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * s, marginTop: 6 * s }}><UiIcon name="pin" filled size={34 * s} color={muted} /><Text style={[small, { flex: 1 }]}>{post.location}</Text></View>
              <Text numberOfLines={fontScale > 1.3 ? 2 : 1} style={[text, { marginTop: 27 * s }]}>{post.caption.replace('\n', ' ')}</Text>
            </View>
          </Pressable> : null}
          ListEmptyComponent={<View style={styles.empty}>
            <Image source={require('../../assets/images/comments/empty.svg')} style={{ width: 550 * s, height: 420 * s, marginBottom: 120 * s }} contentFit="contain" accessible={false} />
            <Text style={{ fontFamily: 'Inter_700Bold', color: ink, fontSize: 63 * s, textAlign: 'center', letterSpacing: -2 * s }}>No comments yet.</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', color: '#7a80ae', fontSize: 53 * s, lineHeight: 66 * s, marginTop: 28 * s, textAlign: 'center', maxWidth: 720 * s }}>Be the first to share what you think!</Text>
          </View>}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#edf1fa' }} />}
          renderItem={({ item }) => renderComment(item)} />
        <View style={{ paddingHorizontal: 34 * s, paddingTop: 10 * s, paddingBottom: Math.max(insets.bottom, 32 * s), backgroundColor: 'white' }}>
          {replyTo && <View style={styles.replyBar}><Text style={{ ...small, fontSize: Math.max(13, 30 * s), flex: 1 }}>Replying to {replyTo.name}</Text><Pressable accessibilityRole="button" accessibilityLabel="Cancel reply" onPress={() => setReplyTo(null)} style={styles.target}><Text style={{ color: blue, fontSize: 22 }}>×</Text></Pressable></View>}
          {attachment && <View style={styles.replyBar}><DemoArtwork source={commentArtwork} region={[45, 230, 200, 209]} width={48} label="Sample photo attachment" /><Text style={{ ...small, fontSize: 13, flex: 1 }}>Sample photo</Text><Pressable accessibilityRole="button" accessibilityLabel="Remove attachment" onPress={() => setAttachment(false)} style={styles.target}><Text style={{ color: blue, fontSize: 22 }}>×</Text></Pressable></View>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15 * s }}>
            {fontScale <= 1.3 && avatar(demoCommentAuthor, 102 * s)}
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f4fb', borderRadius: 44 * s, paddingLeft: 35 * s, paddingRight: 10 * s, minHeight: Math.max(44, 106 * s) }}>
              <TextInput ref={input} testID="comment-input" accessibilityLabel={replyTo ? 'Write a reply' : 'Add a comment'} placeholder={replyTo ? 'Add a reply...' : 'Add a comment...'} placeholderTextColor="#7a80ae" value={draft} onChangeText={setDraft} onContentSizeChange={event => setInputHeight(Math.max(44, Math.min(120, event.nativeEvent.contentSize.height)))} multiline numberOfLines={1} maxLength={2000} style={{ ...text, fontSize: 36 * s, lineHeight: 46 * s, flex: 1, minWidth: 0, height: inputHeight, maxHeight: 120, paddingVertical: 10, paddingHorizontal: 0 }} />
              <Pressable accessibilityRole="button" accessibilityLabel="Attach sample photo" onPress={() => { setPicker(true); setMenu(null); }} style={styles.target}><Image source={require('../../assets/images/comments/image.svg')} style={{ width: 45 * s, height: 48 * s }} /></Pressable>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={replyTo ? 'Send reply' : 'Send comment'} accessibilityState={{ disabled: !draft.trim() && !attachment }} disabled={!draft.trim() && !attachment} onPress={send} style={{ minWidth: 64, minHeight: Math.max(46, 110 * s), paddingHorizontal: 25 * s, borderRadius: 33 * s, backgroundColor: blue, justifyContent: 'center', alignItems: 'center' }}><Text style={{ fontFamily: 'Inter_600SemiBold', color: 'white', fontSize: 38 * s }}>Send</Text></Pressable>
          </View>
        </View>
      </>}
    </View>
    <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
      <Pressable accessibilityRole="button" accessibilityLabel="Close photo picker" onPress={() => setPicker(false)} style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.dialog}>
          <Text style={{ ...text, fontSize: 22, fontFamily: 'Inter_700Bold' }}>Add a sample photo</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Select sunset photo" onPress={() => { setAttachment(true); setPicker(false); }}><DemoArtwork source={commentArtwork} region={[45, 230, 200, 209]} width={160} height={160} label="Sunset in Santorini" /></Pressable>
          <Pressable accessibilityRole="button" onPress={() => setPicker(false)} style={styles.target}><Text style={{ color: blue, fontSize: 16 }}>Cancel</Text></Pressable>
        </View>
      </Pressable>
    </Modal>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' },
  target: { minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 32 },
  menu: { backgroundColor: 'white', borderWidth: 1, borderColor: '#e8edf8', boxShadow: '0px 6px 24px rgba(25, 35, 65, 0.10)' },
  replyBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 8 },
  backdrop: { flex: 1, backgroundColor: '#080a3544', justifyContent: 'center', alignItems: 'center', padding: 24 },
  dialog: { width: '100%', maxWidth: 360, borderRadius: 24, backgroundColor: 'white', padding: 24, gap: 16, alignItems: 'center' },
});
