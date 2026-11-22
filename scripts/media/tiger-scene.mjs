import { C, n, wave, stroke, line, path, group, eye, grasses, ground, scene } from './folk-art.mjs';

const GOLD = '#d5a64c';
function bamboo(time, x, y, mirror, phase) {
  return group(`translate(${x} ${y}) scale(${mirror ? -.9 : .9} .9) rotate(${n(wave(time, 2, phase) * 1.1)})`,
    line('M0 0L-13-388M33 0L55-279', C.green, 8) +
    line('M-2-4L-15-386M31-4L53-276', '#a7ab75', 2) +
    [-66, -132, -198, -264, -330].map(v => line(`M${n(v / 30 - 5)} ${v}h12`, C.ink, 1.8)).join('') +
    [-91, -165, -235].map(v => line(`M${n(35 - v / 12 - 4)} ${v}h11`, C.ink, 1.5)).join('') +
    [0, 1, 2, 3, 4].map(i => group(`translate(${i % 2 ? 50 : -9} ${-153 - i * 43}) rotate(${i % 2 ? -16 : 23})`,
      [-72, -42, -11, 24, 53].map((a, j) => group(`rotate(${a})`,
        path(`M0 0Q${j % 2 ? -15 : 13}-36 0-${62 + j * 8}Q22-26 0 0Z`, j % 2 ? C.green : C.jade, 'stroke="'+C.ink+'" stroke-width="1.1"') +
        line(`M1-5V-${53 + j * 8}`, C.paleGold, .7))).join(''))).join(''));
}

function paw(time, x, y, phase, back = false) {
  const bend = n(wave(time, 3, phase) * 1.2);
  const d = back ? 'M-29-81Q-57-55-36-26L-13-8L-39 3Q-53 17-36 22L17 21Q31 10 16-1L-2-29L11-72Z'
    : 'M-24-93L-21-31L-13-7L-31 3Q-42 17-21 21L24 21Q43 9 22-1L8-23L17-91Z';
  return group(`translate(${x} ${y}) rotate(${bend} 0 -80)`,
    `<defs><clipPath id="tiger-leg-${phase}"><path d="${d}"/></clipPath></defs>` +
    path(d, GOLD, stroke) +
    `<g clip-path="url(#tiger-leg-${phase})">${[-70, -49, -25].map((v, i) => path(`M-35 ${v}Q${i % 2 ? 24 : 5} ${v - 10} 31 ${v - 5}Q5 ${v + 7}-18 ${v + 4}Z`, C.ink)).join('')}</g>` +
    line('M-19 11L-19 20M-5 12L-5 20M9 12L9 20', C.ink, 1.4));
}

function tiger(time) {
  const body = 'M-170-127Q-166-196-91-202Q-25-214 42-180Q93-175 121-133Q137-91 98-71Q66-49 12-53Q-47-39-104-70Q-150-39-173-82Z';
  const tail = 'M-157-112C-253-130-256-235-228-281C-208-314-207-340-234-358C-214-355-192-330-209-294C-247-214-214-157-153-133Z';
  const stripes = Array.from({ length: 10 }, (_, i) => {
    const x = -153 + i * 25;
    return path(`M${x}-213Q${x + 29}-178 ${x + 8}-137Q${x - 6}-111 ${x + 13}-87Q${x - 21}-101 ${x - 10}-144Q${x + 5}-173 ${x - 11}-203Z`, C.ink);
  }).join('');
  return group('translate(691 572) scale(1.5)',
    `<defs><clipPath id="tiger-body"><path d="${body}"/></clipPath><clipPath id="tiger-tail"><path d="${tail}"/></clipPath></defs>` +
    group(`rotate(${n(wave(time, 2) * 5)} -159 -118)`,
      path(tail, GOLD, stroke) + '<g clip-path="url(#tiger-tail)">' +
      Array.from({ length: 9 }, (_, i) => {
        const y = -160 - i * 20;
        return line(`M${-228 + Math.sin(i * .7) * 12} ${y}l${i > 5 ? 17 : 14} ${i < 4 ? 5 : -4}`, C.ink, 5);
      }).join('') + path('M-234-358Q-213-350-207-330L-218-326Q-218-345-234-348Z', C.ink) + '</g>') +
    paw(time, -104, 0, .5, true) + paw(time, 52, 0, 1.9) +
    group(`translate(0 ${n(wave(time, 3) * 1.3)})`,
      path(body, GOLD, stroke) +
      `<g clip-path="url(#tiger-body)">` +
      path('M-164-94Q-49-25 109-104Q84-56 15-48Q-56-23-116-66Z', C.cream) +
      stripes +
      line('M-154-160Q-119-198-62-191Q3-193 43-167', C.cream, 1.5) + '</g>') +
    paw(time, -132, 19, 2.8, true) + paw(time, 94, 20, 3.7) +
    group(`translate(119 ${n(-135 + wave(time, 3) * 1.2)}) rotate(${n(-9 + wave(time, 2) * 2)})`, `<g ${stroke}>` +
      `<circle cx="-43" cy="-50" r="23" fill="${C.ink}"/><circle cx="48" cy="-49" r="23" fill="${C.ink}"/>` +
      `<circle cx="-43" cy="-50" r="15" fill="${C.cream}"/><circle cx="48" cy="-49" r="15" fill="${C.cream}"/>` +
      path('M-48-41Q-19-69 22-58Q61-51 64-18L59 20Q47 59 5 63Q-39 65-58 27Q-71-9-48-41Z', GOLD) +
      path('M-57-13Q-42-38-18-20L-11-3Q-34 10-54 5ZM14-23Q40-41 58-19L59 4Q39 16 16-2Z', C.cream) +
      path('M-60 14Q-42 18-17 33L-3 58Q-39 61-56 34ZM60 15Q36 18 18 36L7 60Q44 64 56 35Z', C.cream) +
      path('M-48-34L-21-29L-33-16L-56-19ZM21-30L48-36L57-21L34-17ZM-22-51L1-43L24-53L18-38L2-31L-17-36Z', C.ink) +
      path('M-9-55L4-55L9-22L1-15L-7-25Z', C.ink) +
      eye(-31, -6, time, 2.2, 7.2) + eye(34, -7, time, 2.2, 7.2) +
      path('M-17 8Q-24 20-13 30L0 26L13 30Q31 21 18 8Q4 0-17 8Z', C.cream) +
      path('M-13 10Q3 5 17 10L5 21L0 22Z', C.ink, 'stroke-width="1.5"') +
      line('M2 23V33M2 33Q-9 42-18 31M2 33Q17 42 24 30', C.ink, 1.9) +
      path('M-16 39Q4 48 22 37Q15 59 1 55Q-9 53-16 39Z', C.red, 'stroke-width="1.6"') +
      path('M-11 41L-7 49L-3 44M13 42L11 50L7 45', C.cream, 'stroke-width="1"') +
      line('M-54 11L-24 18L-56 23M-50 31L-25 27M55 12L29 20L57 25M51 33L29 29', C.ink, 2.3) +
      [-1, 1].map(side => [0, 1, 2].map(i => line(`M${side * (18 + i * 4)} ${24 + i * 3}Q${side * 48} ${17 + i * 13} ${side * 81} ${8 + i * 24}`, C.ink, 1.2)).join('')).join('') + '</g>'));
}

export function tigerScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) + bamboo(time, 192, 592, false, .5) + bamboo(time, 1108, 589, true, 2.2) +
    `<ellipse cx="680" cy="622" rx="311" ry="17" fill="#b3965c" opacity=".16"/>` +
    path('M1019 596Q1037 553 1070 570Q1105 543 1137 573L1164 614Q1092 629 1019 613Z', '#9d9e83', `stroke="${C.ink}" stroke-width="2"`) +
    line('M1042 593L1069 579L1081 592M1095 587L1123 577L1140 606', '#d1c6a5', 1.7) +
    tiger(time) + grasses(time, 291, 628, .8, 1.6) + grasses(time, 1036, 647, .67, 2.8), { sunX: 894, sunY: 174 });
}
