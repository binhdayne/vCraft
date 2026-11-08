export function createWorkshopPhotoGallery(studio) {
  const photos = [...new Set((studio.ownerPhotos || [])
    .filter(url => typeof url === 'string' && /^\/uploads\/[a-zA-Z0-9_.-]+$/.test(url)))].slice(0, 8);
  const gallery = document.createElement('section');
  gallery.className = 'map-popup-gallery';
  gallery.setAttribute('aria-label', `Ảnh xưởng ${studio.name}`);
  if (!photos.length) {
    const empty = document.createElement('p');
    empty.className = 'map-popup-empty';
    empty.textContent = 'Chủ xưởng chưa đăng ảnh chụp xưởng.';
    gallery.append(empty);
    return gallery;
  }

  let index = 0;
  const frame = document.createElement('div');
  frame.className = 'map-photo-frame';
  const original = document.createElement('a');
  original.className = 'map-photo-original';
  original.target = '_blank';
  original.rel = 'noopener noreferrer';
  original.title = 'Bấm để xem ảnh lớn';
  const image = document.createElement('img');
  image.className = 'map-popup-photo';
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 260;
  image.height = 140;
  original.append(image);
  const error = document.createElement('div');
  error.className = 'map-photo-error';
  error.style.display = 'none';
  const errorText = document.createElement('span');
  errorText.textContent = 'Chưa tải được ảnh này.';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'text-link';
  retry.textContent = 'Thử tải lại ảnh';
  error.append(errorText, retry);
  const count = document.createElement('span');
  count.className = 'map-photo-count';
  count.setAttribute('aria-live', 'polite');
  const showPhoto = () => {
    error.style.display = 'none';
    image.style.display = 'block';
    image.alt = `Ảnh xưởng ${studio.name}, ảnh ${index + 1} trên ${photos.length}`;
    original.href = photos[index];
    original.removeAttribute('aria-disabled');
    image.src = photos[index];
    count.textContent = `${index + 1} / ${photos.length}`;
  };
  image.onerror = () => {
    image.style.display = 'none';
    error.style.display = 'flex';
    original.removeAttribute('href');
    original.setAttribute('aria-disabled', 'true');
  };
  retry.onclick = showPhoto;
  frame.append(original, error, count);
  if (photos.length > 1) {
    for (const [delta, label, symbol, className] of [
      [-1, 'Ảnh xưởng trước', '‹', 'map-photo-previous'],
      [1, 'Ảnh xưởng tiếp theo', '›', 'map-photo-next'],
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'map-photo-control ' + className;
      button.setAttribute('aria-label', label);
      button.textContent = symbol;
      button.onclick = () => { index = (index + delta + photos.length) % photos.length; showPhoto(); };
      frame.append(button);
    }
  }
  const caption = document.createElement('p');
  caption.className = 'map-photo-caption';
  caption.textContent = 'Ảnh do chủ xưởng đăng · Bấm ảnh để xem lớn';
  gallery.append(frame, caption);
  showPhoto();
  return gallery;
}
