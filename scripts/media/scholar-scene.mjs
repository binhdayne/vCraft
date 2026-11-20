import { C, n, wave, stroke, line, path, group, eye, grasses, ground, scene } from './folk-art.mjs';

function willow(time) {
  const hanging = [[-40, -359, .87], [5, -414, 1], [49, -377, .91], [106, -433, 1.12], [155, -393, .94], [220, -437, .85], [264, -397, 1.05], [-71, -276, .82], [-30, -228, .8]];
  return group('translate(206 580)',
    path('M-38 0Q-10-103-32-180Q-55-252-21-316L-9-424L5-425L4-316Q44-353 96-367L120-433L134-431L118-361Q172-366 221-411L231-405Q194-357 121-341Q41-316 14-272Q-9-197 12-138Q26-66-7 0Z', '#82533c', stroke) +
    line('M-26-25Q-8-95-21-155M-23-223Q-35-257-11-286L-4-326M29-308L93-343', C.ink, 2) +
    path('M-17-131Q7-129 1-154L-7-167Q-24-166-28-151ZM-19-223Q-3-221-8-240Q-19-256-28-241Z', C.green, stroke) +
    hanging.map(([x, y, size], index) => group(`translate(${x} ${y}) rotate(${n(wave(time, 2, index * .5) * 6)}) scale(${size})`,
      path('M0 0C-32 26-28 92 3 129C21 82 18 35 0 0Z', index % 2 ? C.green : C.gold, 'stroke="'+C.ink+'" stroke-width="2"') +
      line('M0 6Q-8 70 3 122', C.cream, 1.5) +
      Array.from({ length: 9 }, (_, i) => {
        const h = 15 + i * 10, bend = n(-Math.sin(i / 3) * 3), spread = n(9 + Math.sin(i / 9 * Math.PI) * 7);
        return line(`M${bend} ${h + 8}l-${spread}-13M${bend} ${h + 8}l${spread - 3}-12`, C.ink, 1.2);
      }).join(''))).join(''));
}

function buffalo(time) {
  const stride = wave(time, 4);
  const legs = [-144, 142].map((x, i) => {
    const swing = n(stride * (i ? -9 : 9));
    return group(`rotate(${swing} ${x} -39)`,
      path(`M${x - 19}-58L${x - 31} 5L${x - 10} 42L${x - 21} 76L${x + 9} 76L${x + 18} 39L${x + 6}-2L${x + 24}-61Z`, '#797d70') +
      path(`M${x - 20} 60L${x - 23} 78L${x + 10} 78L${x + 13} 60Z`, C.ink) +
      line(`M${x - 2} 66V77`, C.cream, 1.4));
  }).join('');
  const nearLegs = [-176, 182].map((x, i) => group(`rotate(${n(stride * (i ? 7 : -7))} ${x} -48)`,
    path(`M${x - 16}-62L${x - 15} 8L${x + 4} 41L${x - 3} 82L${x + 24} 82L${x + 29} 36L${x + 14} 1L${x + 22}-62Z`, C.grey) +
    path(`M${x - 2} 65L${x - 5} 84L${x + 25} 84L${x + 27} 64Z`, C.ink) +
    line(`M${x + 10} 71V82`, C.cream, 1.4))).join('');
  const blanket = group('translate(14 -117)',
    `<ellipse rx="84" ry="70" fill="${C.red}"/><ellipse rx="74" ry="61" fill="${C.green}"/><ellipse rx="61" ry="50" fill="${C.gold}"/>` +
    Array.from({ length: 26 }, (_, i) => group(`rotate(${i * 360 / 26})`, line('M0-22V-49', C.ink, 1.3))).join('') +
    `<ellipse rx="39" ry="31" fill="${C.red}"/><ellipse rx="30" ry="23" fill="${C.cream}"/>` +
    line('M-15 0Q0-23 15 0Q0 23-15 0ZM0-16V16M-20 0H20', C.green, 2));
  const head = group(`rotate(${n(wave(time, 3, .4) * 2.5)} -205 -110)`,
    path('M-166-140Q-226-163-264-115Q-290-78-302-48L-325-15Q-340 2-320 20Q-299 39-274 13L-242-26Q-201-49-189-90Z', C.grey) +
    path('M-255-104Q-310-118-322-168Q-319-118-285-96Z', C.cream) +
    path('M-239-114Q-194-128-198-179Q-173-147-213-109Z', C.cream) +
    group(`rotate(${n(wave(time, 4) * 8)} -240 -98)`, path('M-242-102Q-205-121-180-102Q-200-75-232-84Z', '#677664') + line('M-234-96L-193-100', C.ink, 1.2)) +
    eye(-274, -61, time, 1.7, 4) +
    line('M-273-91Q-288-85-291-71M-262-87Q-270-79-268-68M-295-43L-307-22M-261-50L-280-22', C.ink, 1.6) +
    path('M-320-11Q-307-26-289-10Q-279 5-296 18Q-317 29-329 10Z', '#6c7165') +
    `<ellipse cx="-315" cy="4" rx="3" ry="5" fill="${C.ink}"/><ellipse cx="-300" cy="-1" rx="3" ry="4" fill="${C.ink}"/>` +
    line('M-319 18Q-300 28-286 13', C.ink, 2) +
    line('M-287-22Q-245-9-213-57', C.gold, 2.5));
  return `<g ${stroke}>` + legs +
    group(`rotate(${n(wave(time, 2) * 8)} 208 -107)`,
      line('M207-117Q280-125 267-46Q258-6 277 25', C.ink, 6) +
      path('M277 17Q293 24 289 53Q275 48 263 33Z', C.ink, 'stroke-width="2"')) +
    path('M-200-134Q-156-190-54-180Q-4-187 29-170Q145-202 205-140Q246-81 197-29Q118 7 19-16Q-107 3-185-45Q-226-73-200-134Z', C.grey) +
    path('M-168-145Q-115-177-46-163Q24-166 69-154Q156-174 194-133Q138-162 68-137Q15-153-48-146Q-107-159-168-125Z', '#a0a08a', 'stroke="none"') +
    blanket + nearLegs + head +
    line('M-145-75Q-130-48-99-43M102-63Q130-56 157-71M160-98Q185-93 201-102', C.ink, 1.8) + '</g>';
}

function scholar(time) {
  const pageTurn = Math.max(0, wave(time, 2, -.7)) ** 3;
  const textRows = Array.from({ length: 5 }, (_, i) => line(`M33 ${-237 + i * 9}L55 ${-245 + i * 9}M70 ${-249 + i * 9}L88 ${-245 + i * 9}`, C.ink, 1.4)).join('');
  const head = group(`rotate(${n(wave(time, 2, .5) * 2)} 4 -305)`,
    path('M-36-325Q-38-363 0-369Q46-376 51-337L48-305Q34-272 3-279Q-32-282-36-325Z', C.skin) +
    path('M-35-327Q-56-341-48-316Q-43-306-33-309M48-325Q64-341 64-319Q61-307 49-308', C.skin) +
    path('M-36-324Q-46-357-18-367L-11-348Q-33-343-25-318ZM17-368Q48-366 50-338L40-331Q36-349 17-351Z', C.ink, 'stroke="none"') +
    line('M-20-327Q-12-335-2-330M15-331Q27-337 36-330', C.ink, 1.8) +
    eye(-11, -319, time, 1, 3) + eye(26, -320, time, 1, 3) +
    line('M9-320L5-306L13-305M-3-294Q9-283 22-295M-33-322Q-43-328-40-317', C.ink, 1.4));
  return `<g ${stroke}>` +
    path('M-43-183Q-32-163 2-151L27-78L46-86L28-171L-3-196Z', C.red) +
    path('M26-82Q39-82 48-91L65-80Q73-66 49-62L29-64Z', C.skin, 'stroke-width="2"') +
    path('M-40-271Q-77-250-69-199L-82-173Q-55-157 5-166L33-195L48-239Q44-273 19-283Z', C.green) +
    path('M-26-270Q-5-258 16-276L21-253L-13-220L-20-176L-38-174L-29-227Z', C.gold, 'stroke-width="1.7"') +
    line('M-29-263L-14-251L8-265M-24-246L-26-202M-37-198L-54-179M21-224L14-199', C.ink, 1.7) +
    path('M-45-251Q-63-237-49-216L-14-199L16-224L7-239L-18-222Z', C.green) +
    path('M40-255Q65-257 70-232L61-209L38-207L35-223Z', C.green) +
    path('M13-241L59-260L99-246L88-191L51-203L8-183Z', C.gold) +
    path('M59-260L51-203L8-183L13-241Z', C.cream) +
    textRows +
    group(`translate(56 -257) scale(${n(1 - pageTurn * 1.85)} 1)`, path('M0 0L38 13L31 65L-7 55Z', '#ead391', 'stroke-width="1.3"') +
      Array.from({ length: 5 }, (_, i) => line(`M7 ${15 + i * 8}L25 ${20 + i * 8}`, C.ink, 1.2)).join('')) +
    line('M59-260L51-203', C.ink, 2) +
    path('M8-235Q-7-247-12-232L-10-220L-1-214L9-222L17-226Q23-237 8-235Z', C.skin, 'stroke-width="2"') +
    path('M60-217Q74-229 79-217L77-202L69-197L62-204L55-205Q48-218 60-217Z', C.skin, 'stroke-width="2"') +
    line('M-5-232L5-227M67-215L73-210', C.ink, 1.2) + head + '</g>';
}

function dragonfly(time) {
  return group(`translate(${n(1038 + wave(time, 1, 2) * 41)} ${n(314 + wave(time, 3) * 10)}) rotate(${n(wave(time, 2) * 6)})`,
    group(`scale(1 ${n(.65 + Math.abs(wave(time, 12)) * .35)})`,
      path('M0 0Q-41-27-45-5Q-25 9 0 3Q39-24 46-4Q29 11 0 3M0 5Q-33 0-33 19Q-15 24 0 8Q34-2 34 19Q17 23 0 8', C.cream, 'stroke="'+C.ink+'" stroke-width="1" opacity=".85"')) +
    line('M0-5V35', C.red, 3) + `<circle cy="-5" r="3" fill="${C.ink}"/>`);
}

export function scholarScene(seconds = 0) {
  const time = ((seconds % 12) + 12) % 12;
  return scene(time, ground(time) + willow(time) +
    `<ellipse cx="701" cy="616" rx="266" ry="13" fill="#9c956e" opacity=".13"/>` +
    group(`translate(${n(706 + wave(time, 1) * 6)} ${n(520 + wave(time, 4) * 1.7)})`, buffalo(time) + scholar(time)) +
    grasses(time, 371, 619, .69) + grasses(time, 1041, 617, .76, 1.8) + grasses(time, 1126, 593, .35, 3) + dragonfly(time), { sunX: 1039, sunY: 180 });
}
