import { C, n, wave, stroke, line, path, group, eye, leaf, petalFlower, lotus, butterfly, ground, scene } from './folk-art.mjs';
import { rooster } from './rooster-scene.mjs';

function child(time, variant) {
  const duck = variant === 'duck';
  const bib = duck ? C.cream : C.red;
  const hair = Array.from({ length: 17 }, (_, i) => {
    const a = -Math.PI + .3 + i * .158;
    const x = n(Math.cos(a) * 36), y = n(-229 + Math.sin(a) * 17);
    return line(`M${x} ${y}L${n(x * .72)} ${n(y + 16)}`, C.ink, 1.2);
  }).join('');
  const tunic = Array.from({ length: 5 }, (_, row) => Array.from({ length: 5 }, (_, col) => {
    const x = -42 + col * 21 + (row % 2) * 4, y = -31 + row * 23;
    return group(`translate(${x} ${y})`, line('M0-5L4 0L0 5L-4 0ZM-7 0H-4M4 0H7', duck ? C.red : C.paleGold, 1.2));
  }).join('')).join('');
  const head = group(`rotate(${n(wave(time, 2) * 1.5)} 0 -174)`,
    path('M-58-177Q-90-211-62-241Q-35-279 15-266Q66-259 67-209Q68-153 37-131Q10-110-25-131Q-57-145-58-177Z', C.skin) +
    path('M-59-192Q-81-211-82-182Q-81-161-60-162M65-190Q85-209 84-182Q83-164 66-163', C.skin) +
    line('M-68-191Q-78-184-69-173M72-190Q80-185 71-176', C.ink, 1.3) + hair +
    path('M-58-222Q-62-248-39-258L-35-242Q-49-236-58-222M45-249Q63-237 65-213L56-216Q57-234 45-249Z', C.ink, 'stroke="none"') +
    line('M-42-197Q-27-207-14-199M16-201Q30-212 45-201', C.ink, 2.6) +
    eye(-28, -186, time, 1, 5) + eye(28, -187, time, 1, 5) +
    line('M3-187Q-4-171 4-165L12-166', C.ink, 1.8) +
    path('M-10-149Q0-154 5-149Q12-154 24-150Q12-133-1-140Z', C.rose, 'stroke-width="1.6"') +
    line('M-8-148Q7-145 20-148', C.cream, 2) +
    `<ellipse cx="-38" cy="-166" rx="12" ry="6" fill="${C.red}" opacity=".13" stroke="none"/><ellipse cx="39" cy="-166" rx="12" ry="6" fill="${C.red}" opacity=".13" stroke="none"/>`);
  return `<g ${stroke}>` +
    path('M-68-112Q-110-101-106-49L-92 44Q-118 85-89 138Q-5 173 91 137Q119 84 91 22L104-65Q107-100 67-111Z', C.skin) +
    path('M-27-147L-26-106Q0-86 29-108L28-145Z', C.skin) +
    path('M-57-99Q-5-71 56-99L71 76Q34 110-65 92Z', bib) +
    tunic +
    path('M-65-113Q-36-89 0-96Q36-88 65-113L70-87Q33-63 2-75Q-34-62-69-85Z', C.green) +
    line('M-61-100Q-31-82-8-88M12-88Q37-82 61-101', C.cream, 1.6) +
    `<circle cx="-6" cy="-85" r="6" fill="${C.gold}" stroke-width="1.7"/><circle cx="10" cy="-85" r="6" fill="${C.gold}" stroke-width="1.7"/>` +
    path('M-73 87Q-126 91-130 139Q-135 166-97 172L21 160L28 139L-75 133Z', C.skin) +
    path('M79 88Q128 85 137 130Q151 162 114 174L-2 168L-12 143L86 129Z', C.skin) +
    line('M-112 144Q-91 133-69 138M-108 151L-90 146M-102 157L-84 153M119 145Q95 132 75 138', C.ink, 1.3) +
    head + '</g>';
}

function hands(time, variant) {
  const duck = variant === 'duck';
  return `<g ${stroke}>` +
    path(duck ? 'M80-98Q119-96 122-52Q128 6 96 55L62 104Q47 120 29 105Q20 94 32 81L67 40Q75-3 60-39Z'
      : 'M-80-98Q-119-94-121-50Q-128 2-95 53L-61 98Q-47 116-30 101Q-21 91-34 77L-67 38Q-74-3-60-39Z', C.skin) +
    (duck
      ? path('M32 81Q14 79-6 98Q-16 112-5 116L13 106Q-1 120 9 124L29 108Q16 123 27 126L49 109Q42 120 52 119Q72 110 66 99Q51 81 32 81Z', C.skin, 'stroke-width="2.2"')
      : path('M-33 77Q-13 75 9 94Q17 107 8 110L-13 99Q4 114-6 118L-26 102Q-12 117-22 120L-44 103Q-36 116-47 113Q-66 103-61 94Q-50 78-33 77Z', C.skin, 'stroke-width="2.2"')) +
    path(duck ? 'M-91 125Q-114 123-116 140L-117 168Q-106 183-97 169L-94 152Q-84 142-91 125Z'
      : 'M103 108Q124 104 127 121L127 151Q119 166 111 154L108 136Q97 127 103 108Z', C.skin, 'stroke-width="2.2"') +
    line(duck ? 'M-109 140V163M-103 137V158' : 'M120 122V145M114 118V140', C.ink, 1.2) +
    `<ellipse cx="${duck ? 62 : -61}" cy="${duck ? 78 : 73}" rx="17" ry="7" fill="${C.red}" transform="rotate(${duck ? 39 : -39} ${duck ? 62 : -61} ${duck ? 78 : 73})" stroke-width="2"/>` + '</g>';
}

function duck(time) {
  const feathers = Array.from({ length: 15 }, (_, i) => line(`M${-61 + i * 9}-62q10 10 0 24`, C.ink, 1.2)).join('');
  return group('translate(19 211) scale(.96)',
    path('M-93-74Q-18-128 75-91Q154-63 128-17Q88 21 16 11Q-78 17-105-22Q-132-50-93-74Z', C.gold) +
    path('M84-70Q147-94 160-121Q169-59 128-31Q107-35 84-70Z', C.green) +
    group(`rotate(${n(wave(time, 3) * 2)} -83 -77)`,
      path('M-106-39Q-123-72-103-119Q-81-156-92-193Q-115-205-132-186Q-159-199-153-221Q-149-250-118-246Q-82-246-71-217Q-58-182-67-153Q-76-109-48-76Z', C.gold) +
      path('M-135-190Q-163-204-153-225Q-145-251-118-246Q-91-248-77-224L-83-193Q-112-177-135-190Z', C.green) +
      path('M-151-222L-186-237Q-197-240-195-227L-166-206L-148-209Z', C.red) +
      eye(-129, -222, time, 2.1, 4) +
      line('M-181-228L-159-214M-118-205L-105-201M-100-181Q-113-185-115-178M-96-170Q-107-174-109-166', C.cream, 1.5) +
      Array.from({ length: 7 }, (_, i) => line(`M-91 ${-165 + i * 9}q8 6 15 0`, C.ink, 1.2)).join('')) +
    group(`rotate(${n(wave(time, 2, .7) * 2)} -12 -60)`,
      path('M-67-65Q-14-105 74-60Q100-29 65-9Q-19-7-67-65Z', C.green) +
      path('M-20-78Q20-91 77-56L67-46Q19-72-12-61Z', C.red) +
      Array.from({ length: 7 }, (_, i) => path(`M${4 + i * 10} ${-61 + i * 3}q20 10 10 24q-13-9-10-24Z`, i % 2 ? C.cream : C.gold, 'stroke-width="1.5"')).join('')) +
    `<g opacity=".5">${feathers}</g>` +
    path('M-59 4Q-77 15-95 13L-113 22L-94 24L-87 30L-75 23L-67 28L-53 15M10 9Q33 24 55 13L58 22L31 28L24 36L13 29L-1 32L-6 21Z', C.gold, 'stroke-width="2"'), stroke);
}

function chrysanthemums(time) {
  return group('translate(304 567)',
    path('M-63-23L-46 49Q0 69 47 49L64-23Z', C.red, stroke) +
    `<ellipse cy="-23" rx="64" ry="17" fill="${C.green}" ${stroke}/>` +
    line('M-40 3Q0 16 40 3M-32 32Q0 45 32 32', C.paleGold, 2) +
    group(`rotate(${n(wave(time, 2) * 2)} 0 -25)`,
      line('M0-25Q-25-125-9-217M-9-106Q48-175 47-249M-14-143Q-62-191-66-260', C.green, 3) +
      leaf(-11, -78, -62, .58) + leaf(4, -126, 62, .57) + leaf(-45, -193, -27, .4) + leaf(30, -182, 29, .4) +
      petalFlower(-9, -235, 1.05, C.cream, time) + petalFlower(-65, -274, .69, C.gold, time, 1) + petalFlower(46, -269, .85, C.cream, time, 2)));
}

function blessingsScene(seconds, variant) {
  const time = ((seconds % 12) + 12) % 12;
  const isDuck = variant === 'duck';
  const flowers = isDuck
    ? lotus(time, 319, 581, 1.4) + lotus(time, 1003, 541, .88, 1.7) +
      group('translate(288 604)', path('M-82 0Q-45-48 31-31Q77-37 87-3Q32 15-82 0Z', C.green, `stroke="${C.ink}" stroke-width="2"`) + line('M-56-3L8-13L57-4M8-13L7-28', C.cream, 1.1))
    : chrysanthemums(time) + group('translate(1009 561)', leaf(0, 0, -21, 1.4, C.jade) + leaf(0, -20, 43, 1.4) + petalFlower(18, -165, .85, C.gold, time));
  return scene(time, ground(time, isDuck ? 'pond' : 'field') + flowers +
    `<ellipse cx="679" cy="626" rx="169" ry="11" fill="#a48e5b" opacity=".12"/>` +
    group(`translate(${isDuck ? 703 : 691} ${n(380 + wave(time, 2) * 2)}) rotate(${n(wave(time, 1) * .65)} 0 110)`,
      child(time, variant) + (isDuck ? duck(time) : rooster(time, { x: 37, y: 235, size: .89 })) + hands(time, variant)) +
    butterfly(time, isDuck ? 1054 : 1026, 234, isDuck ? C.gold : C.red, .5), { sunX: isDuck ? 974 : 929, sunY: 172 });
}

export const prosperityScene = (time = 0) => blessingsScene(time, 'duck');
export const gloryScene = (time = 0) => blessingsScene(time, 'rooster');
