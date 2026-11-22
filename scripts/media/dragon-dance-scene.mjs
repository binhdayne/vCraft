import { C, n, wave, stroke, line, path, group, eye, ground, scene } from './folk-art.mjs';
import { face, hand, festivalPennant, brocade } from './festival-art.mjs';

function dragonHead(time) {
  const jaw = n(5 + wave(time, 4, .8) * 3);
  const whisker = n(wave(time, 4) * 6);
  return `<g ${stroke}>` +
    path('M9-44Q23-102 66-122L45-85L77-98L58-66L85-70L61-42L81-36L47-16Z', C.red) +
    path('M4-70Q-10-130-45-144L-33-107L-57-117L-42-82Z', C.gold) +
    path('M-54-74Q-60-124-91-139L-81-104L-110-111L-88-79Z', C.gold) +
    line('M-40-95L-43-119M-83-93L-93-112', C.cream, 1.6) +
    path('M-2-83Q36-70 48-29Q69-3 44 31L13 49L-71 37L-96 19L-112-11Q-99-59-65-65Q-41-96-2-83Z', C.green) +
    path('M-66-50Q-44-81-19-57L-15-32Q-42-13-65-31Z', C.red) +
    path('M-71-43Q-51-79-17-58L-10-48Q-40-61-66-33Z', C.gold) +
    eye(-43, -41, time, .7, 11) +
    `<circle cx="-43" cy="-41" r="4.5" fill="${C.red}" stroke="none"/><circle cx="-44" cy="-42" r="2.7" fill="${C.ink}" stroke="none"/>` +
    path('M-76-22Q-109-46-133-24Q-153-10-140 5L-116 21L-81 18L-61 1Z', C.gold) +
    path('M-131-22Q-147-19-143-6L-125-2L-122-14Z', C.red) +
    line('M-133-12L-126-10M-113-1Q-109-9-103-5', C.ink, 2.2) +
    path('M-117 20Q-67 0-24 25L-16 42Q-53 67-99 43Z', C.ink) +
    [-100, -80, -60, -40].map(x => path(`M${x} 19l8 13l8-11Z`, C.cream, 'stroke-width="1.3"')).join('') +
    group(`rotate(${jaw} 4 30)`,
      path('M-112 37Q-65 55-9 26L12 40Q-45 93-102 64L-123 52Z', C.gold) +
      path('M-99 40L-90 31L-81 46M-68 46L-60 34L-52 45M-39 42L-32 31L-25 38', C.cream, 'stroke-width="1.4"') +
      path(`M-74 63Q-95 89-65 ${111 + whisker}Q-71 82-47 71Q-41 101-10 ${105 - whisker}Q-29 91-15 64Z`, C.red) +
      line(`M-58 72Q-75 91-65 ${102 + whisker}M-32 70Q-36 92-15 ${99 - whisker}`, C.paleGold, 1.4)) +
    group('translate(17 -33)',
      path('M0 0Q-12-35 17-54L21-36L41-38L30-18L41-2L16 8Z', C.gold) +
      line('M7-4L19-32M11-4L31-17', C.red, 1.8)) +
    line(`M-114-3C-153-30-178 ${-16 - whisker}-157 ${-51 - whisker}M-110 8C-147 31-177 ${25 + whisker}-157 ${57 + whisker}`, C.ink, 2) +
    line(`M-7-74Q16-97 39-75M-6-64Q20-89 39-66M8 13Q31 4 41 17M9 22Q28 13 34 26`, C.paleGold, 1.4) + '</g>';
}

function bearer(time, x, phase, color, main = false) {
  const step = wave(time, 4, phase) * 3;
  return group(`translate(${x} 629)`, `<g ${stroke}>` +
    path(`M-22-54L${n(-30 + step)}-8L${n(-46 + step)} 1Q-50 9-30 7L-13-1L-2-49Z`, C.ink) +
    path(`M8-53L${n(23 - step)}-8L${n(42 - step)} 1Q47 10 27 8L11-1L-12-48Z`, C.ink) +
    group(`rotate(${n(wave(time, 4, phase) * 1.2)} 0 -52)`,
      path('M-23-146Q-48-135-43-106L-33-59Q0-40 36-60L39-106Q42-135 20-145Z', color) +
      path('M-23-146Q-48-135-43-106L-33-59Q0-40 36-60L39-106Q42-135 20-145Z', 'url(#dragon-tunic)', 'stroke="none"') +
      path('M-14-144L1-123L16-144L10-113L-8-111Z', C.cream) +
      path('M-36-72Q0-59 37-75L39-62Q1-45-37-58Z', C.red) +
      path('M-32-135Q-59-134-49-110L-13-93L23-129L12-140L-16-116Z', color) +
      path('M29-133Q50-134 47-157L37-191L23-184L29-159L17-149Z', color) +
      hand(26, -136, 35, .75) + hand(29, -191, 25, .75) +
      path('M-12-145V-160H12V-145Z', C.skin) +
      group('translate(-4 -174)', face(time, { phase, tilt: main ? -8 : 7 })) +
      path('M-29-195Q-2-211 23-197L21-187Q-2-199-29-185Z', C.red) +
      line('M-30-191L-50-180M-28-191L-43-168', C.red, 4)) + '</g>');
}

function lantern(time, x, y, phase) {
  return group(`translate(${x} ${y}) rotate(${n(wave(time, 2, phase) * 3)})`,
    line('M0-98V-32', '#9f8453', 1.3) +
    path('M-25-29Q-52-5-25 28Q0 41 25 28Q51 1 25-29Z', C.red, stroke) +
    line('M-20-27Q-37 0-20 27M0-28V31M20-27Q37 0 20 27', C.gold, 1.4) +
    path('M-25-33H25V-26H-25ZM-24 27H24V34H-24Z', C.gold, stroke) +
    line('M0 35V61', C.ink, 1.5) + path('M0 57Q-10 68-7 83L0 77L8 83Q9 68 0 57Z', C.red, 'stroke="'+C.ink+'" stroke-width="1.2"'));
}

function drummer(time) {
  return group('translate(1102 584)', `<g ${stroke}>` +
    path('M-19-27L-22 20L-36 27L-12 30L-1-24M8-27L12 23L35 28L38 22L27 16L27-28Z', C.ink) +
    path('M-20-117Q-41-111-38-86L-28-26Q0-13 30-28L36-88Q39-110 20-117Z', C.blue) +
    path('M-11-116L0-97L12-115L9-61L-8-59Z', C.cream) +
    path('M-29-45Q0-34 31-47L33-34Q0-19-32-32Z', C.red) +
    path('M-28-108Q-51-115-54-100L-49-87L-36-88L-33-97L-20-94Z', C.blue) +
    path('M27-109Q51-116 54-100L49-87L35-88L33-97L20-94Z', C.blue) +
    hand(-43, -91, -44 + wave(time, 8) * 10, .55) + hand(43, -91, 44 + wave(time, 8, Math.PI) * 10, .55) +
    path('M-10-117V-130H10V-117Z', C.skin) +
    group('translate(0 -148) scale(.8)', face(time, { phase: 3.4, hat: true })) + '</g>');
}

export function dragonDanceScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  const at = u => ({ x: 356 + u * 731, y: 289 + Math.sin(u * Math.PI * 4 + time / 12 * Math.PI * 4) * 44 });
  const points = Array.from({ length: 92 }, (_, i) => at(i / 91));
  const spine = 'M' + points.map(p => `${n(p.x)} ${n(p.y)}`).join('L');
  const plates = points.filter((_, i) => i % 2 === 0).map((p, i) => {
    const u = i * 2 / 91, derivative = Math.cos(u * Math.PI * 4 + time / 12 * Math.PI * 4) * 44 * Math.PI * 4 / 731;
    const angle = Math.atan(derivative) * 180 / Math.PI;
    return group(`translate(${n(p.x)} ${n(p.y)}) rotate(${n(angle)})`,
      path('M-8-22Q-12-41-4-48Q3-36 10-35L6-20Z', C.red, 'stroke="'+C.ink+'" stroke-width="1.4"') +
      line('M-8-14Q0 2 8-14M-8 0Q0 16 8 0M-8 13Q0 29 8 13', C.ink, 1.1) +
      line('M-5 17H8', C.cream, 1.2));
  }).join('');
  const bearers = [.03, .28, .53, .78].map((u, i) => {
    const p = at(u);
    return line(`M${n(p.x)} ${n(p.y + 4)}L${n(p.x)} 495`, C.ink, 3.8) +
      line(`M${n(p.x + 1)} ${n(p.y + 4)}V495`, C.gold, 1.3) +
      bearer(time, p.x - 28, i * .7, [C.red, C.green, C.blue, C.green][i], i === 0);
  }).join('');
  const p0 = at(0), end = at(1);
  return scene(time, `<defs>${brocade('dragon-tunic', C.paleGold, 22)}</defs>` + ground(time) +
    lantern(time, 157, 169, .4) + lantern(time, 1113, 149, 2) +
    festivalPennant(time, 149, 572, C.green, 1.4, .61) + festivalPennant(time, 1162, 564, C.red, 2.5, -.6) +
    bearers + drummer(time) +
    group(`translate(${n(end.x)} ${n(end.y)}) rotate(${n(10 + wave(time, 4) * 12)})`,
      path('M-3-18Q47-28 69-70Q75-25 58-8L96-22Q81 7 53 16L73 33Q32 37-3 18Z', C.red, stroke) +
      path('M0-8Q42-13 61-40Q60-12 44-2L70-5Q47 10 0 10Z', C.gold, 'stroke-width="1.5"')) +
    line(spine, C.ink, 49) + line(spine, C.gold, 42) + line(spine, C.green, 29) +
    plates +
    group(`translate(${n(p0.x - 13)} ${n(p0.y)}) rotate(${n(wave(time, 2) * 5)})`, dragonHead(time)) +
    group(`translate(${n(179 + wave(time, 2) * 8)} ${n(387 + wave(time, 4) * 7)})`,
      line('M0 17V200', C.ink, 3.2) +
      `<circle r="23" fill="${C.gold}" stroke="${C.ink}" stroke-width="2.5"/>` +
      line('M-14-11Q11-22 16 1Q11 20-7 13Q-21 8-13-4Q-5-10 4-2', C.red, 2.3)) +
    group(`translate(1102 ${n(584 + wave(time, 4) * 2)})`,
      path('M-39-63Q0-79 39-63L35-8Q-1 10-35-8Z', C.red, stroke) +
      `<ellipse cy="-63" rx="39" ry="12" fill="${C.cream}" stroke="${C.ink}" stroke-width="2.3"/>` +
      line('M-26-57L-21-12M-10-52L-9-9M10-52L9-9M26-57L21-12M-34-9L-47 24M34-9L47 24', C.gold, 2) +
      group(`rotate(${n(wave(time, 8) * 12)} -43 -90)`, line('M-43-90L-8-61', C.ink, 4) + `<circle cx="-8" cy="-61" r="5" fill="${C.red}"/>`) +
      group(`rotate(${n(wave(time, 8, Math.PI) * 12)} 42 -90)`, line('M42-90L8-61', C.ink, 4) + `<circle cx="8" cy="-61" r="5" fill="${C.red}"/>`)), { sunX: 686, sunY: 156 });
}
