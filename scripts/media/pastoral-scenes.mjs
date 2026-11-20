import { C, n, wave, stroke, line, path, group, eye, lotus, grasses, ground, scene } from './folk-art.mjs';
import { buffalo } from './scholar-scene.mjs';

function boyHead(time, kite = false) {
  return group(`rotate(${n((kite ? -7 : 0) + wave(time, 2) * 2)} 0 -305)`,
    path('M-39-324Q-42-363-5-370Q38-376 46-340L46-310Q34-278 3-281Q-29-280-39-324Z', C.skin) +
    path('M-38-326Q-57-342-52-316Q-49-306-37-307M45-325Q63-343 62-321Q60-309 47-308', C.skin) +
    path('M-39-326Q-47-358-20-367L-14-351Q-36-345-30-321ZM19-367Q44-362 46-339L37-331Q34-350 19-351Z', C.ink, 'stroke="none"') +
    Array.from({ length: 12 }, (_, i) => line(`M${-14 + i * 3.3} ${-367 + Math.abs(5 - i) * .8}l${(5 - i) * .3} 12`, C.ink, 1.1)).join('') +
    line('M-24-327Q-13-337-3-330M14-331Q25-337 35-329', C.ink, 1.8) +
    eye(-13, -320, time, .8, 3.2) + eye(25, -320, time, .8, 3.2) +
    line('M7-320L4-306L12-305M-2-294Q8-288 19-297', C.ink, 1.5) +
    `<ellipse cx="-23" cy="-307" rx="7" ry="3.5" fill="${C.red}" opacity=".13" stroke="none"/>`, stroke);
}

function boy(time, kite = false) {
  const fingers = Array.from({ length: 4 }, (_, i) => {
    const lift = n(Math.max(0, wave(time, 6, i * .9)) * 2.8);
    return line(`M${28 + i * 9} ${-294 - i * 1.5}v-${7 + lift}`, C.ink, 1.5);
  }).join('');
  return `<g ${stroke}>` +
    path('M-32-267L-29-288L24-287L27-268Q6-247-32-267Z', C.skin) +
    path('M-31-274Q-60-266-59-234L-43-192Q-48-170 7-169Q51-173 42-205L42-238Q40-269 23-274Z', C.skin) +
    line('M-31-266Q0-253 25-270M-41-231L-37-209M28-236L32-217', C.ink, 1.4) +
    path('M-47-192Q-70-177-42-156L11-153L19-173Z', C.red) +
    path('M-43-174Q-77-188-95-162Q-101-142-77-142L-12-161L-18-179Z', C.skin) +
    path('M19-178Q73-194 84-161Q89-144 69-142L1-162L9-179Z', C.skin) +
    path('M-12-166L-22-133Q-18-117-5-126L7-155M30-159L36-126Q45-113 53-126L44-159', C.skin) +
    line('M-17-137L-7-139M38-136L47-137', C.ink, 1.3) +
    (kite
      ? path('M22-268Q52-278 54-305L61-341Q63-355 72-350L78-336L72-298Q63-262 36-250Z', C.skin) +
        path('M-42-259Q-64-250-51-224L-17-205L20-216L19-228L-16-226L-31-248Z', C.skin) +
        line('M62-340L71-337M64-346L73-343M-8-224L2-219M0-226L8-221', C.ink, 1.3)
      : path('M-39-261Q-67-255-53-230L-26-226L4-272L-7-280L-31-250Z', C.skin) +
        path('M29-267Q57-262 57-237Q61-222 72-233L80-286L68-294L57-262L46-277Z', C.skin)) +
    boyHead(time, kite) +
    (!kite ? group(`rotate(${n(wave(time, 3) * .7)} 8 -293)`,
      path('M-61-287L113-315L116-306L-60-278Z', C.gold, 'stroke-width="2.5"') +
      Array.from({ length: 5 }, (_, i) => `<circle cx="${25 + i * 15}" cy="${-295 - i * 2.5}" r="2.1" fill="${C.ink}" stroke="none"/>`).join('') +
      line('M-47-289L-46-279M98-312L99-303', C.red, 3) +
      path('M-9-280Q-17-299-8-299L-1-292L4-304Q12-306 14-296L16-283L2-271Z', C.skin, 'stroke-width="2"') +
      path('M67-292Q67-312 76-307L79-297L88-301Q97-299 91-290L82-282Z', C.skin, 'stroke-width="2"') + fingers +
      group(`rotate(${n(wave(time, 3) * 9)} 106 -307)`,
        line('M106-307V-272', C.red, 1.5) +
        path('M106-276Q94-259 101-246L105-255L112-247L114-260Z', C.red, 'stroke-width="1.3"'))) : '') + '</g>';
}

function leafParasol(time) {
  return group('translate(640 555)',
    line('M-60-271Q-103-357-91-466', C.green, 4) +
    group(`translate(-91 -466) rotate(${n(wave(time, 2) * 3)})`,
      path('M-130 2C-160-26-112-55-82-40Q-58-83-18-55Q23-81 50-47Q103-64 127-27Q157 5 124 19Q72 10 49 34Q19 52-11 31Q-62 59-80 25Q-114 40-130 2Z', C.green, stroke) +
      path('M-130 2Q-72-15-31 15Q-3 30 26 14Q77-14 125 17Q73 11 49 34Q19 52-11 31Q-62 59-80 25Q-115 40-130 2Z', C.grey, 'stroke="'+C.ink+'" stroke-width="2"') +
      line('M-4 19L-18-48M-4 19L-81-35M-4 19L46-41M-4 19L112-15M-4 19L-126-7M-4 19L74 4', C.paleGold, 1.5)));
}

function kiteShape(time) {
  const x = n(1012 + wave(time, 1) * 27), y = n(142 + wave(time, 2, .4) * 17);
  const rootX = n(621 + wave(time, 1) * 5), rootY = n(552 + wave(time, 4) * 1.5);
  const handX = rootX + 72, handY = rootY - 341;
  return line(`M${handX} ${handY}Q${n(851 + wave(time, 2) * 16)} ${n(290 + wave(time, 1) * 10)} ${x} ${y + 27}`, '#7d7654', 1.25) +
    group(`translate(${x} ${y}) rotate(${n(-7 + wave(time, 2) * 5)})`,
      path('M-119-18Q-8-92 116-13Q81 25 2 37Q-75 26-119-18Z', C.cream, stroke) +
      path('M-119-18Q-8-92 116-13Q13-38-119-18Z', C.red, stroke) +
      line('M-119-18L2 37L116-13M2 37L0-50', C.ink, 1.8) +
      path('M-111-17Q0-42 109-13L94-5Q-3-29-98-6Z', C.green, 'stroke-width="2"') +
      [-92, 87].map((x, index) => line(`M${x}-8C${x + n(wave(time, 3, index) * 12)} 18 ${x - 24} 23 ${x - 6} 43S${x + n(wave(time, 3, index + 1) * 18)} 68 ${x - 13} 84`, C.red, 4)).join('') +
      `<circle cx="-114" cy="-16" r="3" fill="${C.gold}"/><circle cx="111" cy="-12" r="3" fill="${C.gold}"/>`);
}

function pastoralScene(seconds, kite) {
  const time = ((seconds % 12) + 12) % 12;
  const x = n(621 + wave(time, 1) * 5), y = n(552 + wave(time, 4) * 1.5);
  return scene(time,
    ground(time, kite ? 'field' : 'pond') +
    (kite ? grasses(time, 153, 571, .8, 1) + grasses(time, 1082, 587, .65, 3)
      : lotus(time, 192, 578, 1.12) + lotus(time, 1083, 572, .83, 1.8)) +
    `<ellipse cx="637" cy="646" rx="279" ry="12" fill="#889174" opacity=".14"/>` +
    group(`translate(${x} ${y})`, group(kite ? '' : 'scale(-1 1)', buffalo(time, kite ? C.blue : C.green)) + boy(time, kite)) +
    (kite ? kiteShape(time) : leafParasol(time)) +
    grasses(time, 343, 635, .7) + grasses(time, 998, 638, .64, 1.7), { sunX: kite ? 374 : 1009, sunY: 172 });
}

export const fluteScene = (time = 0) => pastoralScene(time, false);
export const kiteScene = (time = 0) => pastoralScene(time, true);
