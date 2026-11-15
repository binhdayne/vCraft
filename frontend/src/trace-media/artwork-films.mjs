const films = [
  {
    key: 'dam-cuoi-chuot',
    title: 'Đám cưới chuột',
    names: ['dam cuoi chuot'],
    src: '/films/dam-cuoi-chuot.mp4',
    type: 'video/mp4',
    poster: '/films/dam-cuoi-chuot-poster.svg',
    duration: '00:12',
  },
];

// Frontend presentation mapping only. It does not alter artworks or batch creation.
// Add another local film here to associate it with a different artwork.
export function findArtworkFilm(product = {}) {
  const name = (product.name || '').normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[đĐ]/g, 'd').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return films.find(film => film.names.some(title => ` ${name} `.includes(` ${title} `))) || null;
}
