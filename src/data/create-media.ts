export type SampleMedia = { id: string; label: string; source: number; region: readonly number[]; video: boolean; bytes: number; width: number; height: number; duration?: number };
const gallery = require('../../assets/images/create/gallery.png');
const preview = require('../../assets/images/create/preview.png');
const labels = ['Alpine lake', 'Together outdoors', 'Sunrise hike', 'Sunset coast', 'City walk', 'Mountain friends', 'Lakeside village', 'Adventure buddy', 'Morning coffee', 'The scenic route', 'By the lake', 'At the summit'];
const columns = [[51, 273], [341, 263], [621, 270]];
const rows = [[312, 230], [559, 209], [785, 224], [1025, 215]];
export const samplePhotos: SampleMedia[] = labels.map((label, index) => {
  const [x, w] = columns[index % 3], [y, h] = rows[Math.floor(index / 3)];
  return { id: `sample-${index}`, label, source: index === 7 ? preview : gallery, region: index === 7 ? [40, 310, 860, 500] : [x, y, w, h], video: false, bytes: 2400000, width: 3024, height: 4032 };
});
export const sampleVideos: SampleMedia[] = [0, 3, 9, 11].map((index, i) => ({ ...samplePhotos[index], id: `video-${i}`, video: true, bytes: 6200000 + i * 500000, width: 1920, height: 1080, duration: 18 + i * 9 }));
