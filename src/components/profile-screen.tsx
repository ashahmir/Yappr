import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DemoProfile, demoProfiles, ownProfileTiles, ProfileTile } from '../data/demo-profiles';
import { allPosts, compactCount } from '../data/explore-posts';
import { DemoArtwork } from './demo-artwork';
import { FeedIcon } from './feed-icon';
import { usePostState } from './post-state';
import { UiIcon } from './ui-icon';

type Identity = { name: string; handle: string; imageUrl?: string; avatar?: number };
const blue = '#005cff', ink = '#0b1639', muted = '#657599';
export default function ProfileScreen({ own = false, identity, profile }: { own?: boolean; identity?: Identity; profile?: DemoProfile }) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 600), s = canvas / 1080;
  const state = usePostState();
  const [section, setSection] = useState<'Posts' | 'Videos' | 'Saved'>('Posts');
  const [notice, setNotice] = useState<{ title: string; body: string } | null>(null);
  const [people, setPeople] = useState<'Followers' | 'Following' | null>(null);
  const [selected, setSelected] = useState<ProfileTile | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const scroll = useRef<ScrollView>(null);
  const back = () => router.canGoBack() ? router.back() : router.replace('/explore');
  const openProfile = (id: string) => { setPeople(null); router.push({ pathname: '/explore/people/[handle]', params: { handle: id } }); };
  const soon = (title: string, body: string) => setNotice({ title, body });
  if ((!own && !profile) || (own && !identity)) return <View style={[styles.root, styles.empty]}><Text style={styles.modalTitle}>Profile not found</Text><Pressable accessibilityRole="button" onPress={back} style={styles.target}><Text style={styles.link}>Back to Explore</Text></Pressable></View>;
  const name = own ? identity!.name : profile!.name;
  const handle = own ? identity!.handle : profile!.handle;
  const following = !own && !!state.following[handle];
  const bio = own ? 'Good coffee, better people.\nTravel, photos, and random thoughts.' : profile!.bio;
  const avatar = own ? identity!.imageUrl ? { uri: identity!.imageUrl } : identity!.avatar : profile!.avatar;
  const avatarRegion = own ? undefined : profile!.avatarRegion;
  const savedTiles: ProfileTile[] = own ? allPosts.filter(p => state.saved[p.id]).map(p => ({ id: p.id, image: p.source, region: p.region, label: p.caption, postId: p.id, video: p.video })) : [];
  const posts = own ? ownProfileTiles : profile!.tiles;
  const tiles = section === 'Saved' ? savedTiles : section === 'Videos' ? posts.filter(p => p.video) : posts;
  const followCount = own ? 420 + Object.values(state.following).filter(Boolean).length : profile!.following;
  const followerCount = own ? 12400 : profile!.followers + (following ? 1 : 0);
  const stat = (value: number, label: 'Posts' | 'Followers' | 'Following') => <Pressable key={label} accessibilityRole="button" accessibilityLabel={`${value} ${label.toLowerCase()}`} onPress={() => label === 'Posts' ? setSection('Posts') : setPeople(label)} style={{ flex: 1, alignItems: 'center', minHeight: 44, paddingVertical: 8 * s }}>
    <Text style={[styles.bold, { fontSize: 41 * s }]}>{compactCount(value)}</Text><Text style={[styles.muted, { fontSize: 29 * s, marginTop: 3 * s }]}>{label}</Text>
  </Pressable>;
  const picture = (tile: ProfileTile, w: number, h: number) => tile.region ? <DemoArtwork source={tile.image} region={tile.region} width={w} height={h} /> : <Image source={tile.image} contentFit="cover" style={{ width: w, height: h }} accessible={false} />;
  const tile = (item: ProfileTile, w: number, h: number) => <Pressable testID={`profile-tile-${item.id}`} key={item.id} accessibilityRole="button" accessibilityLabel={`Open post: ${item.label}`} onPress={() => item.postId ? router.push({ pathname: '/post/[id]', params: { id: item.postId } }) : setSelected(item)} style={({ pressed }) => ({ width: w, height: h, borderRadius: 10 * s, overflow: 'hidden', backgroundColor: '#edf2fb', opacity: pressed ? 0.8 : 1 })}>
    {picture(item, w, h)}{item.video && <View style={{ position: 'absolute', right: 8, top: 8 }}><UiIcon name="play" color="white" filled size={20} /></View>}
  </Pressable>;
  return <View testID={own ? 'own-profile' : 'public-profile'} style={[styles.root, { paddingTop: insets.top, paddingLeft: insets.left, paddingRight: insets.right }]}>
    <ScrollView ref={scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ width: canvas, alignSelf: 'center', paddingBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 40 * s, minHeight: 110 * s }}>
        <Pressable accessibilityRole="button" accessibilityLabel={own ? 'Profile settings' : 'Back from profile'} onPress={() => own ? router.push('/account') : back()} style={styles.target}>
          {own ? <Image source={require('../../assets/images/profiles/settings.svg')} style={{ width: 64 * s, height: 64 * s }} accessible={false} /> : <UiIcon name="back" size={55 * s} color={ink} />}
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={own ? 'Create profile post' : 'Profile options'} onPress={() => own ? soon('Create a post', 'Post creation is coming later. These are sample posts for your profile preview.') : soon('Profile options', 'Additional profile actions will be available in a later update.')} style={styles.target}>
          {own ? <View style={{ backgroundColor: blue, borderRadius: 100, width: 64 * s, height: 64 * s, alignItems: 'center', justifyContent: 'center' }}><FeedIcon name="plus" size={36 * s} color="white" /></View> : <UiIcon name="more" size={55 * s} color={ink} />}
        </Pressable>
      </View>
      <View style={{ alignItems: 'center', paddingHorizontal: 40 * s }}>
        <View style={{ width: 252 * s, height: 252 * s, marginTop: 2 * s, marginBottom: 30 * s }}>
          <View style={{ width: 252 * s, height: 252 * s, borderRadius: 126 * s, overflow: 'hidden', backgroundColor: '#eaf1ff', alignItems: 'center', justifyContent: 'center' }}>
            {avatar && !imageFailed ? avatarRegion ? <DemoArtwork source={avatar as number} region={avatarRegion} width={252 * s} label={`${name}'s profile photo`} /> : <Image key={typeof avatar === 'number' ? avatar : avatar.uri} source={avatar} onError={() => setImageFailed(true)} contentFit="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel={`${name}'s profile photo`} /> : <Text accessibilityLabel={`${name}'s profile photo placeholder`} style={[styles.bold, { color: blue, fontSize: 85 * s }]}>{name.split(' ').map(part => part[0]).slice(0, 2).join('')}</Text>}
          </View>
          {own && <Pressable accessibilityRole="button" accessibilityLabel="Change profile photo" onPress={() => soon('Edit profile photo', 'Changing your profile photo is coming later. For now, your Google account photo is used.')} style={[styles.target, { position: 'absolute', right: -12 * s, bottom: -10 * s }]}><View style={{ borderWidth: 5 * s, borderColor: 'white', borderRadius: 100, width: 68 * s, height: 68 * s, backgroundColor: blue, alignItems: 'center', justifyContent: 'center' }}><FeedIcon name="plus" color="white" size={37 * s} /></View></Pressable>}
        </View>
        <Text testID="profile-name" accessibilityRole="header" style={[styles.bold, { fontSize: 57 * s, textAlign: 'center', letterSpacing: -1.2 * s }]}>{name}</Text>
        <Text testID="profile-handle" style={[styles.muted, { fontSize: 34 * s, textAlign: 'center' }]}>{handle || 'Username not set'}</Text>
        <View style={{ marginTop: 22 * s, paddingHorizontal: 20 * s, width: '100%' }}>
          <Text style={[styles.muted, { fontSize: 29 * s, lineHeight: 37 * s, textAlign: 'center' }]}>{bio}<Text style={{ color: own ? '#ffbf38' : '#578960' }}>{own ? '  ✦' : profile!.id === 'alexrivera' ? '  ▴' : ''}</Text></Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', marginHorizontal: 45 * s, marginTop: (own ? 51 : 48) * s, marginBottom: 20 * s }}>
        {stat(own ? 66 : profile!.posts, 'Posts')}{stat(followerCount, 'Followers')}{stat(followCount, 'Following')}
      </View>
      <View style={{ flexDirection: fontScale > 1.6 ? 'column' : 'row', gap: 20 * s, marginHorizontal: 65 * s }}>
        {own ? <Pressable accessibilityRole="button" onPress={() => soon('Edit Profile', 'Editing your name, username, bio, and profile photo is coming later. Your Google name and photo are shown for now.')} style={[styles.profileButton, { backgroundColor: '#eaf0ff', minHeight: Math.max(44, 82 * s) }]}><Text style={[styles.buttonText, { fontSize: 35 * s }]}>Edit Profile</Text></Pressable> : <>
          <Pressable testID="profile-follow" accessibilityRole="button" accessibilityLabel={following ? `Unfollow ${name}` : `Follow ${name}`} accessibilityState={{ selected: following }} onPress={() => state.toggleFollow(handle)} style={[styles.profileButton, { backgroundColor: following ? '#eaf0ff' : blue, minHeight: Math.max(44, 82 * s) }]}><Text style={[styles.buttonText, { color: following ? muted : 'white', fontSize: 35 * s }]}>{following ? 'Following' : 'Follow'}{following ? ' ⌄' : ''}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={`Message ${name}`} onPress={() => soon('Messaging is coming later', 'Messaging from profiles will be added later. No message or request has been sent.')} style={[styles.profileButton, { borderWidth: 1, borderColor: '#dfe6f3', minHeight: Math.max(44, 82 * s) }]}><Text style={[styles.buttonText, { fontSize: 35 * s }]}>Message</Text></Pressable>
        </>}
      </View>
      <View style={{ flexDirection: 'row', marginHorizontal: 26 * s, marginTop: 15 * s, marginBottom: 10 * s }}>
        {(['Posts', 'Videos', ...(own ? ['Saved' as const] : [])] as const).map(label => <Pressable key={label} accessibilityRole="tab" accessibilityLabel={`${label}${label === 'Saved' ? ' (private)' : ''}`} accessibilityState={{ selected: section === label }} onPress={() => setSection(label)} style={{ flex: 1, minHeight: Math.max(52, 110 * s), alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderColor: section === label ? blue : 'transparent' }}>
          {label === 'Saved' ? <UiIcon name="bookmark" size={56 * s} color={section === label ? blue : muted} /> : <Image source={label === 'Posts' ? require('../../assets/images/profiles/grid.svg') : require('../../assets/images/profiles/videos.svg')} tintColor={section === label ? blue : muted} style={{ width: 56 * s, height: 56 * s }} accessible={false} />}
        </Pressable>)}
        {!own && <View accessibilityLabel="Saved posts are private" style={{ flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' }}><UiIcon name="bookmark" size={56 * s} color="#a3aec5" /></View>}
      </View>
      <View testID="profile-grid" style={{ paddingHorizontal: 32 * s, gap: 8 * s }}>
        {tiles.length === 0 ? <View testID="profile-section-empty" style={styles.empty}><UiIcon name={section === 'Saved' ? 'bookmark' : 'play'} size={36} color={muted} /><Text style={[styles.bold, { fontSize: 19, marginTop: 14 }]}>{section === 'Saved' ? 'No saved posts yet' : 'No videos yet'}</Text><Text style={[styles.muted, { fontSize: 14, textAlign: 'center', marginTop: 8 }]}>{section === 'Saved' ? 'Posts you save will appear here. Only you can see them.' : 'Videos will appear here when they are shared.'}</Text></View> : own && section === 'Posts' ? <>
          <View style={{ flexDirection: 'row', gap: 8 * s }}>{tiles.slice(0, 3).map(p => tile(p, (canvas - 80 * s) / 3, 313 * s))}</View>
          <View style={{ flexDirection: 'row', gap: 8 * s }}>{tile(tiles[3], 674 * s, 395 * s)}{tile(tiles[5], canvas - 746 * s, 395 * s)}</View>
          <View style={{ flexDirection: 'row' }}>{tile(tiles[4], canvas - 64 * s, 340 * s)}</View>
        </> : <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 * s }}>{tiles.map((p, index) => tile(p, profile?.id === 'alexrivera' && section === 'Posts' && index > 1 ? (index === 2 ? 318 : 690) * s : (canvas - 72 * s) / 2, 338 * s))}</View>}
      </View>
    </ScrollView>
    <Modal visible={!!notice || !!people || !!selected} transparent animationType="fade" onRequestClose={() => { setNotice(null); setPeople(null); setSelected(null); }}>
      <View style={styles.backdrop}>
        <Pressable accessibilityRole="button" accessibilityLabel="Dismiss profile dialog" onPress={() => { setNotice(null); setPeople(null); setSelected(null); }} style={StyleSheet.absoluteFill} />
        <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalBody} accessibilityViewIsModal>
          <Text accessibilityRole="header" style={styles.modalTitle}>{notice?.title ?? people ?? name}</Text>
          {notice && <Text style={styles.modalText}>{notice.body}</Text>}
          {people && <><Text style={styles.modalText}>Sample profiles</Text>{demoProfiles.filter(p => p.handle !== handle).map(p => <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`View ${p.name}'s profile`} onPress={() => openProfile(p.id)} style={{ minHeight: 52, justifyContent: 'center', borderBottomWidth: 1, borderColor: '#edf1f8' }}><Text style={[styles.bold, { fontSize: 17 }]}>{p.name}</Text><Text style={[styles.muted, { fontSize: 13 }]}>{p.handle}</Text></Pressable>)}</>}
          {selected && <><View style={{ borderRadius: 12, overflow: 'hidden', width: '100%' }}><Image source={selected.image} contentFit="cover" style={{ width: '100%', aspectRatio: 1 }} /></View><Text style={styles.modalText}>{selected.label}</Text><Text style={[styles.muted, { fontSize: 12 }]}>Sample post</Text></>}
          <Pressable accessibilityRole="button" onPress={() => { setNotice(null); setPeople(null); setSelected(null); }} style={styles.close}><Text style={{ color: 'white', fontFamily: 'Inter_600SemiBold', fontSize: 16 }}>{notice ? 'Got it' : 'Close'}</Text></Pressable>
        </ScrollView>
      </View>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'white' }, bold: { fontFamily: 'Inter_700Bold', color: ink }, muted: { fontFamily: 'Inter_400Regular', color: muted },
  target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  profileButton: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 7 },
  buttonText: { fontFamily: 'Inter_600SemiBold', color: blue, textAlign: 'center' },
  empty: { padding: 32, alignItems: 'center', justifyContent: 'center', minHeight: 180 },
  backdrop: { flex: 1, backgroundColor: '#030b2c55', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalScroll: { backgroundColor: 'white', borderRadius: 24, width: '100%', maxWidth: 420, flexGrow: 0 },
  modalBody: { padding: 24, gap: 16 }, modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, color: ink },
  modalText: { fontFamily: 'Inter_400Regular', fontSize: 16, lineHeight: 24, color: muted },
  close: { backgroundColor: blue, borderRadius: 25, minHeight: 48, alignItems: 'center', justifyContent: 'center', padding: 12 }, link: { fontFamily: 'Inter_600SemiBold', color: blue },
});
