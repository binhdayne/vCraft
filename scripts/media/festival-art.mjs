// Small drawing primitives shared by the new village festival illustrations.
// Character poses and choreography belong to each scene, not to this module.
import { C, n, wave, stroke, line, path, group, eye, petalFlower, leaf } from './folk-art.mjs';

export function brocade(id, color = C.paleGold, size = 24) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${group(`translate(${size / 2} ${size / 2})`,
    line('M0-6L5 0L0 6L-5 0ZM-8 0H-5M5 0H8M0-9V-6M0 6V9', color, .95, 'opacity=".7"'))}</pattern>`;
}

export function face(time, { female = false, phase = 0, hat = false, tilt = 0, singing = false } = {}) {
  const mouth = n(1.8 + Math.max(0, wave(time, 5, phase)) * 3.3);
  return group(`rotate(${n(tilt + wave(time, 2, phase) * 1.1)})`,
    path('M-22-8Q-26-34-2-39Q23-41 26-15L24 7Q16 29-2 28Q-23 24-22-8Z', C.skin) +
    path('M-22-6Q-34-16-32-2Q-31 7-22 8M25-7Q36-17 35-2Q34 7 25 8', C.skin) +
    (female
      ? path('M-23-7Q-33-35-10-40Q17-49 27-23L28-5L20-11Q17-27 4-28Q-10-15-23-7Z', C.ink) +
        path('M-14-37Q-20-55-1-58Q15-58 13-39Z', C.ink) + line('M-12-40Q1-45 13-40', C.red, 4)
      : path('M-23-12Q-29-39-7-40Q16-47 25-25L25-14Q13-25-2-27Q-10-18-23-12Z', C.ink)) +
    (hat ? path('M-29-28Q-34-50-12-54L20-52L31-29Q0-36-29-28Z', C.green) + line('M-27-31Q2-39 28-31', C.paleGold, 1.6) : '') +
    line('M-15-10Q-9-15-3-11M8-12Q15-17 20-12', C.ink, 1.5) +
    eye(-9, -5, time, phase, 2.8) + eye(14, -6, time, phase, 2.8) +
    line('M3-4L0 6L6 7', C.ink, 1.15) +
    (singing
      ? `<ellipse cx="5" cy="15" rx="6.3" ry="${mouth}" fill="${C.red}" stroke="${C.ink}" stroke-width="1.2"/>` + line('M0 12Q5 10 10 12', C.cream, .8)
      : path('M-5 15Q2 11 6 14Q10 11 16 13Q6 22-5 15Z', female ? C.red : C.rose, 'stroke-width="1"')) +
    `<ellipse cx="-14" cy="9" rx="5" ry="2.5" fill="${C.red}" opacity=".2" stroke="none"/><ellipse cx="18" cy="8" rx="4" ry="2.3" fill="${C.red}" opacity=".17" stroke="none"/>` +
    (female ? `<circle cx="-25" cy="9" r="3" fill="${C.gold}" stroke-width="1.1"/><circle cx="28" cy="9" r="3" fill="${C.gold}" stroke-width="1.1"/>` : ''), stroke);
}

export function hand(x, y, angle = 0, size = 1) {
  return group(`translate(${x} ${y}) rotate(${angle}) scale(${size})`,
    path('M-8 10Q-14 4-10-5L-8-13Q-6-18-3-14L-3-8L0-18Q4-21 5-16L5-9L9-16Q14-18 14-12L11-3Q18-7 19-2Q16 8 7 11Z', C.skin, 'stroke="'+C.ink+'" stroke-width="1.8"') +
    line('M-3-7L-4 1M5-8L3 1M11-3L7 3', C.ink, .8));
}

export function conicalHat(x, y, size = 1, angle = 0) {
  return group(`translate(${x} ${y}) rotate(${angle}) scale(${size})`,
    path('M-58 3L-2-40L60 3Q4 21-58 3Z', C.cream, stroke) +
    [-38, -19, 0, 20, 39].map(px => line(`M-2-34L${px} 9`, C.gold, .9)).join('') +
    line('M-55 3Q1 18 57 3', C.gold, 2));
}

// A standing onlooker; the hero scenes use their own articulated poses.
export function onlooker(time, { x, y, size = 1, female = false, color = C.green, phase = 0, clap = false } = {}) {
  const arm = n(3 + wave(time, clap ? 6 : 2, phase) * (clap ? 5 : 2));
  return group(`translate(${x} ${y}) scale(${size})`,
    `<g ${stroke}>` +
    path('M-27-42L-24-5L-39 1Q-43 9-23 8L-10 3L-6-40M6-42L10 4Q34 12 43 5L29-5L27-41Z', C.ink) +
    group(`rotate(${n(wave(time, 2, phase))} 0 -42)`,
      path('M-19-156L-20-134L18-133L18-156', C.skin) +
      path('M-22-139Q-47-135-45-102L-38-50L-45-27Q-3-10 42-28L35-53L43-103Q47-133 20-139Z', color) +
      path('M-20-135L2-112L20-135L12-51L-12-50Z', female ? C.gold : C.cream, 'stroke-width="1.7"') +
      line('M-18-134L0-111L-8-48M18-134L0-111M-31-34L-20-101M30-34L22-95', C.paleGold, 1.1) +
      path('M-38-64Q0-54 37-64L38-53Q0-42-38-53Z', C.red) +
      path(`M-38-127Q-62-112-49-88L${-13 + arm}-73L${-4 + arm}-88L-30-105Z`, color) +
      path(`M37-126Q60-109 45-88L${13 - arm}-73L${4 - arm}-88L28-104Z`, color) +
      hand(-8 + arm, -79, 66, .62) + hand(8 - arm, -80, -64, .62) +
      group('translate(0 -167)', face(time, { female, phase, hat: !female }))) + '</g>');
}

export function festivalPennant(time, x, y, color = C.red, phase = 0, size = 1) {
  return group(`translate(${x} ${y}) scale(${size} ${Math.abs(size)})`,
    line('M0 2V-245', C.ink, 3.2) +
    group(`rotate(${n(wave(time, 2, phase) * 3)} 0 -235)`,
      path('M2-238Q44-250 79-226Q118-201 151-220L139-190L150-160Q100-142 76-165Q42-190 2-178Z', color, stroke) +
      path('M8-229Q47-239 79-217Q111-196 139-207L130-189L137-173Q106-163 77-183Q43-206 8-191Z', C.gold, 'stroke-width="1.2"') +
      path('M16-218Q50-225 79-207Q103-189 125-197L119-184Q95-184 76-196Q49-216 16-207Z', C.green, 'stroke-width="1.1"')));
}

export function floweringBranch(time, x, y, mirror = false, phase = 0) {
  return group(`translate(${x} ${y}) scale(${mirror ? -.8 : .8} .8) rotate(${n(wave(time, 2, phase) * 1.5)})`,
    line('M0 0Q-27-130-5-236M-14-93Q-72-155-79-190M-11-158Q41-194 45-250', '#776848', 3) +
    leaf(-17, -97, -45, .45, C.jade) + leaf(-10, -151, 56, .48) + leaf(-50, -163, -48, .38) +
    petalFlower(-80, -209, .64, C.rose, time, phase) + petalFlower(45, -267, .7, C.cream, time, phase + 1));
}
