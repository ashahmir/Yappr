import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SampleMedia, samplePhotos, sampleVideos } from '../data/create-media';
import { PostAuthor, publishingError } from '../lib/local-publishing';
import { DemoArtwork } from './demo-artwork';
import { usePostState } from './post-state';
import { UiIcon } from './ui-icon';

type Stage = 'gallery' | 'caption' | 'publishing' | 'published';
const blue = '#0065ff', ink = '#080a45', muted = '#6b72a5';
function Check({ size = 20 }: { size?: number }) {
  return <View style={{ width: size * 0.45, height: size * 0.75, borderRightWidth: size * 0.13, borderBottomWidth: size * 0.13, borderColor: 'white', transform: [{ rotate: '40deg' }], marginTop: -size * 0.2 }} />;
}
function Close({ color = ink }: { color?: string }) {
  return <View style={{ width: 23, height: 23 }}><View style={[styles.cross, { backgroundColor: color, transform: [{ rotate: '45deg' }] }]} /><View style={[styles.cross, { backgroundColor: color, transform: [{ rotate: '-45deg' }] }]} /></View>;
}
function ProgressRing({ value, size }: { value: number; size: number }) {
  const circumference = 2 * Math.PI * 70;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><circle cx="80" cy="80" r="70" fill="none" stroke="#e4eeff" stroke-width="14"/><circle cx="80" cy="80" r="70" fill="none" stroke="#0065ff" stroke-width="14" stroke-linecap="round" stroke-dasharray="${circumference}" stroke-dashoffset="${circumference * (1 - value / 100)}" transform="rotate(-90 80 80)"/></svg>`;
  return <View accessibilityRole="progressbar" accessibilityLabel="Publishing progress" accessibilityValue={{ min: 0, max: 100, now: value }} style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}><Image source={{ uri: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }} style={StyleSheet.absoluteFill} accessible={false} /><Text style={[styles.bold, { fontSize: size * 0.22 }]}>{value}%</Text></View>;
}

function ActionButton({ label, onPress, scale, secondary = false, disabled = false }: { label: string; onPress: () => void; scale: number; secondary?: boolean; disabled?: boolean }) {
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.button, { backgroundColor: secondary ? '#ebf2ff' : blue, opacity: disabled ? 0.4 : pressed ? 0.8 : 1, minHeight: Math.max(48, 97 * scale) }]}><Text style={[styles.bold, { color: secondary ? blue : 'white', fontSize: 39 * scale, textAlign: 'center' }]}>{label}</Text></Pressable>;
}

export default function CreatePostScreen({ author }: { author: PostAuthor }) {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 540), scale = canvas / 941;
  const pad = 38 * scale, tileWidth = (canvas - 100 * scale - 30 * scale) / 3;
  const [stage, setStage] = useState<Stage>('gallery');
  const [kind, setKind] = useState<'Photos' | 'Videos'>('Photos');
  const [selected, setSelected] = useState<SampleMedia | null>(null);
  const [caption, setCaption] = useState('');
  const [progress, setProgress] = useState(0);
  const [postId, setPostId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cancel, setCancel] = useState(false);
  const transaction = useRef('');
  const progressRef = useRef(0);
  const busy = useRef(false);
  const state = usePostState();
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const leave = useCallback(() => router.canGoBack() ? router.back() : router.replace('/explore'), []);
  const back = useCallback(() => {
    if (stage === 'publishing') setCancel(true);
    else if (stage === 'caption') setStage('gallery');
    else leave();
  }, [stage, leave]);
  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { back(); return true; });
    return () => listener.remove();
  }, [back]));

  // Progress is a demo animation. Leaving this tab pauses it; unmounting cancels it.
  useFocusEffect(useCallback(() => {
    if (stage !== 'publishing' || !selected || cancel) return;
    const timer = setInterval(() => {
      progressRef.current = Math.min(100, progressRef.current + 4);
      setProgress(progressRef.current);
      if (progressRef.current === 100) {
        clearInterval(timer);
        try {
          const id = stateRef.current.publish(transaction.current, selected, caption, author);
          setPostId(id);
          setStage('published');
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : 'Could not publish. Please try again.');
          setStage('caption');
        }
        busy.current = false;
      }
    }, 100);
    return () => clearInterval(timer);
  }, [stage, selected, caption, author, cancel]));

  const share = () => {
    if (!selected || busy.current) return;
    const problem = publishingError(selected, caption, state.published, author.id, Date.now());
    if (problem) { setError(problem); return; }
    busy.current = true;
    transaction.current = `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    progressRef.current = 0;
    setProgress(0); setError(null); setStage('publishing');
  };
  const reset = () => { setSelected(null); setCaption(''); setError(null); setPostId(''); setStage('gallery'); };
  const picture = (media: SampleMedia, w: number, h: number) => <DemoArtwork source={media.source} region={media.region} width={w} height={h} label={media.label} />;



  return <KeyboardAvoidingView testID={`create-${stage}`} behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.root, { paddingTop: Math.max(insets.top, 12), paddingLeft: insets.left, paddingRight: insets.right }]}>
    <View style={{ flex: 1, width: canvas, alignSelf: 'center' }}>
      {stage !== 'published' && <View style={[styles.header, { minHeight: 108 * scale, marginHorizontal: pad }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Back from create post" onPress={back} style={styles.target}><UiIcon name="back" size={48 * scale} color={ink} /></Pressable>
        {stage !== 'publishing' && <Text accessibilityRole="header" style={[styles.bold, { fontSize: 48 * scale, textAlign: 'center', flex: 1 }]}>Create Post</Text>}
        <View style={{ width: 44 }} />
      </View>}

      {stage === 'gallery' && <>
        <View accessibilityRole="tablist" style={[styles.segment, { marginHorizontal: 50 * scale, marginBottom: 20 * scale }]}>{(['Photos', 'Videos'] as const).map(label => <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: kind === label }} onPress={() => { setKind(label); setSelected(null); }} style={[styles.segmentItem, { backgroundColor: kind === label ? blue : 'transparent' }]}><Text style={[styles.medium, { fontSize: 36 * scale, color: kind === label ? 'white' : ink }]}>{label}</Text></Pressable>)}</View>
        <FlatList testID="create-gallery" data={kind === 'Photos' ? samplePhotos : sampleVideos} numColumns={3} keyExtractor={item => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 50 * scale, paddingBottom: 12 }} columnWrapperStyle={{ gap: 15 * scale }} renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityLabel={`Select ${item.label}`} accessibilityState={{ selected: selected?.id === item.id }} onPress={() => setSelected(selected?.id === item.id ? null : item)} style={{ width: tileWidth, height: tileWidth * 0.84, borderRadius: 18 * scale, marginBottom: 15 * scale, borderWidth: selected?.id === item.id ? 3 : 0, borderColor: blue, padding: selected?.id === item.id ? 2 : 0 }}>
          <View style={{ flex: 1, borderRadius: 13 * scale, overflow: 'hidden' }}>{picture(item, tileWidth, tileWidth * 0.84)}</View>
          {selected?.id === item.id && <View style={[styles.selectionCheck, { width: 27, height: 27 }]}><Check size={17} /></View>}
          {item.video && <View style={styles.duration}><UiIcon name="play" size={13} color="white" /><Text style={{ color: 'white', fontSize: 11 }}>0:{item.duration}</Text></View>}
        </Pressable>} />
        <View style={{ paddingHorizontal: pad, paddingTop: 4, paddingBottom: 8, gap: 10 * scale }}>
          {selected ? <View style={[styles.selected, { minHeight: 126 * scale }]}><View style={{ borderRadius: 10, overflow: 'hidden' }}>{picture(selected, 104 * scale, 104 * scale)}</View><Text style={[styles.medium, { flex: 1, fontSize: 30 * scale }]}>1 {selected.video ? 'video' : 'photo'} selected</Text><Pressable accessibilityRole="button" accessibilityLabel="Clear selected media" onPress={() => setSelected(null)} style={styles.target}><Close /></Pressable></View> : <Text style={[styles.body, { fontSize: 13, textAlign: 'center', padding: 8 }]}>Choose a {kind === 'Photos' ? 'photo' : 'video'} from the sample gallery</Text>}
          <ActionButton scale={scale} label="Next" onPress={() => setStage('caption')} disabled={!selected} />
        </View>
      </>}

      {stage === 'caption' && selected && <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: pad, paddingBottom: 12, gap: 18 * scale }}>
        <View style={{ borderRadius: 26 * scale, overflow: 'hidden' }}>
          {picture(selected, canvas - 2 * pad, (canvas - 2 * pad) * 0.7)}
          <Pressable accessibilityRole="button" accessibilityLabel="Remove selected media" onPress={() => { setSelected(null); setStage('gallery'); }} style={[styles.remove, { right: 20 * scale, top: 20 * scale }]}><Close color="white" /></Pressable>
        </View>
        <View style={[styles.metadata, { padding: 17 * scale }]}><View style={styles.iconBox}><Image source={selected.video ? require('../../assets/images/create/video.svg') : require('../../assets/images/create/photo.svg')} style={{ width: 26, height: 26 }} accessible={false} /></View><View style={{ flex: 1 }}><Text style={[styles.bold, { fontSize: 36 * scale }]}>{selected.video ? 'Video' : 'Photo'}</Text><Text style={[styles.body, { fontSize: 29 * scale, marginTop: 3 }]}>{(selected.bytes / 1000000).toFixed(1)} MB · {selected.width} × {selected.height}{selected.video ? ` · ${selected.duration}s` : ''}</Text></View></View>
        <View style={styles.captionBox}><TextInput testID="post-caption" accessibilityLabel="Post caption" placeholder={"Write a caption (optional)...\nShare what?s on your mind."} placeholderTextColor={muted} multiline maxLength={150} value={caption} onChangeText={setCaption} textAlignVertical="top" style={[styles.body, { color: ink, minHeight: 60 * Math.max(1, fontScale), fontSize: 35 * scale, lineHeight: 53 * scale, padding: 0 }]} /></View>
        <Text testID="caption-count" style={[styles.body, { fontSize: 30 * scale, textAlign: 'right' }]}>{caption.length} / 150</Text>
        <View style={styles.rule}><View style={styles.smallIcon}><Image source={require('../../assets/images/create/video.svg')} style={{ width: 22, height: 22 }} accessible={false} /></View><Text style={[styles.body, { flex: 1, fontSize: 29 * scale }]}>Videos up to 60 seconds and 10 MB</Text></View>
        <View style={styles.rule}><View style={styles.smallIcon}><Image source={require('../../assets/images/create/calendar.svg')} style={{ width: 22, height: 22 }} accessible={false} /></View><Text style={[styles.body, { flex: 1, fontSize: 29 * scale }]}>Up to five successful posts per day</Text></View>
        {error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <ActionButton scale={scale} label="Share Post" onPress={share} />
      </ScrollView>}

      {stage === 'publishing' && selected && <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingHorizontal: pad, paddingBottom: 20 }}>
        <Text accessibilityRole="header" style={[styles.bold, { fontSize: 49 * scale, textAlign: 'center', marginTop: 14 * scale, marginBottom: 82 * scale }]}>Publishing your post</Text>
        <View style={{ borderRadius: 36 * scale, overflow: 'hidden', marginBottom: 48 * scale }}>{picture(selected, 425 * scale, 414 * scale)}</View>
        <ProgressRing value={progress} size={365 * scale} />
        <Text style={[styles.bold, { fontSize: 53 * scale, marginTop: 26 * scale }]}>Uploading...</Text>
        <Text style={[styles.body, { fontSize: 37 * scale, textAlign: 'center', lineHeight: 54 * scale * fontScale, marginTop: 23 * scale }]}>This may take a few seconds.{ '\n' }Keep the app open.</Text>
      </ScrollView>}

      {stage === 'published' && selected && <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: pad, paddingBottom: 16, alignItems: 'center' }}>
        <View style={{ width: canvas - 2 * pad, height: 780 * scale, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 38 * scale }}>
          {Array.from({ length: 13 }, (_, i) => { const a = (i * 28 - 165) * Math.PI / 180; return <View key={i} style={{ position: 'absolute', left: (canvas - 2 * pad) / 2 + Math.cos(a) * 345 * scale - 10 * scale, top: 450 * scale + Math.sin(a) * 310 * scale, width: 28 * scale, height: (i % 3 ? 80 : 42) * scale, borderRadius: 20, backgroundColor: i % 3 ? blue : '#cbdfff', transform: [{ rotate: `${i * 28 - 75}deg` }] }} />; })}
          <View style={{ borderRadius: 34 * scale, overflow: 'hidden' }}>{picture(selected, 447 * scale, 442 * scale)}</View>
          <View style={{ position: 'absolute', bottom: 0, right: 192 * scale, backgroundColor: '#00d4ae', width: 148 * scale, height: 148 * scale, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}><Check size={74 * scale} /></View>
        </View>
        <Text accessibilityRole="header" style={[styles.bold, { fontSize: 69 * scale, textAlign: 'center', marginTop: 45 * scale }]}>Post published!</Text>
        <Text style={[styles.body, { fontSize: 46 * scale, textAlign: 'center', lineHeight: 62 * scale * fontScale, marginTop: 23 * scale, marginBottom: 72 * scale }]}>Your moment is now live with{ '\n' }your people.</Text>
        <View style={{ width: '100%', gap: 20 * scale, marginTop: 'auto' }}><ActionButton scale={scale} label="View Post" onPress={() => router.push({ pathname: '/post/[id]', params: { id: postId } })} /><ActionButton scale={scale} label="Create Another" onPress={reset} secondary /></View>
      </ScrollView>}
    </View>
    <Modal visible={cancel} transparent animationType="fade" onRequestClose={() => setCancel(false)}><View style={styles.backdrop}><View style={styles.dialog}><Text style={[styles.bold, { fontSize: 22 }]}>Cancel publishing?</Text><Text style={[styles.body, { fontSize: 16 }]}>Your selection and caption will stay here so you can try again.</Text><ActionButton scale={scale} label="Keep publishing" onPress={() => setCancel(false)} /><ActionButton scale={scale} label="Cancel publishing" onPress={() => { busy.current = false; setCancel(false); setStage('caption'); }} secondary /></View></View></Modal>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' }, bold: { fontFamily: 'Inter_700Bold', color: ink }, medium: { fontFamily: 'Inter_600SemiBold', color: ink }, body: { fontFamily: 'Inter_400Regular', color: muted },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 }, target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cross: { position: 'absolute', top: 10, width: 24, height: 2.5, borderRadius: 2 },
  segment: { backgroundColor: '#ecf3ff', borderRadius: 100, flexDirection: 'row' }, segmentItem: { flex: 1, minHeight: 44, paddingVertical: 10, borderRadius: 100, alignItems: 'center', justifyContent: 'center' },
  selected: { borderWidth: 1, borderColor: '#ebf0fa', backgroundColor: '#fafcff', borderRadius: 20, padding: 8, gap: 12, flexDirection: 'row', alignItems: 'center' },
  selectionCheck: { position: 'absolute', right: 6, top: 6, backgroundColor: blue, borderWidth: 2, borderColor: 'white', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  duration: { position: 'absolute', bottom: 5, right: 5, backgroundColor: '#071329bb', borderRadius: 6, padding: 4, flexDirection: 'row', gap: 4 },
  button: { borderRadius: 100, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  remove: { position: 'absolute', width: 44, height: 44, backgroundColor: '#051420df', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  metadata: { borderWidth: 1, borderColor: '#e1ebfc', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#edf3fc', alignItems: 'center', justifyContent: 'center' },
  captionBox: { borderWidth: 1, borderColor: '#e1ebfc', borderRadius: 14, padding: 17 },
  rule: { flexDirection: 'row', alignItems: 'center', gap: 12 }, smallIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#edf3fc', alignItems: 'center', justifyContent: 'center' },
  error: { color: '#c42a43', fontFamily: 'Inter_400Regular', fontSize: 14 },
  backdrop: { flex: 1, backgroundColor: '#030b2c55', justifyContent: 'center', alignItems: 'center', padding: 24 }, dialog: { width: '100%', maxWidth: 400, backgroundColor: 'white', borderRadius: 24, padding: 24, gap: 16 },
});
