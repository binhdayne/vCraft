export const artworkFilms = [
  {
    key: 'dam-cuoi-chuot',
    title: 'Đám cưới chuột',
    names: ['dam cuoi chuot'],
    src: '/films/dam-cuoi-chuot.mp4',
    type: 'video/mp4',
    poster: '/films/dam-cuoi-chuot-poster.svg',
    duration: '00:12',
  },
  {
    key: 'ga-dai-cat',
    title: 'Gà đại cát',
    names: ['ga dai cat', 'dai cat', 'dai cat nghinh xuan'],
    src: '/films/ga-dai-cat.mp4',
    type: 'video/mp4',
    poster: '/films/ga-dai-cat-poster.svg',
    duration: '00:12',
  },
  {
    key: 'lon-am-duong',
    title: 'Đàn lợn âm dương',
    names: ['dan lon am duong', 'lon am duong'],
    src: '/films/lon-am-duong.mp4',
    type: 'video/mp4',
    poster: '/films/lon-am-duong-poster.svg',
    duration: '00:12',
  },
  {
    key: 'vinh-hoa',
    title: 'Vinh hoa · Em bé ôm gà',
    names: ['vinh hoa em be om ga', 'vinh hoa'],
    src: '/films/vinh-hoa.mp4',
    type: 'video/mp4',
    poster: '/films/vinh-hoa-poster.svg',
    duration: '00:12',
  },
  {
    key: 'phu-quy',
    title: 'Phú quý · Em bé ôm vịt',
    names: ['phu quy em be om vit', 'phu quy'],
    src: '/films/phu-quy.mp4',
    type: 'video/mp4',
    poster: '/films/phu-quy-poster.svg',
    duration: '00:12',
  },
  {
    key: 'muc-dong-doc-sach',
    title: 'Mục đồng đọc sách',
    names: ['hieu hoc chan trau doc sach', 'chan trau doc sach', 'muc dong doc sach', 'muc dong'],
    src: '/films/muc-dong-doc-sach.mp4',
    type: 'video/mp4',
    poster: '/films/muc-dong-doc-sach-poster.svg',
    duration: '00:12',
  },
];

// Frontend presentation mapping only. It does not alter artworks or batch creation.
// Add another local film here to associate it with a different artwork.
export function findArtworkFilm(product = {}) {
  const name = (product.name || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[đĐ]/g, 'd').replace(/[×✕]/g, 'x').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  // Full subjects can have size suffixes. Short legacy names only match on their
  // own: "Mục đồng thổi sáo" must not receive the reading scene, for example.
  const legacy = new Set(['dai cat', 'vinh hoa', 'phu quy', 'muc dong']);
  const legacyName = name.replace(/(?: kho)? \d+(?: ?x ?\d+)?(?: ?cm)?$/, '').trim();
  return artworkFilms.find(film => film.names.some(title => legacy.has(title)
    ? legacyName === title : ` ${name} `.includes(` ${title} `))) || null;
}
