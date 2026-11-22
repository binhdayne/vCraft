import { C, n, wave, stroke, line, path, group, eye, grasses, ground, scene, butterfly } from './folk-art.mjs';
import { floweringBranch } from './festival-art.mjs';

function feather(x, y, angle, length, color) {
  return group(`translate(${x} ${y}) rotate(${angle})`,
    path(`M0 0Q-17 ${-length * .42}-7-${length}Q18 ${-length * .88} 14 ${-length * .43}Q10-14 0 0Z`, color) +
    line(`M2-4Q7 ${-length * .51}-5 ${-length + 11}`, C.ink, 1.3));
}

function hen(time) {
  const peck = Math.max(0, wave(time, 2, -1)) ** 4;
  return group(`translate(651 ${n(558 + wave(time, 3) * 1.3)}) scale(1.3)`, `<g ${stroke}>` +
    [-42, 35].map((x, i) => line(`M${x}-47L${n(x + wave(time, 4, i) * 2)}-1L${x + 23} 3M${x}-1L${x - 14} 6M${x}-1L${x + 9} 10`, C.ink, 3.5)).join('') +
    group(`rotate(${n(wave(time, 2) * 2.5)} -95 -125)`,
      [-71, -54, -38, -23, -8, 7, 22].map((a, i) => feather(-97 + i * 2, -111 - i * 2, a - 19, 193 - i * 12, [C.green, C.red, C.green, C.gold, C.green, C.red, C.green][i])).join('') +
      line('M-98-119Q-148-180-193-230M-95-121Q-134-207-137-262', C.cream, 1.5)) +
    path('M-131-131Q-119-178-42-173Q37-190 101-146Q151-98 91-56Q36-22-59-38Q-131-46-145-91Z', C.gold) +
    path('M-126-119Q-84-149-25-137Q39-128 98-107L84-76Q20-46-63-61Q-119-66-126-119Z', C.green) +
    Array.from({ length: 8 }, (_, row) => Array.from({ length: 7 }, (_, col) => {
      const x = -111 + col * 24 + (row % 2) * 12, y = -137 + row * 10;
      return line(`M${x} ${y}q10 13 20 1`, row % 2 ? C.cream : C.red, 1.4);
    }).join('')).join('') +
    group(`rotate(${n(wave(time, 3, .7) * 2)} -65 -122)`,
      path('M-111-133Q-46-169 52-119Q91-83 24-56Q-53-46-111-96Z', C.red) +
      path('M-95-121Q-39-143 43-112L23-99Q-43-118-84-103Z', C.gold) +
      Array.from({ length: 9 }, (_, i) => feather(-81 + i * 12, -105 + i * 4, -168 + i * 5, 41 + i * 3, i % 2 ? C.green : C.cream)).join('') +
      line('M-97-126Q-42-146 46-112M-92-117Q-38-134 30-109', C.cream, 1.1)) +
    group(`rotate(${n(peck * 24 + wave(time, 2) * 2)} 74 -122)`,
      path('M40-131Q52-167 60-199Q61-242 91-249Q125-257 141-228Q151-205 131-186L109-135Q88-103 40-131Z', C.gold) +
      path('M62-198Q57-228 78-242Q113-260 135-232L134-204Q113-189 95-192L79-165Z', C.red) +
      path('M84-239Q77-247 83-255Q91-260 97-251Q108-263 115-251Q132-255 133-241Z', C.red) +
      path('M134-220L159-209L134-205Z', C.gold) +
      path('M125-199Q144-194 134-180Q121-175 118-190Z', C.red) +
      eye(113, -224, time, 1.3, 5) +
      Array.from({ length: 6 }, (_, i) => path(`M${65 + i * 5} ${-197 + i * 8}q5 15 15 20l-3-16Z`, i % 2 ? C.green : C.cream, 'stroke-width="1.2"')).join('') +
      line('M140-212L151-209M98-218Q91-207 99-203', C.ink, 1.2)) + '</g>');
}

function chick(time, { x, y, size = 1, phase = 0, mirror = false, color = C.gold, pecking = false }) {
  const peck = pecking ? Math.max(0, wave(time, 3, phase)) ** 4 * 23 : 0;
  const step = n(wave(time, 6, phase) * 3);
  return group(`translate(${n(x + wave(time, 2, phase) * 6)} ${y}) scale(${mirror ? -size : size} ${size})`, `<g ${stroke}>` +
    line(`M-14-21L${-15 + step}-1L-2 4M${-15 + step}-1L-25 3M13-21L${15 - step}-1L28 3M${15 - step}-1L9 5`, C.ink, 2.4) +
    group(`translate(0 ${n(wave(time, 6, phase) * 1.4)})`,
      group(`rotate(${n(wave(time, 4, phase) * 8)} -31 -45)`,
        path('M-27-45Q-58-54-63-82Q-39-80-25-59Z', C.green) + path('M-31-43Q-64-35-75-54Q-47-63-28-52Z', C.red)) +
      path('M-41-56Q-13-85 25-61Q51-41 28-23Q-9-8-37-28Z', color) +
      path('M-26-53Q-7-72 25-52Q31-36 12-28Q-11-27-26-53Z', C.green) +
      line('M-19-49Q-7-61 15-48M-13-43L14-36M-4-39L15-32', C.cream, 1.4) +
      group(`rotate(${n(peck + wave(time, 4, phase) * 2)} 26 -48)`,
        path('M16-48Q10-73 23-84Q43-99 58-83Q69-67 54-53L44-37Z', color) +
        path('M56-73L74-66L56-61Z', C.red) +
        eye(45, -76, time, phase, 3.6) +
        line('M28-65L33-57M35-64L40-57', C.ink, 1))) + '</g>');
}

export function henScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) + floweringBranch(time, 191, 563, false, .7) + floweringBranch(time, 1094, 560, true, 2) +
    `<ellipse cx="652" cy="594" rx="314" ry="15" fill="#ad935c" opacity=".12"/>` +
    chick(time, { x: 955, y: 475, size: .82, phase: 3.4, mirror: true, color: C.jade }) +
    hen(time) +
    chick(time, { x: 351, y: 600, size: .87, phase: 1, color: C.gold }) +
    chick(time, { x: 485, y: 634, size: .8, phase: 1.6, pecking: true }) +
    chick(time, { x: 664, y: 642, size: .8, phase: 2.2, mirror: true, color: C.red, pecking: true }) +
    chick(time, { x: 840, y: 606, size: .89, phase: 2.9, mirror: true }) +
    chick(time, { x: 989, y: 635, size: .78, phase: 4.2, mirror: true, color: C.jade, pecking: true }) +
    Array.from({ length: 19 }, (_, i) => `<ellipse cx="${393 + i * 32}" cy="${620 + (i % 3) * 9}" rx="2.5" ry="1.3" fill="${C.gold}" transform="rotate(${i * 29} ${393 + i * 32} ${620 + (i % 3) * 9})"/>`).join('') +
    grasses(time, 207, 632, .6, 1) + grasses(time, 1097, 649, .65, 2.5) + butterfly(time, 1012, 257, C.rose, 1.2), { sunX: 893, sunY: 168 });
}
