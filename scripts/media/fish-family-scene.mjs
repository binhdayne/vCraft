import { C, n, wave, line, path, group, lotus, grasses, scene } from './folk-art.mjs';
import { carp } from './carp-scene.mjs';

function pondLeaf(time, x, y, size, angle, phase) {
  return group(`translate(${x} ${y}) rotate(${n(angle + wave(time, 2, phase) * 2.2)}) scale(${size})`,
    path('M0 0C-48-2-91-32-80-67C-77-91-48-101-15-87C16-109 68-97 75-65C86-27 46-6 0 0Z', C.green, `stroke="${C.ink}" stroke-width="2.5"`) +
    line('M0-7L-10-79M0-7L-61-57M0-7L56-63M0-7L-67-30M0-7L60-27', C.paleGold, 1.3));
}

export function fishFamilyScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const water = Array.from({ length: 11 }, (_, i) => {
    const offset = n(wave(time, 2, i * .6) * 12);
    return line(`M${90 + offset} ${320 + i * 28}Q360 ${303 + i * 28} 640 ${320 + i * 28}T${1190 - offset} ${320 + i * 28}`, '#819b8b', 1, 'opacity=".32"');
  }).join('');
  const bubbles = [0, 1, 2, 3, 4].map((i) => `<circle cx="${n(861 + wave(time, 1, i) * 7)}" cy="${n(493 - i * 29 + wave(time, 2, i) * 8)}" r="${3 + i % 3}" fill="none" stroke="#94a18a" stroke-width="1.3" opacity=".55"/>`).join('');
  return scene(time,
    water + lotus(time, 225, 566, 1.7, 1.1) + lotus(time, 1050, 540, 1.73, 2.1) +
    pondLeaf(time, 396, 270, 1.09, -37, 1) + pondLeaf(time, 913, 214, .8, 19, 2.4) +
    carp(time, { x: 862, y: 279, size: .41, angle: -15, phase: 2, small: true, key: 'family-upper' }) +
    carp(time, { x: 641, y: 381, size: 1.14, angle: 27, phase: .5, flipped: true, key: 'family-mother' }) +
    carp(time, { x: 400, y: 543, size: .49, angle: 19, phase: 2.9, small: true, key: 'family-left' }) +
    carp(time, { x: 816, y: 599, size: .38, angle: -8, phase: 4.1, small: true, flipped: true, key: 'family-lower' }) +
    bubbles +
    pondLeaf(time, 1053, 605, .68, 22, .3) + pondLeaf(time, 196, 623, .64, -28, 3) +
    grasses(time, 1000, 653, .8, 2.4) +
    line(`M${n(167 + wave(time, 2) * 5)} 650Q410 632 653 650T1118 650`, '#8c9b87', 1.5, 'opacity=".5"'), { sunX: 638, sunY: 164 });
}
