import { C, n, wave, stroke, line, path, group, eye, cloud, lotus, grasses, scene } from './folk-art.mjs';

export function carp(time, { x, y, size = 1, angle = -24, phase = 0, small = false, flipped = false, key = 'main' }) {
  const body = 'M-147-18C-119-82-47-99 61-57Q135-39 158-3Q110 56 33 78Q-66 109-127 54Z';
  const finRays = Array.from({ length: 11 }, (_, i) => line(`M${-40 + i * 11} ${-64 + Math.abs(4 - i) * 2}Q${-35 + i * 10} ${-109 + Math.abs(5 - i) * 3} ${-36 + i * 11} ${-130 + Math.abs(5 - i) * 5}`, C.ink, 1.4)).join('');
  const tailRays = Array.from({ length: 10 }, (_, i) => line(`M164 0Q${199 + i * 3} ${-24 + i * 5} ${229 + Math.abs(4 - i) * 10} ${-63 + i * 14}`, C.ink, 1.25)).join('');
  return group(`translate(${n(x + wave(time, 1, phase) * (small ? 17 : 9))} ${n(y + wave(time, 2, phase) * (small ? 5 : 4))}) rotate(${n(angle + wave(time, 2, phase) * 2)}) scale(${flipped ? -size : size} ${size})`,
    `<defs><pattern id="carp-scales-${key}" width="27" height="27" patternUnits="userSpaceOnUse">${line('M0 0Q13.5 23 27 0M-13.5 13.5Q0 36.5 13.5 13.5M13.5 13.5Q27 36.5 40.5 13.5', C.ink, 1.2)}</pattern><clipPath id="carp-body-${key}"><path d="${body}"/></clipPath></defs>` +
    group(`rotate(${n(wave(time, 4, phase) * 8)} 158 -3)`,
      `<clipPath id="carp-tail-${key}"><path d="M143-18Q201-42 269-83Q270-36 226-3Q280 28 262 81Q197 46 143 17Z"/></clipPath>` +
      path('M143-18Q201-42 269-83Q270-36 226-3Q280 28 262 81Q197 46 143 17Z', C.gold) +
      path('M154-9Q218-42 262-73Q241-28 214-2Q246 33 256 71Q205 40 155 11Z', C.cream, 'stroke-width="1.5"') +
      `<g clip-path="url(#carp-tail-${key})">${tailRays}</g>`) +
    group(`rotate(${n(wave(time, 3) * 2)} -7 -62)`,
      path('M-61-62Q-46-93-74-133Q-11-121 15-141Q59-130 89-102L76-43Z', C.gold) + finRays) +
    path(body, C.cream) +
    `<g clip-path="url(#carp-body-${key})">` +
      path('M-144-30Q-18-125 158-9Q59-31-1 28Q-50 64-128 27Z', small ? C.jade : C.blue, 'stroke="none"') +
      path('M-90-72Q9-99 120-28Q18-52-30 4Q-83 39-119 20Z', C.green, 'stroke="none"') +
      `<rect x="-160" y="-100" width="330" height="210" fill="url(#carp-scales-${key})"/>` +
      path('M-141 36Q-11 86 123 23Q47 109-54 109Z', C.gold, 'stroke="none" opacity=".35"') + '</g>' +
    `<path d="${body}" fill="none" stroke="${C.ink}" stroke-width="3.2"/>` +
    group(`rotate(${n(wave(time, 3, phase) * 5)} -50 40)`,
      path('M-58 35Q-18 57-20 109Q-52 95-81 67Z', C.gold) +
      line('M-60 41Q-40 75-29 97M-67 48Q-56 78-39 94M-73 56L-49 87', C.ink, 1.2)) +
    group(`rotate(${n(wave(time, 3, 1 + phase) * 4)} 57 57)`,
      path('M41 62Q57 100 115 92L106 50Z', C.gold) +
      line('M53 66L106 85M61 61L109 75M71 60L106 65', C.ink, 1.3)) +
    path('M-147-18Q-158 4-142 33Q-128 65-91 53Q-79 30-83-7Q-105-46-147-18Z', C.grey) +
    path('M-154-2Q-174-9-172 6Q-167 21-149 15L-143 9Z', C.gold, 'stroke-width="2"') +
    line('M-104-26Q-75-1-95 41M-111-22Q-86-1-103 34M-160 13Q-179 24-165 37Q-152 46-139 36M-159-1Q-181-19-190-3', C.ink, 2) +
    eye(-127, -5, time, phase + 1.1, 6) +
    line('M-149 22Q-126 46-110 31', C.cream, 1.2), stroke);
}

function moon(time) {
  const width = 91 + wave(time, 2) * 3;
  return `<circle cx="951" cy="145" r="95" fill="#d6bd82" opacity=".13"/>` +
    `<circle cx="951" cy="145" r="64" fill="${C.cream}" stroke="#ac996e" stroke-width="1.5"/>` +
    `<circle cx="942" cy="136" r="52" fill="none" stroke="#ceb880" stroke-width=".8" opacity=".5"/>` +
    Array.from({ length: 6 }, (_, i) => {
      const span = n(width - i * 10 + wave(time, 2, i) * 7);
      return line(`M${951 - span} ${507 + i * 16}q${span} ${7 - i} ${span * 2} 0`, '#c0a867', 2 - i * .2, 'opacity=".55"');
    }).join('');
}

export function carpScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const water = Array.from({ length: 8 }, (_, i) => {
    const offset = n(wave(time, 2, i * .4) * 10);
    return line(`M${93 + offset} ${407 + i * 29}Q333 ${388 + i * 29} 580 ${407 + i * 29}T${1184 - offset} ${407 + i * 29}`, '#899783', 1, 'opacity=".45"');
  }).join('');
  return scene(time, moon(time) + cloud(352, 165, .8, time) + cloud(1083, 309, .53, time, 1.8) + water +
    lotus(time, 221, 605, 1.05) +
    group('translate(1079 611)', grasses(time, 0, 0, 1.2, 2) + grasses(time, 52, -25, .75, 3)) +
    carp(time, { x: 579, y: 390, size: 1.22 }) +
    carp(time, { x: 441, y: 593, size: .31, angle: -8, phase: 1.5, small: true, key: 'little-left' }) +
    carp(time, { x: 806, y: 577, size: .26, angle: 5, phase: 3.4, small: true, flipped: true, key: 'little-right' }) +
    [0, 1, 2].map((i) => `<circle cx="${n(361 + wave(time, 1, i) * 7)}" cy="${n(405 - i * 20 + wave(time, 2, i) * 5)}" r="${3 + i}" fill="none" stroke="#9c9c7e" stroke-width="1" opacity=".5"/>`).join(''), { sky: false });
}
