import { roosterScene } from './rooster-scene.mjs';
import { pigsScene } from './pigs-scene.mjs';
import { gloryScene, prosperityScene } from './blessings-scene.mjs';
import { scholarScene } from './scholar-scene.mjs';
import { fluteScene, kiteScene } from './pastoral-scenes.mjs';
import { kindnessScene, wisdomScene } from './virtues-scenes.mjs';
import { carpScene } from './carp-scene.mjs';
import { peacockScene } from './peacock-scene.mjs';

export const artworkScenes = [
  { key: 'ga-dai-cat', title: 'Gà đại cát', render: roosterScene },
  { key: 'lon-am-duong', title: 'Đàn lợn âm dương', render: pigsScene },
  { key: 'vinh-hoa', title: 'Vinh hoa · Em bé ôm gà', render: gloryScene },
  { key: 'phu-quy', title: 'Phú quý · Em bé ôm vịt', render: prosperityScene },
  { key: 'muc-dong-doc-sach', title: 'Mục đồng đọc sách', render: scholarScene },
  { key: 'chan-trau-thoi-sao', title: 'Chăn trâu thổi sáo', render: fluteScene },
  { key: 'chan-trau-tha-dieu', title: 'Chăn trâu thả diều', render: kiteScene },
  { key: 'nhan-nghia', title: 'Nhân nghĩa · Em bé ôm cóc', render: kindnessScene },
  { key: 'le-tri', title: 'Lễ trí · Em bé ôm rùa', render: wisdomScene },
  { key: 'ly-ngu-vong-nguyet', title: 'Lý ngư vọng nguyệt', render: carpScene },
  { key: 'chim-cong-thai-binh', title: 'Chim công thiên hạ thái bình', render: peacockScene },
];
