import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categories, Category, compactCount, exploreArtwork, explorePosts } from '../data/explore-posts';
import { DemoArtwork } from './demo-artwork';
import { usePostState } from './post-state';
import { UiIcon } from './ui-icon';

export default function ExploreScreen() {
  const { width, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const canvas = Math.min(width - insets.left - insets.right, 540), s = canvas / 941;
  const [query, setQuery] = useState('');
  const [gridHeight, setGridHeight] = useState(0);
  const [category, setCategory] = useState<Category>('For you');
  const [filterOpen, setFilterOpen] = useState(false);
  const [media, setMedia] = useState('All posts');
  const { liked } = usePostState();
  const posts = explorePosts.filter(p => (category === 'For you' || p.category === category) && (media === 'All posts' || p.video === (media === 'Videos')) && `${p.name} ${p.handle} ${p.location} ${p.caption} ${p.category}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
    <View style={{ flex: 1, width: canvas, alignSelf: 'center' }}>
      <View style={{ height: 162 * s, marginHorizontal: 34 * s, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <DemoArtwork source={exploreArtwork} region={[32, 91, 402, 111]} width={402 * s} height={111 * s} label="Yappr" />
        <Pressable accessibilityRole="button" accessibilityLabel="Filter posts" onPress={() => setFilterOpen(true)} style={{ backgroundColor: '#f3f5fa', width: Math.max(44, 100 * s), height: Math.max(44, 100 * s), borderRadius: 60, alignItems: 'center', justifyContent: 'center' }}><UiIcon name="filter" size={52 * s} color="#005cff" /></Pressable>
      </View>
      <View style={{ marginHorizontal: 34 * s, marginTop: 4 * s, minHeight: 90 * s, backgroundColor: '#f2f4fa', borderRadius: 100, paddingHorizontal: 37 * s, flexDirection: 'row', gap: 30 * s, alignItems: 'center' }}>
        <UiIcon name="search" size={43 * s} color="#585c83" />
        <TextInput accessibilityLabel="Search people, places or topics" placeholder="Search people, places or topics..." placeholderTextColor="#585c83" value={query} onChangeText={setQuery} returnKeyType="search" autoCorrect={false} style={{ flex: 1, minHeight: 90 * s, fontFamily: 'Inter_400Regular', fontSize: 31 * s, color: '#080a35', paddingVertical: 0, paddingHorizontal: 0, letterSpacing: -0.6 }} />
        {query ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => setQuery('')} hitSlop={12}><Text style={{ fontSize: 23, color: '#585c83' }}>×</Text></Pressable> : null}
      </View>
      <View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 31 * s, gap: 11 * s, paddingTop: 23 * s, paddingBottom: 24 * s }}>
        {categories.map((c, i) => <Pressable key={c} hitSlop={{ top: 5, bottom: 5 }} accessibilityRole="button" accessibilityState={{ selected: category === c }} onPress={() => setCategory(c)} style={{ height: 83 * s * Math.max(1, fontScale), width: [207, 164, 170, 153, 145][i] * s * Math.max(1, fontScale), borderRadius: 100, borderWidth: category === c ? 0 : 1, borderColor: '#e1e6fc', backgroundColor: category === c ? '#005cff' : '#fff', alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontFamily: category === c ? 'Inter_600SemiBold' : 'Inter_400Regular', fontSize: (i ? 28 : 32) * s, color: category === c ? '#fff' : '#080a35', letterSpacing: -0.5 }}>{c}</Text></Pressable>)}
      </ScrollView></View>
      <FlatList onLayout={event => setGridHeight(event.nativeEvent.layout.height)} testID="explore-grid" data={posts} numColumns={2} extraData={liked} keyExtractor={p => p.id} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 30 * s, paddingBottom: 16 * s }} columnWrapperStyle={{ gap: 16 * s }} ListEmptyComponent={<View style={{ padding: 32, gap: 12 }}><Text style={styles.emptyTitle}>No posts found</Text><Text style={styles.muted}>Try another person, place or topic.</Text><Pressable accessibilityRole="button" onPress={() => { setQuery(''); setCategory('For you'); setMedia('All posts'); }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: '#005cff' }}>Reset filters</Text></Pressable></View>} renderItem={({ item, index }) => {
        const tileWidth = (canvas - 76 * s) / 2;
        const fit = gridHeight && posts.length === 6 && fontScale <= 1.1 ? Math.max(0.78, Math.min(1, (gridHeight - 55 * s) / (1023 * s))) : 1;
        const tileHeight = (index < 2 ? 372 : index < 4 ? 335 : 316) * s * fit;
        return <Pressable testID={`post-${item.id}`} accessibilityRole="button" accessibilityLabel={`Open ${item.name}'s ${item.video ? 'video' : 'photo'}: ${item.caption}`} onPress={() => router.push({ pathname: '/post/[id]', params: { id: item.id } })} style={({ pressed }) => ({ width: tileWidth, height: tileHeight, borderRadius: 20 * s, overflow: 'hidden', marginBottom: 13 * s, opacity: pressed ? 0.8 : 1, backgroundColor: '#eef1f8' })}>
          <DemoArtwork source={item.source} region={item.region} width={tileWidth} height={tileHeight} />
          {item.video && <View style={{ position: 'absolute', right: 12 * s, top: 12 * s, width: 57 * s, height: 57 * s, borderRadius: 40, backgroundColor: '#071329b3', alignItems: 'center', justifyContent: 'center' }}><UiIcon name="play" size={28 * s} color="white" filled /></View>}
          <View style={{ position: 'absolute', bottom: 14 * s, left: 24 * s, flexDirection: 'row', alignItems: 'center', gap: 12 * s }}><UiIcon name="heart" size={37 * s} color={liked[item.id] ? '#ff2548' : '#fff'} filled /><Text style={{ color: 'white', fontFamily: 'Inter_600SemiBold', fontSize: 33 * s, textShadowColor: '#0008', textShadowRadius: 5 }}>{compactCount(item.likes + (item.id === 'jamie-santorini' ? (liked[item.id] ? 0 : -1) : (liked[item.id] ? 1 : 0)))}</Text></View>
        </Pressable>;
      }} />
    </View>
    <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}><View style={styles.backdrop}><View style={styles.dialog}><Text style={styles.emptyTitle}>Show in Explore</Text>{['All posts', 'Photos', 'Videos'].map(option => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ checked: media === option }} onPress={() => { setMedia(option); setFilterOpen(false); }} style={{ paddingVertical: 16 }}><Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 17, color: media === option ? '#005cff' : '#080a35' }}>{option}{media === option ? '  ✓' : ''}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={() => setFilterOpen(false)} style={{ paddingVertical: 14 }}><Text style={styles.muted}>Cancel</Text></Pressable></View></View></Modal>
  </View>;
}
const styles = StyleSheet.create({ emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 23, color: '#080a35' }, muted: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#595e90' }, backdrop: { flex: 1, backgroundColor: '#030b2c55', alignItems: 'center', justifyContent: 'center', padding: 24 }, dialog: { backgroundColor: '#fff', borderRadius: 24, padding: 26, width: '100%', maxWidth: 380 } });
