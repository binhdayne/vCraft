import { C, n, wave, stroke, line, path, group, eye, lotus, leaf, petalFlower, butterfly, ground, scene } from './folk-art.mjs';
import { child } from './blessings-scene.mjs';

function jacket(turtle) {
  const edge = turtle ? C.red : C.rose;
  return `<g ${stroke}>` +
    path('M-61-111Q-92-117-106-75L-96-11L-69-1L-46-48L-50 72Q-2 107 61 71L49-48L76-1L102-13L106-75Q96-112 62-112L33-103L0-70L-32-104Z', C.green) +
    path('M-61-111L-36-114L1-81L36-113L62-110L51-81L17-49L23 81L4 88L-2-48L-48-77Z', edge, 'stroke-width="2"') +
    line('M-49-102L4-62L44-100M11-51L16 77M-79-67L-87-26M78-64L85-27', C.paleGold, 1.6) +
    path('M-103-33L-96-11L-69-1L-59-18Z', edge, 'stroke-width="2"') +
    path('M77-2L102-13L105-34L69-17Z', edge, 'stroke-width="2"') + '</g>';
}

function toad(time) {
  const pulse = wave(time, 3) * .8;
  const texture = Array.from({ length: 42 }, (_, i) => {
    const x = -58 + (i * 37 % 144), y = 40 + Math.floor(i / 7) * 18;
    return `<circle cx="${x}" cy="${y}" r="${2 + i % 3}" fill="${C.gold}" stroke="${C.ink}" stroke-width=".8" opacity=".8"/>`;
  }).join('');
  return group(`translate(0 24) scale(1 ${n(1 + pulse * .009)})`,
    group(`rotate(${n(wave(time, 3) * 3)} -43 134)`,
      path('M-45 129Q-96 118-101 158L-100 190L-130 207L-113 213L-93 203L-89 215L-76 209L-63 215L-53 204L-68 195L-70 171L-24 158Z', C.green) +
      line('M-110 209L-101 202M-91 206L-88 198', C.cream, 1.3)) +
    group(`rotate(${n(wave(time, 3, 1) * -3)} 72 139)`,
      path('M54 135Q99 108 114 150L108 186L132 206L118 213L99 202L94 216L82 208L68 213L61 201L83 191L82 168L46 162Z', C.green) +
      line('M119 206L110 198M95 207L94 196', C.cream, 1.3)) +
    path('M-78 59Q-96 99-70 143Q-42 194 22 185Q89 185 98 134Q104 79 45 37L-20 21Z', C.gold) +
    path('M-12 30Q49 32 86 83Q115 127 80 166Q68 135 48 128Q68 80 27 58L-6 47Z', C.green) +
    texture +
    group(`rotate(${n(wave(time, 2) * 2)} -40 40)`,
      path('M-81 74Q-107 53-122 10Q-151-24-130-49Q-108-73-81-47Q-67-69-44-48Q-19-21-18 25L-31 63Z', C.gold) +
      path('M-129-41Q-121-69-101-57Q-80-54-82-30Q-99-16-117-23Z', C.green, 'stroke-width="2"') +
      eye(-106, -39, time, 1.2, 6) +
      `<circle cx="-138" cy="-4" r="2.4" fill="${C.ink}" stroke="none"/>` +
      line('M-134 15Q-114 33-88 14M-129 23Q-108 44-88 23M-77-22Q-67-26-67-13', C.ink, 2) +
      path('M-48 13Q-17 4-5 32Q-8 54-30 54Q-47 43-48 13Z', C.green) +
      line('M-32 25L-22 40', C.cream, 1.4)) +
    group(`rotate(${n(wave(time, 2, 1) * 3)} -65 96)`,
      path('M-60 83Q-85 82-82 109L-97 139L-119 139L-123 149L-105 155L-93 149L-80 158L-69 150L-63 124L-40 103Z', C.green) +
      line('M-106 149H-116M-84 149L-82 138', C.cream, 1.2)) +
    `<path d="M-65 69Q-35 87-25 117" fill="none" stroke="${C.cream}" stroke-width="1.5"/>`, stroke);
}

function turtle(time) {
  const legs = [[-87, 151, -14], [85, 149, 19], [-96, 103, 11], [81, 101, -13]].map(([x, y, angle], index) =>
    group(`translate(${x} ${y}) rotate(${n(angle + wave(time, 3, index * 1.5) * 6)})`,
      path('M-14-13Q-30 6-17 30L10 37L26 28L20 17L0 14L12-4Z', C.gold) +
      line('M4 25L1 31M12 25L10 33M20 24L18 30', C.ink, 1.3))).join('');
  const cells = [
    ['M-29 63L10 55L34 79L22 111L-13 118L-39 91Z', C.red],
    ['M34 79L70 73L93 97L75 125L40 125L22 111Z', C.green],
    ['M-39 91L-76 81L-104 103L-84 134L-45 133L-13 118Z', C.green],
    ['M-13 118L22 111L40 125L25 151L-7 156L-30 139Z', C.gold],
    ['M-84 134L-45 133L-30 139L-29 163L-66 158Z', C.red],
    ['M40 125L75 125L93 142L70 163L25 151Z', C.red],
    ['M-104 103L-76 81L-68 68L-103 85Z', C.gold],
  ].map(([d, color]) => path(d, color, 'stroke="'+C.cream+'" stroke-width="5"')).join('');
  return group('translate(1 25)',
    path('M-103 127L-142 139L-115 112Z', C.gold) + legs +
    group(`rotate(${n(wave(time, 2) * 3)} 92 111)`,
      path('M81 99L127 85Q128 62 150 66Q179 66 172 92Q163 117 126 113L91 130Z', C.gold) +
      eye(153, 79, time, 2, 3.6) +
      line('M161 100L170 95M133 92L141 96', C.ink, 1.8)) +
    path('M-114 122Q-108 153-65 170Q18 194 92 158L111 130L94 112L-97 105Z', C.gold) +
    path('M-114 122C-111 66-66 41-9 44C55 35 106 73 111 130Q18 183-114 122Z', C.green) +
    `<clipPath id="virtue-shell"><path d="M-114 122C-111 66-66 41-9 44C55 35 106 73 111 130Q18 183-114 122Z"/></clipPath>` +
    `<g clip-path="url(#virtue-shell)">${cells}</g>` +
    line('M-110 121Q-27 174 108 129', C.cream, 4) +
    line('M-84 146L-81 159M-63 155L-63 168M-40 162L-39 173M-16 168V179M11 169V180M38 165L40 176M65 158L70 170M87 148L93 159', C.ink, 1.5), stroke);
}

function hands(time, isTurtle) {
  if (isTurtle) return `<g ${stroke}>` +
    path('M-94-13Q-109 14-86 39L-39 73L-10 70L-4 56Q-19 43-40 49L-66 21L-65-6Z', C.skin) +
    path('M81-9Q107 7 93 33L68 64L52 79L40 77L37 65L57 44L64 22L62-7Z', C.skin) +
    line('M-18 57L-7 62M-26 63L-14 69M50 62L59 70M58 56L67 64', C.ink, 1.5) + '</g>';
  return `<g ${stroke}>` +
    path('M-92-12Q-109 12-91 36L-61 69L-31 78L-20 67L-32 55L-46 53L-65 19L-66-4Z', C.skin) +
    path('M82-11Q107 6 94 38L69 92Q54 109 39 95L36 83L50 64L62 18L61-4Z', C.skin) +
    line('M44 79L55 88M41 87L51 95M-40 63L-27 70M-48 68L-36 76', C.ink, 1.5) + '</g>';
}

function virtuesScene(seconds, isTurtle) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time,
    ground(time, 'pond') + lotus(time, isTurtle ? 1010 : 315, 572, 1.25, 1) +
    group(`translate(${isTurtle ? 281 : 1027} 576) rotate(${n(wave(time, 2, 1.4) * 2)})`,
      leaf(0, 0, -31, 1.2) + leaf(0, -12, 37, 1.15, C.jade) +
      petalFlower(-26, -173, .64, isTurtle ? C.rose : C.gold, time)) +
    `<ellipse cx="667" cy="629" rx="172" ry="10" fill="#9c9467" opacity=".12"/>` +
    group(`translate(666 ${n(379 + wave(time, 2) * 1.8)}) rotate(${n(wave(time, 1) * .65)} 0 110)`,
      child(time, 'rooster') + jacket(isTurtle) + (isTurtle ? turtle(time) : toad(time)) + hands(time, isTurtle)) +
    butterfly(time, isTurtle ? 368 : 1001, 219, C.red, .5), { sunX: isTurtle ? 933 : 340, sunY: 164 });
}

export const kindnessScene = (time = 0) => virtuesScene(time, false);
export const wisdomScene = (time = 0) => virtuesScene(time, true);
