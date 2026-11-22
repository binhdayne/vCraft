import { C, n, wave, stroke, line, path, group, grasses, ground, scene, butterfly } from './folk-art.mjs';
import { face, hand, brocade } from './festival-art.mjs';

function coconut(x, y, angle = 0, size = 1) {
  return group(`translate(${n(x)} ${n(y)}) rotate(${n(angle)}) scale(${size})`,
    path('M-17-18Q4-33 21-13Q30 8 9 24Q-10 34-24 12Q-34-5-17-18Z', C.jade, stroke) +
    line('M-14-18Q-22 4-9 23M1-24Q-6 4 4 23M16-17Q4 4 12 20', '#b5b16b', 1.5) +
    `<circle cx="1" cy="-20" r="2" fill="${C.ink}"/><circle cx="8" cy="-17" r="1.8" fill="${C.ink}"/>`);
}

function palmLeaf(time, angle, length, color, phase) {
  const blade = path(`M0 0Q${length * .52} -65 ${length} 32Q${length * .5} -16 0 0Z`, color, stroke);
  const veins = Array.from({ length: 15 }, (_, i) => {
    const p = (i + 1) / 16, x = n(length * p), y = n(-50 * Math.sin(p * Math.PI) + p * 27);
    return line(`M${x} ${y}l${n(length * .06)} ${n(13 + Math.sin(p * Math.PI) * 22)}`, C.ink, 1.2);
  }).join('');
  return group(`rotate(${n(angle + wave(time, 2, phase) * 2.2)})`, blade +
    line(`M0 0Q${length * .5} -49 ${length - 8} 26`, C.gold, 1.5) + veins);
}

function climber(time) {
  return group(`translate(563 ${n(362 + wave(time, 2) * 2)}) rotate(-7)`, `<g ${stroke}>` +
    path('M-6-44Q-35-35-37 0L-20 25L13 17L20-3L38-11L32-28L5-19L-12 2L-14-17Z', C.skin) +
    path('M-22 14Q-9 21 9 14L24 42L-3 57L-22 36L-33 40L-40 28Z', C.red) +
    path('M-2 50Q-24 59-40 48L-54 15Q-59 0-66 8L-67 28L-56 60Q-32 82 9 66Z', C.skin) +
    path('M20 38Q52 45 57 65L47 89L25 84L30 66L5 59Z', C.skin) +
    path('M-4-52L-7-74L17-75L19-49Z', C.skin) +
    group('translate(7 -93)', face(time, { phase: .8, tilt: 13 })) +
    path('M-23-46Q-46-41-34-23L-5-7L23-38L13-50L-7-29Z', C.skin) +
    hand(23, -42, 29, .8) +
    group(`rotate(${n(wave(time, 2, .5) * 5)} 17 -46)`,
      path('M16-44Q43-40 46-60L45-93L33-96L27-66L11-62Z', C.skin) + hand(39, -99, -22, .8)) +
    line('M-55 17L-59 23M30 77L40 80M-26-5L-18 2M-4 34L8 42', C.ink, 1.2) + '</g>');
}

function catcher(time) {
  const rock = n(wave(time, 2, 1) * 1.5);
  return group(`translate(824 620) rotate(${rock} 0 -35)`, `<g ${stroke}>` +
    path('M-35-34L-36-5L-53 2Q-56 9-36 8L-18 4L-13-35M13-34L16 3Q39 12 51 5L36-4L36-34Z', C.ink) +
    path('M-31-184Q-65-173-59-135L-50-88L-63-29Q1-5 66-29L49-91L57-139Q63-170 28-185Z', C.green) +
    path('M-24-181L-5-145L19-180L32-76L-31-73Z', C.red) +
    path('M-13-179L-4-151L9-178L18-104L-17-102Z', C.gold) +
    path('M-57-64Q4-54 55-69L58-58Q5-42-59-52Z', C.rose) +
    line('M-46-41L-36-114M45-39L34-115M-25-27L-17-65M27-27L19-68', C.paleGold, 1.4) +
    path('M-44-173Q-76-173-82-140L-98-110L-83-99L-60-128L-36-143Z', C.green) +
    path('M42-172Q74-169 78-141L99-107L85-98L61-127L34-142Z', C.green) +
    hand(-93, -105, -59, .8) + hand(93, -104, 59, .8) +
    path('M-13-183L-14-205L13-205L14-183Z', C.skin) +
    group('translate(-3 -219) rotate(-11)', face(time, { female: true, phase: 1.8, tilt: -4 })) +
    path('M-99-104Q-47-69-3-99Q49-74 98-104L63-38Q8 3-66-37Z', C.cream) +
    path('M-99-104Q-47-69-3-99Q49-74 98-104L63-38Q8 3-66-37Z', 'url(#coconut-apron)', 'stroke="none"') +
    line('M-92-97Q-41-61-3-91Q43-65 90-96M-67-83L-49-43M-29-84L-21-29M30-83L25-28M67-83L50-42', C.gold, 1.4) + '</g>');
}

function child(time, x, y, size, phase, point = false) {
  return group(`translate(${x} ${y}) scale(${size}) rotate(${n(wave(time, 2, phase) * 2)} 0 -20)`, `<g ${stroke}>` +
    path('M-19-26L-24-2L-36 2Q-38 9-23 7L-10 3L-2-24M6-24L11 4L31 7L34 1L23-3L21-26Z', C.skin) +
    path('M-20-84Q-38-79-32-56L-24-27Q0-13 28-27L31-59Q34-81 16-85Z', C.gold) +
    path('M-25-33Q0-25 27-34L27-22L-26-21Z', C.red) +
    path('M-8-85V-101H10V-86Z', C.skin) +
    group('translate(0 -111) scale(.68)', face(time, { phase })) +
    (point ? path('M17-80Q35-84 40-114L43-143L55-144L55-111Q49-71 26-62Z', C.skin) + hand(49, -145, 15, .5)
      : path('M-24-77Q-44-61-27-45L-2-41L3-54L-20-60ZM24-78Q44-60 24-45L7-41L3-54L19-61Z', C.skin)) +
    line('M-14-74L-3-59L10-76M-3-58V-35', C.red, 1.3) + '</g>');
}

export function coconutScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const phase = (time % 6) / 6, drop = Math.max(0, Math.min(1, (phase - .16) / .55));
  const tree = path('M479 632Q490 402 546 181L577 179Q528 406 523 634Z', '#a8794b', stroke) +
    path('M480 633Q492 404 548 182L556 180Q511 410 501 636Z', '#d0ac71', 'stroke="none"') +
    Array.from({ length: 19 }, (_, i) => {
      const y = 209 + i * 22, x = 539 - i * 2.7 + i * i * .028;
      return line(`M${n(x)} ${y}q15 13 33 1`, C.ink, 1.4);
    }).join('');
  return scene(time, `<defs>${brocade('coconut-apron', C.red, 24)}</defs>` + ground(time) +
    group(`rotate(${n(wave(time, 2) * .55)} 504 636)`, tree +
      group('translate(561 180)',
        [-163, -128, -95, -53, -14, 19, 47].map((a, i) => palmLeaf(time, a, [212, 169, 145, 179, 229, 247, 223][i], i % 2 ? C.green : C.jade, i * .7)).join('') +
        line('M0 0L-9 65M2 0L29 45M0 0L50 20', C.ink, 2.7) +
        coconut(-12, 58, -8, .84) + coconut(24, 47, 18, .82) + coconut(48, 24, 25, .72)) + climber(time)) +
    grasses(time, 495, 641, .75, 1.5) +
    child(time, 286, 622, .95, 1.6, true) + child(time, 388, 639, .8, 2.7) +
    group(`translate(0 0)`, coconut(607 + drop * 176, 268 + drop * drop * 289, drop * 110, .88), `opacity="${phase > .16 && phase < .71 ? 1 : 0}"`) +
    catcher(time) +
    group('translate(1076 610)',
      path('M-67-52Q0-76 66-52L50 7Q-2 27-51 7Z', '#b79a5e', stroke) +
      [-43, -24, -5, 14, 33, 50].map(x => line(`M${x}-49L${n(x * .76)} 10`, C.ink, 1.1)).join('') +
      [-35, -17, 0].map(y => line(`M-60 ${y}Q0 ${y + 25} 60 ${y}`, C.ink, 1)).join('') +
      coconut(-28, -48, -20, .92) + coconut(22, -48, 23, .95) + coconut(-1, -70, 12, .83) +
      `<ellipse cy="-51" rx="65" ry="12" fill="none" stroke="${C.ink}" stroke-width="3"/>`) +
    grasses(time, 1119, 640, .65, 2.6) + butterfly(time, 1011, 256, C.rose, .7), { sunX: 973, sunY: 172 });
}
