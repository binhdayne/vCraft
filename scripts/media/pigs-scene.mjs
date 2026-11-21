import { C, n, wave, stroke, line, path, group, eye, grasses, ground, scene } from './folk-art.mjs';

function whorl(x, y, r = 32, colors = [C.red, C.green]) {
  return group(`translate(${x} ${y}) scale(${r / 32})`,
    `<circle r="32" fill="${colors[0]}"/>` +
    path('M0-32A32 32 0 0 1 0 32A16 16 0 0 1 0 0A16 16 0 0 0 0-32Z', colors[1]) +
    `<circle r="32" fill="none" stroke="${C.ink}" stroke-width="2.5"/>` +
    line('M0-26C22-26 22-2 0-2C-21-2-22 25 0 26', C.cream, 1.2));
}

function pig(time, { x, y, size = 1, color = C.grey, phase = 0, adult = false, flipped = false }) {
  const step = wave(time, 6, phase), bob = Math.cos(time / 12 * Math.PI * 24 + phase) * 1.2;
  const tailAngle = n(wave(time, 4, phase) * 10);
  const legs = [-104, 77].map((x, index) => {
    const offset = n(step * (index ? -5 : 5));
    return group(`translate(${offset} 0)`, path(`M${x - 12}-44L${x - 15}-4L${x + 14}-4L${x + 11}-41Z`, color) +
      path(`M${x - 15}-12L${x - 15}-2L${x + 15}-2L${x + 11}-12Z`, C.ink) + line(`M${x}-10V-2`, C.cream, 1));
  }).join('');
  const body = path('M-145-64C-177-104-155-186-83-198C-37-222 17-193 72-196C126-210 168-167 170-115Q188-58 125-39Q44-16-63-29Q-129-31-145-64Z', color) +
    path('M-132-160Q-81-208-28-190Q24-166 77-188Q116-199 139-169Q117-199 73-202Q23-189-27-207Q-88-225-132-160Z', C.red) +
    line('M-133-155Q-151-115-130-79M-125-150Q-140-117-124-95', C.ink, 1.7) +
    group(`rotate(${n(wave(time, 3, phase) * 3)} 104 -121)`,
      path('M100-173Q111-201 134-182Q167-185 181-158L195-116Q232-103 230-83Q227-58 190-59Q161-37 133-55Q110-58 104-86Z', color) +
      group(`rotate(${n(wave(time, 4, phase) * 5)} 124 -164)`,
        path('M120-164Q95-189 102-215Q140-205 150-177Q143-160 120-164Z', C.red) +
        line('M120-174L108-201M127-176L118-198M134-178L128-193', C.ink, 1.4)) +
      path('M180-99Q219-115 232-93Q244-67 208-66L189-71Z', C.red) +
      `<ellipse cx="210" cy="-90" rx="4" ry="5" fill="${C.ink}" stroke="none"/><ellipse cx="225" cy="-86" rx="3" ry="4" fill="${C.ink}" stroke="none"/>` +
      eye(166, -137, time, phase, 4) +
      line('M148-151Q159-161 172-151M184-118L200-114M181-110L199-106M179-77Q188-65 208-69M138-103q-9 4 0 10', C.ink, 2)) +
    whorl(-77, -132, adult ? 39 : 32, adult ? [C.red, C.green] : [C.cream, C.green]) +
    whorl(42, -118, adult ? 37 : 29, adult ? [C.green, C.red] : [C.cream, C.red]) +
    (adult ? Array.from({ length: 7 }, (_, i) => `<circle cx="${-32 + i * 15}" cy="-30" r="3" fill="${C.red}" stroke-width="1"/>`).join('') : '') +
    `<path d="M-126-70Q-108-53-83-58M10-59Q41-47 62-61" fill="none" stroke="${C.ink}" stroke-width="1.3"/>`;
  return group(`translate(${n(x + wave(time, 1, phase) * (adult ? 4 : 9))} ${n(y + bob)}) scale(${flipped ? -size : size} ${size})`,
    group(`rotate(${tailAngle} -147 -90)`, line('M-145-88C-197-103-195-54-168-66C-149-75-171-95-180-78', C.ink, 4)) + legs + body +
    `<path d="M-147-63Q-140-26-124-7M89-42L90-8" fill="none" stroke="${C.ink}" stroke-width="2"/>`, stroke);
}

function taro(time, x, y, size = 1, phase = 0) {
  return group(`translate(${x} ${y}) rotate(${n(wave(time, 2, phase) * 3)}) scale(${size})`,
    line('M0 0Q-21-51-3-95M0 0Q18-44 40-67M0 0Q-48-33-57-58', C.green, 3) +
    path('M-3-86C-70-79-62-144-3-153C41-143 50-102 21-85Q10-102-3-86Z', C.green, `stroke="${C.ink}" stroke-width="2"`) +
    line('M-3-89L-3-143M-3-117L-39-114M-3-117L26-111', C.paleGold, 1.3) +
    path('M40-61Q4-79 23-102Q50-117 65-90Q78-65 40-61M-57-53Q-100-58-91-84Q-72-107-53-86Q-34-67-57-53Z', C.jade, `stroke="${C.ink}" stroke-width="2"`) +
    line('M40-63L49-95M-57-56L-77-81', C.cream, 1.2));
}

export function pigsScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) +
    taro(time, 1100, 486, .9, 1) + taro(time, 156, 435, .9) +
    pig(time, { x: 569, y: 437, size: 1.45, adult: true }) +
    group('translate(975 438)', path('M-66-2L-48 53Q0 72 48 53L66-2Z', C.red, stroke) +
      `<ellipse rx="67" ry="18" fill="${C.green}" ${stroke}/>` +
      line('M-45 16Q0 35 45 16M-33 43Q0 52 33 43', C.paleGold, 2)) +
    pig(time, { x: 300, y: 576, size: .53, color: C.gold, phase: 1 }) +
    pig(time, { x: 530, y: 535, size: .48, color: C.green, phase: 2.4 }) +
    pig(time, { x: 720, y: 599, size: .53, color: C.red, phase: 4, flipped: true }) +
    pig(time, { x: 943, y: 565, size: .5, color: C.cream, phase: 3.2, flipped: true }) +
    pig(time, { x: 446, y: 633, size: .47, color: C.rose, phase: 4.7 }) +
    grasses(time, 130, 588, .65) + grasses(time, 1120, 589, .6, 1.5) + taro(time, 619, 647, .49), { sunX: 1010, sunY: 170 });
}
