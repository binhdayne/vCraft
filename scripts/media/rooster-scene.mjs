import { C, n, wave, stroke, line, path, group, eye, leaf, petalFlower, butterfly, grasses, ground, scene } from './folk-art.mjs';

function tail(time) {
  const feathers = [
    ['M-67-98C-156-170-144-325-240-295C-301-271-267-213-251-202C-276-263-229-284-209-246C-172-172-152-84-67-98Z', C.green],
    ['M-58-106C-168-205-187-348-268-318C-305-306-305-271-290-251C-293-295-254-309-234-272C-191-189-165-94-58-106Z', C.cream],
    ['M-70-102C-158-184-204-288-269-246C-301-227-286-193-263-189C-282-219-251-246-228-216C-186-159-146-80-70-102Z', C.red],
    ['M-64-97C-132-141-176-241-242-196C-267-180-253-153-232-154C-246-176-217-197-197-177C-155-134-126-69-64-97Z', C.gold],
    ['M-72-89C-148-111-161-188-225-157C-247-147-239-117-222-115C-230-140-206-146-187-129C-143-91-118-65-72-89Z', C.cream],
    ['M-66-80C-154-86-191-132-237-108C-264-93-246-68-223-70C-241-80-223-99-202-90C-151-66-115-56-66-80Z', C.green],
    ['M-47-65C-147-51-188-67-223-51Q-246-39-254-53C-254-15-180-20-145-24Q-79-25-47-65Z', C.red],
  ];
  return group(`rotate(${n(wave(time, 2) * 4)} -65 -88)`,
    feathers.map(([d, color]) => path(d, color)).join('') +
    line('M-75-107Q-177-226-245-280M-78-94Q-176-174-245-221M-84-76Q-165-79-221-90M-79-61Q-167-33-222-40', C.ink, 1.5));
}

export function rooster(time, { x = 687, y = 576, size = 1.2 } = {}) {
  const breath = wave(time, 3) * 1.7;
  const crow = Math.max(0, wave(time, 2, -.8)) ** 5;
  const headAngle = n(-crow * 9 + wave(time, 1) * 1.2);
  const neckMarks = Array.from({ length: 9 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
    const px = 30 + col * 13 - row * .7, py = -239 + row * 15;
    return line(`M${n(px)} ${py}q-4 8 1 11`, C.ink, 1.4);
  }).join('')).join('');
  const wingMarks = Array.from({ length: 11 }, (_, i) => line(`M${-103 + i * 10} ${-97 + i * 1.4}q17 9 5 42`, C.cream, 1.6)).join('');
  const legs = [-22, 40].map((x, i) => {
    const step = wave(time, 4, i * Math.PI) * 3;
    return line(`M${x}-37L${n(x + step)}-4L${x + 25} 1M${n(x + step)}-4L${x - 13} 5M${n(x + step)}-4L${x + 12} 8`, C.ink, 3.5);
  }).join('');
  return group(`translate(${x} ${y}) scale(${size})`, legs + group(`translate(0 ${n(breath)})`,
    tail(time) +
    path('M-126-121C-152-62-104-23-25-29C39-23 103-57 106-121L84-207L40-230L-12-165Z', C.green) +
    path('M42-246Q11-201 4-165Q-15-127-55-114Q-14-95 25-114Q72-114 91-146L86-230Z', C.cream) + neckMarks +
    path('M-114-121Q-63-149-7-115Q30-85-12-46Q-53-29-118-62Z', C.red) +
    group(`rotate(${n(wave(time, 3, .6) * 2.5)} -95 -101)`,
      path('M-121-106Q-76-132-20-101Q-5-69-34-41Q-81-33-126-65Z', C.green) + wingMarks +
      path('M-118-92Q-78-114-29-91L-37-76Q-83-89-122-75Z', C.gold) +
      line('M-113-88Q-75-103-40-89M-108-72Q-67-84-43-68', C.ink, 1.5)) +
    path('M-111-54Q-67-44-12-49L-24-31Q-74-21-111-40Z', C.gold) +
    group(`rotate(${headAngle} 51 -210)`,
      path('M24-207C15-252 18-293 47-305Q75-321 94-295L97-251L78-213Z', C.cream) +
      path('M28-298Q12-311 26-321Q28-343 43-333Q56-357 69-333Q91-342 94-319L97-305Q67-319 28-298Z', C.red) +
      path('M88-264Q116-252 108-231Q91-212 79-234L78-258Z', C.red) +
      path('M98-280L127-274L99-267Z', C.gold) +
      group(`rotate(${n(crow * 22)} 97 -267)`, path('M98-267L121-271L102-257Z', C.gold)) +
      eye(77, -283, time, .7, 4) +
      line('M56-269Q49-246 57-225M66-266L66-237M74-267L74-246M38-279Q26-266 30-248', C.ink, 1.6) +
      `<circle cx="66" cy="-269" r="3" fill="${C.red}" stroke="none"/>`) +
    `<path d="M-113-127Q-71-145-17-121" fill="none" stroke="${C.cream}" stroke-width="1.2"/>`, stroke), stroke);
}

function branch(time, mirror = false) {
  return group(`translate(${mirror ? 1075 : 224} 578) scale(${mirror ? -.87 : .87} .87) rotate(${n(wave(time, 2, mirror ? 1 : 0) * 2)})`,
    line('M0 0Q-16-125-11-230M-8-117Q-54-171-64-208M-11-176Q34-217 40-267', '#796c3e', 3) +
    leaf(-9, -93, -54, .52, C.jade) + leaf(-11, -161, 54, .55, C.green) + leaf(-42, -170, -45, .4, C.green) +
    petalFlower(-64, -228, .85, C.cream, time) + petalFlower(42, -276, .62, C.rose, time, 1.5));
}

export function roosterScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) + branch(time) + branch(time, true) +
    `<ellipse cx="632" cy="584" rx="225" ry="14" fill="#bba16d" opacity=".13"/>` + rooster(time) +
    grasses(time, 357, 594, .5) + grasses(time, 999, 593, .4, 2) + butterfly(time, 369, 220, C.red), { sunX: 826, sunY: 204 });
}
