// Original vCraft illustrations. Coordinates are in a 1280 x 720 artboard.
// All movement repeats after twelve seconds, including secondary botanical motion.
export const C = {
  ink: '#332d23', paper: '#e8dfc8', cream: '#f6ead0', red: '#a44030',
  green: '#315b43', jade: '#6c8053', gold: '#caa04a', paleGold: '#e3c875',
  skin: '#e2b793', rose: '#bf7460', grey: '#8b8c7a', blue: '#45656a',
};
export const n = value => Math.round(value * 1000) / 1000;
export const wave = (time, cycles = 1, phase = 0) => Math.sin(time / 12 * Math.PI * 2 * cycles + phase);
export const stroke = `stroke="${C.ink}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"`;
export const line = (d, color = C.ink, width = 2, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
export const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
export const group = (transform, content, extra = '') => `<g transform="${transform}" ${extra}>${content}</g>`;
export const blink = (time, phase = 0) => n(1 - .94 * Math.max(0, wave(time, 3, phase)) ** 32);

export function eye(x, y, time, phase = 0, size = 5) {
  return group(`translate(${x} ${y}) scale(1 ${blink(time, phase)})`,
    `<path d="M-${size * 2} 0Q0-${size * 1.4} ${size * 2} 0Q0 ${size * 1.1}-${size * 2} 0Z" fill="${C.cream}" stroke="${C.ink}" stroke-width="1.5"/><circle r="${size * .65}" fill="${C.ink}"/><circle cx="1" cy="-1" r="1" fill="${C.cream}"/>`);
}

export function petalFlower(x, y, size = 1, color = C.cream, time = 0, phase = 0) {
  const petals = Array.from({ length: 12 }, (_, i) =>
    group(`rotate(${i * 30})`, `<path d="M0-8C-11-18-9-36 0-43C10-35 10-20 0-8Z" fill="${color}" stroke="${C.ink}" stroke-width="1.4"/>`)).join('');
  return group(`translate(${x} ${y}) rotate(${n(wave(time, 2, phase) * 3)}) scale(${size})`,
    petals + `<circle r="10" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.7"/>` +
    Array.from({ length: 7 }, (_, i) => `<circle cx="${n(Math.cos(i) * 5)}" cy="${n(Math.sin(i) * 5)}" r="1" fill="${C.ink}"/>`).join(''));
}

export function leaf(x, y, angle, size = 1, color = C.green) {
  return group(`translate(${x} ${y}) rotate(${angle}) scale(${size})`,
    path('M0 0C-32-9-38-46-13-73C-4-83 8-94 13-108C37-73 37-23 0 0Z', color, `stroke="${C.ink}" stroke-width="2"`) +
    line('M0-3Q9-48 13-95M5-27L-11-46M9-47L-10-69M12-62L24-78', C.cream, 1.2, 'opacity=".7"'));
}

export function cloud(x, y, size = 1, time = 0, phase = 0) {
  return group(`translate(${n(x + wave(time, 1, phase) * 13)} ${y}) scale(${size})`,
    line('M-85 8H-30C-63-4-46-31-27-23C-26-53 16-55 22-25C42-48 78-24 60 5H103M-65 21H82M-39 32H59', '#b49760', 1.2), 'opacity=".55"');
}

export function butterfly(time, x, y, color = C.red, phase = 0) {
  const flap = .23 + Math.abs(wave(time, 12, phase)) * .77;
  return group(`translate(${n(x + wave(time, 1, phase) * 32)} ${n(y + wave(time, 3, phase) * 13)}) rotate(${n(wave(time, 2, phase) * 13)})`,
    group(`scale(${n(flap)} 1)`, path('M0 0C-33-37-40 7-8 7C-31 10-19 37 0 13C19 38 31 10 8 7C40 8 33-38 0 0Z', color, `stroke="${C.ink}" stroke-width="1.6"`) +
      line('M-6 1L-18-9M6 1L18-9M-6 12L-12 19M6 12L12 19', C.cream, 1.6)) +
    line('M0 0V16M-1 1L-7-9M1 1L7-9', C.ink, 2));
}

export function grasses(time, x, y, size = 1, phase = 0) {
  const sway = wave(time, 2, phase) * 4;
  return group(`translate(${x} ${y}) rotate(${n(sway)}) scale(${size})`,
    path('M0 0C-17-9-28-25-33-45C-13-29-6-16 0 0M-1 0C0-32 7-52 22-66C15-35 6-16-1 0M1 0C22-18 36-27 54-28C36-9 19-2 1 0M0 0C-5-27-3-45 4-59C12-31 7-14 0 0', C.green, `stroke="${C.ink}" stroke-width="1.3"`));
}

export function lotus(time, x, y, size = 1, phase = 0) {
  const sway = n(wave(time, 2, phase) * 2.5);
  return group(`translate(${x} ${y}) rotate(${sway}) scale(${size})`,
    line('M0 0Q-15-93 6-170', C.green, 4) +
    group('translate(5 -164)',
      path('M0 0Q-49-3-67-47Q-31-47 0-12Q-26-53-3-85Q24-55 10-14Q39-49 65-43Q49-2 7 4Z', '#cf8a74', `stroke="${C.ink}" stroke-width="2"`) +
      path('M2 1Q-34-28-29-58Q-5-47 2-16Q8-51 30-61Q37-25 2 1Z', '#edd3b1', `stroke="${C.ink}" stroke-width="1.8"`) +
      line('M-8-9L-18-33M11-12L21-39', C.red, 1)) +
    group('translate(-3 -55) rotate(-62)', path('M0 0C-41-46-62-67-35-96C-17-109-8-95 0-103C26-117 50-95 38-70Q22-39 0 0Z', C.green, `stroke="${C.ink}" stroke-width="2"`) +
      line('M0-5L-1-90M-1-44L-28-75M-1-44L25-81', C.cream, 1.1)));
}

export function ground(time, style = 'field') {
  if (style === 'pond') return `<g fill="none" stroke="#8c9b87" stroke-width="1" opacity=".7">${[0, 1, 2, 3].map((i) => {
    const offset = n(wave(time, 1, i) * 9);
    return `<path d="M${100 + offset} ${568 + i * 19}Q300 ${548 + i * 19} 490 ${568 + i * 19}T${1180 - offset} ${568 + i * 19}"/>`;
  }).join('')}</g>`;
  return `<g opacity=".5">${line('M97 590Q348 567 579 584T1183 580M169 609Q441 597 690 611T1118 610', '#ac946a', 1.1)}</g>`;
}

export function scene(time, content, { sunX = 920, sunY = 179, sky = true } = {}) {
  const texture = Array.from({ length: 55 }, (_, i) => {
    const x = (i * 83.17) % 256, y = (i * 47.73) % 256;
    return `<path d="M${n(x)} ${n(y)}l${3 + (i % 7)} ${i % 2 ? .6 : -.5}" stroke="${i % 3 ? '#9c8658' : '#fff5d8'}" stroke-width="${i % 3 ? .4 : .8}" opacity="${i % 3 ? .18 : .45}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <defs><radialGradient id="paper"><stop stop-color="#efe5cd"/><stop offset="1" stop-color="${C.paper}"/></radialGradient>
      <radialGradient id="sun"><stop stop-color="#d8b45d" stop-opacity=".36"/><stop offset="1" stop-color="#d8b45d" stop-opacity=".05"/></radialGradient>
      <pattern id="fibres" width="256" height="256" patternUnits="userSpaceOnUse">${texture}</pattern>
      <pattern id="speckle" width="15" height="17" patternUnits="userSpaceOnUse"><circle cx="2" cy="4" r=".65" fill="${C.paper}" opacity=".35"/><circle cx="9" cy="12" r=".4" fill="${C.ink}" opacity=".13"/></pattern>
    </defs><rect width="1280" height="720" fill="url(#paper)"/>
    ${sky ? `<circle cx="${sunX}" cy="${sunY}" r="101" fill="url(#sun)"/><circle cx="${sunX}" cy="${sunY}" r="76" fill="none" stroke="#bda16b" stroke-width=".7" opacity=".37"/>${cloud(216, 150, .82, time)}${cloud(1009, 292, .58, time, 1.4)}` : ''}
    ${content}
    <rect width="1280" height="720" fill="url(#fibres)" pointer-events="none"/>
  </svg>`;
}
