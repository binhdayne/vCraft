import { roosterScene } from './rooster-scene.mjs';
import { pigsScene } from './pigs-scene.mjs';
import { gloryScene, prosperityScene } from './blessings-scene.mjs';
import { scholarScene } from './scholar-scene.mjs';

export const artworkScenes = [
  { key: 'ga-dai-cat', title: 'Gà đại cát', render: roosterScene },
  { key: 'lon-am-duong', title: 'Đàn lợn âm dương', render: pigsScene },
  { key: 'vinh-hoa', title: 'Vinh hoa · Em bé ôm gà', render: gloryScene },
  { key: 'phu-quy', title: 'Phú quý · Em bé ôm vịt', render: prosperityScene },
  { key: 'muc-dong-doc-sach', title: 'Mục đồng đọc sách', render: scholarScene },
];
