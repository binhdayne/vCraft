// Workshop stories remain in the existing `story` field. Headings organize a
// book; all prose is rendered as text, never injected as HTML.
export function parseWorkshopStory(value = '', workshopName = '') {
  const source = String(value || '').replace(/\r\n?/g, '\n').trim();
  const result = { title: 'Chuyện kể từ ' + (workshopName || 'xưởng'), introduction: [], note: '', fictional: false, chapters: [] };
  if (!source) return result;
  let chapter = null, paragraph = [];
  const flush = () => {
    const text = paragraph.join('\n').trim(); paragraph = [];
    if (!text) return;
    if (chapter) chapter.paragraphs.push(text); else result.introduction.push(text);
  };
  for (const line of source.split('\n')) {
    const title = line.match(/^#\s+(.+)$/), heading = line.match(/^##\s+(.+)$/);
    if (title && !chapter) { flush(); result.title = title[1].trim(); }
    else if (heading) {
      flush();
      const parts = heading[1].split(/\s+·\s+/);
      chapter = { title: parts.length > 1 ? parts.slice(1).join(' · ') : parts[0], period: parts.length > 1 ? parts[0] : '', paragraphs: [] };
      result.chapters.push(chapter);
    } else if (!line.trim()) flush(); else paragraph.push(line);
  }
  flush();
  result.introduction = result.introduction.filter(text => {
    if (!text.startsWith('Truyện hư cấu minh họa cho vCraft.')) return true;
    result.fictional = true; result.note = text; return false;
  });
  if (!result.chapters.length) {
    result.chapters = [{ title: 'Lời kể của xưởng', period: '', paragraphs: result.introduction }];
    result.introduction = [];
  }
  return result;
}

function splitParagraph(text, limit) {
  const parts = []; let rest = text;
  while (rest.length > limit) {
    let end = rest.lastIndexOf(' ', limit);
    if (end < limit * .4) end = limit;
    parts.push(rest.slice(0, end).trim()); rest = rest.slice(end).trimStart();
  }
  if (rest) parts.push(rest);
  return parts;
}

export function buildStoryPages(book, limit = 720) {
  const pages = [{ type: 'cover', title: book.title }, { type: 'contents', title: 'Những trang chuyện' }];
  const chapters = [];
  book.chapters.forEach((chapter, chapterIndex) => {
    const chunks = []; let paragraphs = [], length = 0;
    for (const text of chapter.paragraphs) for (const part of splitParagraph(text, limit)) {
      if (paragraphs.length && length + part.length + 2 > limit) { chunks.push(paragraphs); paragraphs = []; length = 0; }
      paragraphs.push(part); length += part.length + 2;
    }
    if (paragraphs.length || !chunks.length) chunks.push(paragraphs);
    chapters.push({ ...chapter, index: chapterIndex, page: pages.length });
    chunks.forEach((paragraphs, part) => pages.push({ ...chapter, type: 'chapter', chapterIndex, part, parts: chunks.length, paragraphs }));
  });
  pages.push({ type: 'end', title: 'Câu chuyện còn được viết tiếp.' });
  return { pages, chapters };
}

// Compact previews elsewhere in the app must not print book headings or a full
// multi-chapter history. Ordinary workshop text keeps its existing rendering.
export function getWorkshopStoryExcerpt(value = '', maxLength = Infinity) {
  const source = String(value || '').trim();
  const book = parseWorkshopStory(source);
  const text = /^#{1,2}\s+/m.test(source)
    ? book.introduction.join(' ') || book.chapters[0]?.paragraphs[0] || ''
    : source;
  if (text.length <= maxLength) return text;
  const short = text.slice(0, maxLength).trimEnd();
  const end = short.lastIndexOf(' ');
  return (end > maxLength * .7 ? short.slice(0, end) : short) + '…';
}
