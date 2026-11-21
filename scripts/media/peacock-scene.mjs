import { C, n, wave, stroke, line, path, group, eye, leaf, petalFlower, butterfly, ground, scene } from './folk-art.mjs';

function feather(time, index) {
  const angle = -80 + index * 10 + wave(time, 2, index * .27) * 1.4;
  const length = 334 + Math.sin(index / 16 * Math.PI) * 47;
  const barbs = Array.from({ length: 13 }, (_, row) => {
    const y = -91 - row * 17, span = n(13 + row * 1.4);
    return line(`M0 ${y + 16}l-${span}-23M0 ${y + 16}l${span}-23`, C.paleGold, 1, 'opacity=".62"');
  }).join('');
  return group(`rotate(${n(angle)} 0 0)`,
    path(`M0 0C-13 -118 -43 -${n(length - 53)} -29 -${n(length + 10)}Q0 -${n(length + 50)} 29 -${n(length + 10)}C43 -${n(length - 53)} 13 -118 0 0Z`, index % 2 ? C.green : '#42694c', 'stroke="'+C.ink+'" stroke-width="2"') +
    line(`M0-5V-${n(length + 19)}`, C.paleGold, 1.4) + barbs +
    group(`translate(0 -${n(length - 4)})`,
      `<ellipse rx="24" ry="33" fill="${C.gold}" stroke="${C.ink}" stroke-width="1.5"/><ellipse rx="17" ry="25" fill="${C.red}" stroke="${C.ink}" stroke-width="1.2"/>` +
      path('M0-18Q18-6 11 12Q0 25-11 12Q-18-6 0-18Z', C.blue, 'stroke="'+C.cream+'" stroke-width="1.3"') +
      `<ellipse cy="2" rx="6" ry="10" fill="${C.ink}"/><ellipse cx="3" cy="-3" rx="2.5" ry="4" fill="${C.cream}"/>`));
}

function peacock(time) {
  const steps = wave(time, 3) * 2;
  const wings = [-1, 1].map((side) => group(`translate(${side * 33} -97) rotate(${n(side * (19 + wave(time, 2) * 3))}) scale(${side} 1)`,
    path('M0-57Q84-77 95-10Q94 31 22 45Q-1 4 0-57Z', C.green) +
    path('M11-44Q68-60 78-14Q62 9 22 19Z', C.red, 'stroke-width="2"') +
    Array.from({ length: 6 }, (_, i) => path(`M${20 + i * 8} ${-31 + i * 1.2}q15 23 2 50q-14-14-2-50Z`, i % 2 ? C.cream : C.gold, 'stroke-width="1.4"')).join(''))).join('');
  const crest = Array.from({ length: 5 }, (_, i) => {
    const endX = 32 + i * 10, endY = -363 - Math.sin(i / 4 * Math.PI) * 18;
    return line(`M52-327Q${42 + i * 7}-353 ${endX} ${n(endY)}`, C.ink, 1.7) +
      `<ellipse cx="${endX}" cy="${n(endY - 4)}" rx="5" ry="9" fill="${i % 2 ? C.red : C.gold}" stroke="${C.ink}" stroke-width="1.2"/>`;
  }).join('');
  return `<g ${stroke}>` +
    line(`M-21-16L${n(-28 + steps)} 19L-56 28M${n(-28 + steps)} 19L-21 32M${n(-28 + steps)} 19L-5 28M28-16L${n(37 - steps)} 20L64 28M${n(37 - steps)} 20L33 33M${n(37 - steps)} 20L17 29`, C.gold, 4) +
    path('M-30-156Q-82-128-67-74Q-64-25-18-12Q31 12 69-48Q90-97 38-148Z', C.blue) + wings +
    path('M-24-160Q-11-225 17-260L22-300Q29-330 54-325Q79-326 87-304Q90-283 66-271Q44-264 46-229Q44-182 34-148Q9-119-24-160Z', C.blue) +
    path('M36-273Q22-224 7-182Q-4-152 8-138L26-143Q21-163 32-188L44-233Q46-260 57-270Z', C.cream, 'stroke-width="1.7"') +
    group(`rotate(${n(wave(time, 2) * 2)} 47 -282)`,
      path('M27-301Q23-327 50-333Q80-339 89-311Q101-286 76-275Q47-267 27-301Z', C.blue) +
      path('M31-310L11-300L32-293Z', C.gold, 'stroke-width="2"') +
      eye(47, -308, time, 1.1, 4.5) +
      line('M63-319Q77-315 79-303M35-294L49-286', C.cream, 1.5) + crest) +
    Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => line(`M${-25 + col * 12} ${-140 + row * 14}q6 8 12 0`, C.paleGold, 1, 'opacity=".7"')).join('')).join('') + '</g>';
}

function peonies(time, x, y, size = 1, phase = 0) {
  return group(`translate(${x} ${y}) scale(${size}) rotate(${n(wave(time, 2, phase) * 1.8)})`,
    line('M0 0Q-22-136 8-259M-8-122Q-70-174-82-236M-7-163Q43-193 52-231', C.green, 3) +
    leaf(-10, -64, -60, .6) + leaf(-14, -128, 55, .6, C.jade) + leaf(-40, -164, -50, .53) +
    petalFlower(8, -270, 1.12, C.red, time, phase) + petalFlower(8, -270, .7, C.rose, time, phase) +
    petalFlower(-81, -249, .67, C.gold, time, phase + 1) + petalFlower(52, -244, .56, C.red, time, phase + 2));
}

export function peacockScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) + peonies(time, 166, 605, .77) + peonies(time, 1121, 600, .82, 1.7) +
    `<ellipse cx="653" cy="627" rx="171" ry="11" fill="#8b926d" opacity=".14"/>` +
    group(`translate(646 ${n(587 + wave(time, 3) * 1.2)})`,
      Array.from({ length: 17 }, (_, i) => feather(time, i)).join('') + peacock(time)) +
    butterfly(time, 304, 188, C.red, 1.1), { sunX: 1002, sunY: 146 });
}
