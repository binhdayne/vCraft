import { C, n, wave, stroke, line, path, group, ground, scene, lotus, cloud } from './folk-art.mjs';
import { brocade, face, hand, onlooker, festivalPennant, conicalHat } from './festival-art.mjs';

function swingRider(time, female, x, phase) {
  const bend = n(wave(time, 2, phase) * 2.5);
  return group(`translate(${x} 0) rotate(${bend} 0 375)`, `<g ${stroke}>` +
    path('M-23 335L-24 366L-36 375L-9 378L0 340M9 337L11 370L39 376L25 366L29 336', C.ink) +
    path('M-23 240Q-37 251-33 284L-43 342Q-4 358 43 341L33 283Q38 250 21 240Z', female ? C.green : C.red) +
    path('M-13 241L0 265L15 242L20 311L-18 311Z', female ? C.gold : C.cream) +
    path('M-34 296Q2 305 35 294L37 308Q3 320-37 309Z', female ? C.red : C.green) +
    line('M-26 326L-19 274M25 331L18 278M-29 338Q0 347 30 337', C.paleGold, 1.3) +
    path('M-23 244Q-49 240-46 211L-40 176L-26 179L-26 213L-11 229Z', female ? C.green : C.red) +
    path('M22 244Q45 242 44 211L40 181L26 184L26 216L10 230Z', female ? C.green : C.red) +
    hand(-33, 172, -14, .65) + hand(33, 177, 14, .65) +
    path('M-11 237L-12 221L11 220L12 238Z', C.skin) +
    group('translate(0 200)', face(time, { female, phase, hat: !female, tilt: female ? -5 : 4 })) +
    (female ? group(`rotate(${n(wave(time, 3) * 3)} 28 294)`, path('M29 297Q64 304 65 332Q43 322 31 322Z', C.rose) + line('M38 308L54 322', C.cream, 1)) : '') + '</g>');
}

export function swingScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const angle = n(wave(time, 2) * 17);
  const bamboo = (d, nodes) => line(d, '#7f8250', 12) + line(d, '#c9bd72', 6) + nodes.map(([x, y]) => line(`M${x - 7} ${y}h14`, C.ink, 1.8)).join('');
  return scene(time, ground(time) +
    festivalPennant(time, 190, 558, C.red, 1, .95) + festivalPennant(time, 1082, 560, C.green, 2, -.88) +
    `<ellipse cx="644" cy="641" rx="280" ry="14" fill="#a68b50" opacity=".13"/>` +
    bamboo('M421 625L612 128', [[471, 496], [512, 387], [554, 278], [593, 181]]) +
    bamboo('M854 625L667 126', [[811, 510], [773, 405], [728, 284], [684, 177]]) +
    line('M608 127L670 127', '#78844f', 16) + line('M608 122L671 122', C.paleGold, 4) +
    group(`translate(640 133) rotate(${angle})`,
      line('M-51 0L-78 382M51 0L78 382', C.ink, 3.7) +
      line('M-51 0L-78 382M51 0L78 382', C.gold, 1.6) +
      swingRider(time, false, -37, .4) + swingRider(time, true, 38, 1.3) +
      path('M-94 379L90 379L95 392L-97 393Z', '#7a5235', stroke) + line('M-89 385H88', C.gold, 1.4) +
      line('M-59-1L-45 8M45-1L59 8', C.red, 4)) +
    onlooker(time, { x: 301, y: 615, size: 1.17, female: true, color: C.blue, phase: 1, clap: true }) +
    onlooker(time, { x: 979, y: 616, size: 1.05, color: C.red, phase: 2.2, clap: true }) +
    onlooker(time, { x: 1100, y: 627, size: .74, female: true, color: C.green, phase: 3.3 }) +
    conicalHat(1097, 482, .76, -4) +
    line('M112 643Q652 665 1165 642', '#a78d62', 1.2), { sunX: 984, sunY: 161 });
}

function puller(time, x, mirrored, phase, color) {
  const rock = wave(time, 4) * 3;
  return group(`translate(${n(x + wave(time, 2) * 9)} 582) scale(${mirrored ? -1 : 1} 1)`, `<g ${stroke}>` +
    path('M-24-66Q-49-47-56-9L-79 2Q-88 12-61 9L-42 3L-9-53Z', C.skin) +
    path('M17-65Q34-48 44-15L62-3Q67 8 48 8L32-1L-1-49Z', C.skin) +
    group(`rotate(${n(-12 + rock)} 0 -60)`,
      path('M-24-145Q-47-126-38-96L-29-66Q-9-49 29-67L39-103Q37-132 16-143Z', C.skin) +
      path('M-31-74Q-4-61 30-75L29-58L-31-55Z', color) +
      path('M-31-57L-12-57L-25-32L-42-44ZM13-57L31-58L35-34L16-28Z', color) +
      line('M-20-116Q-6-107 7-114M-12-94Q-5-89 2-92M-4-82V-78', C.ink, 1.25) +
      path('M-33-132Q-53-123-39-106L30-107L71-125L65-139L23-126L-20-127Z', C.skin) +
      path('M26-133Q37-146 55-143L82-132L76-117L51-123L31-111Z', C.skin) +
      hand(74, -132, 78, .8) +
      path('M-15-140L-14-157L13-158L16-140Z', C.skin) +
      group('translate(-8 -178) rotate(8)', face(time, { phase })) +
      path('M-34-197Q-5-214 18-201L18-191Q-6-201-34-186Z', color) +
      group(`rotate(${n(wave(time, 4, phase) * 5)} -32 -191)`, path('M-31-196Q-60-207-66-187L-55-187L-62-171Q-40-176-31-189Z', color))
    ) + '</g>');
}

export function tugScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const tug = n(wave(time, 2) * 9);
  return scene(time, ground(time) +
    festivalPennant(time, 148, 390, C.red, .7, .9) + festivalPennant(time, 1132, 390, C.green, 2.4, -.9) +
    line('M640 274V626', '#7b543b', 10) + line('M636 280V623', C.gold, 2) +
    path('M622 278L640 252L658 278Z', C.red, stroke) +
    path('M607 634Q640 595 674 634Z', C.green, stroke) +
    [-1, 1].map(side => [0, 1, 2].map(i => puller(time, side < 0 ? 180 + i * 143 : 1100 - i * 143, side > 0, i * .3, side < 0 ? C.red : C.green)).join('')).join('') +
    line(`M${235 + tug} ${n(436 + rockForRope(time))}Q420 437 ${640 + tug} 434T${1045 + tug} ${n(436 + rockForRope(time))}`, C.ink, 7) +
    line(`M${235 + tug} ${n(435 + rockForRope(time))}Q420 436 ${640 + tug} 433T${1045 + tug} ${n(435 + rockForRope(time))}`, C.gold, 3.5) +
    group(`translate(${640 + tug} 435) rotate(${n(wave(time, 4) * 8)})`,
      path('M-8-8L9-8L10 7L-9 7ZM-4 5Q-17 30-2 45L3 28L13 40Q20 18 6 5Z', C.red, stroke) +
      line('M-5-5L5 4M5-5L-5 4', C.paleGold, 1.2)) +
    onlooker(time, { x: 640, y: 650, size: .7, female: false, color: C.blue, phase: 2.4, clap: true }) +
    `<g opacity=".45">${line('M95 637Q304 653 505 639M777 640Q991 654 1183 637', '#a58a5e', 1)}</g>`, { sunX: 640, sunY: 163 });
}

const rockForRope = time => wave(time, 4) * 2;

function fan(time, x, y, angle) {
  return group(`translate(${x} ${y}) rotate(${n(angle + wave(time, 3) * 4)})`,
    path('M0 0L-47-44Q-14-76 28-56L0 0Z', C.cream, stroke) +
    Array.from({ length: 6 }, (_, i) => line(`M0 0L${-43 + i * 13} ${-49 - Math.sin(i / 5 * Math.PI) * 12}`, C.gold, 1.2)).join('') +
    path('M-42-42Q-12-66 23-51L20-43Q-14-55-37-35Z', C.red, 'stroke-width="1.2"') +
    `<circle r="3" fill="${C.ink}"/>`);
}

function singer(time, x, y, female, size, phase) {
  return group(`translate(${x} ${y}) scale(${size})`, `<g ${stroke}>` +
    path('M-29-36L-31-5L-42 2Q-47 9-24 8L-9 2L-5-34M6-34L11 3Q32 13 42 6L29-5L27-34Z', C.ink) +
    group(`rotate(${n(wave(time, 2, phase) * 1.3)} 0 -28)`,
      path('M-26-146Q-54-138-49-100L-41-58L-51-19Q-7 4 53-20L40-58L46-104Q49-135 21-145Z', female ? C.green : C.blue) +
      path('M-20-140L-5-112L17-141L29-26L-17-16L-28-30Z', female ? C.red : C.ink) +
      path('M-12-140L-4-116L10-141L17-55L-13-53Z', female ? C.gold : C.cream) +
      (female ? path('M-17-54L21-56L25-20L-20-15ZM-27-47L-39-23L-30-17L-18-44Z', C.rose) : '') +
      line('M-43-26L-33-86M40-26L32-83M-7-50L-7-20M15-50L18-22', C.paleGold, 1.2) +
      path('M-35-133Q-68-119-52-90L-15-67L-1-81L-30-104Z', female ? C.green : C.blue) +
      path('M32-135Q59-131 58-109L40-84L21-91L38-113Z', female ? C.green : C.blue) +
      hand(-9, -74, -78, .65) + hand(28, -94, -34, .65) +
      fan(time, -6, -76, female ? -48 : -25) +
      path('M-13-141L-12-159L13-159L13-142Z', C.skin) +
      (female ? `<ellipse cx="-3" cy="-192" rx="65" ry="18" fill="${C.gold}" stroke-width="2.2"/><ellipse cx="-3" cy="-194" rx="56" ry="12" fill="${C.cream}" stroke-width="1"/>` +
        line('M-54-190Q-38-132-21-119M46-190Q42-137 21-121', C.rose, 2) : '') +
      group('translate(0 -170)', face(time, { female, phase, hat: !female, tilt: female ? 6 : -5, singing: true })) +
      (female ? line('M-54-190Q-55-155-42-126M47-190Q60-150 41-122', C.ink, 2.2) : '')
    ) + '</g>');
}

export function quanHoScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const bob = n(wave(time, 2) * 3);
  const water = Array.from({ length: 7 }, (_, i) => line(`M${100 + n(wave(time, 2, i) * 12)} ${475 + i * 24}Q330 ${456 + i * 24} 640 ${475 + i * 24}T1180 ${475 + i * 24}`, '#8e9c88', 1, 'opacity=".4"')).join('');
  return scene(time,
    `<defs>${brocade('qh-boat', C.paleGold, 29)}</defs>` +
    cloud(373, 168, .8, time, 1.5) +
    path('M120 420Q261 287 401 420M879 420Q1019 292 1160 420', '#d4d0b3', 'stroke="none" opacity=".45"') +
    line('M97 421Q640 399 1181 421', '#acac8e', 1.1) + water +
    lotus(time, 178, 626, .93) + lotus(time, 1119, 627, 1.07, 2) +
    group(`translate(0 ${bob}) rotate(${n(wave(time, 1) * .45)} 640 576)`,
      singer(time, 372, 546, false, .91, 1.8) + singer(time, 922, 548, true, .88, 3.1) +
      singer(time, 518, 560, true, 1.47, 1) + singer(time, 764, 557, false, 1.4, 2.4) +
      path('M239 536Q455 591 1035 532Q1000 580 937 601Q619 643 331 602Q267 583 239 536Z', C.red, stroke) +
      path('M273 552Q590 603 1008 548L977 573Q595 634 303 575Z', C.green, stroke) +
      path('M273 552Q590 603 1008 548L977 573Q595 634 303 575Z', 'url(#qh-boat)', 'stroke="none"') +
      line('M251 542Q586 606 1023 538M332 594Q620 629 933 594', C.paleGold, 2) +
      path('M237 537Q217 525 226 510Q245 503 247 516Q238 516 240 523L266 541M1011 537Q1045 519 1048 496Q1068 496 1061 520Q1049 541 1024 549', C.gold, stroke)) +
    line(`M311 ${637 + bob}Q635 ${653 + bob} 973 ${637 + bob}`, '#adad8b', 1.5, 'opacity=".55"'), { sunX: 934, sunY: 156 });
}
