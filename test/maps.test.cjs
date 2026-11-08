const { test } = require('node:test');
const assert = require('node:assert/strict');

test('satellite links use the selected coordinates and the documented Google Maps URL format', async () => {
  const { googleSatelliteUrl, MIN_ZOOM, MAX_ZOOM } = await import('../frontend/src/maps/map-settings.mjs');
  const url = new URL(googleSatelliteUrl({ latitude: 21.0616, longitude: 106.0822 }));
  assert.equal(url.origin, 'https://www.google.com');
  assert.equal(url.searchParams.get('center'), '21.0616,106.0822');
  assert.equal(url.searchParams.get('api'), '1');
  assert.equal(url.searchParams.get('map_action'), 'map');
  assert.equal(url.searchParams.get('basemap'), 'satellite');
  assert.equal(url.searchParams.get('zoom'), '19');
  assert.equal(MIN_ZOOM, 16);
  assert.equal(MAX_ZOOM, 19);
  assert.throws(() => googleSatelliteUrl({ latitude: NaN, longitude: 106 }));
  assert.throws(() => googleSatelliteUrl({ latitude: 21, longitude: 181 }));
});

test('distance uses metre units, handles the date line and ignores invalid coordinates', async () => {
  const { distanceMeters, isWithinVillage } = await import('../frontend/src/maps/map-settings.mjs');
  const zero = { latitude: 0, longitude: 0 };
  assert.equal(distanceMeters(zero, zero), 0);
  assert.ok(Math.abs(distanceMeters(zero, { latitude: 0, longitude: 1 }) - 111195) < 2);
  assert.ok(Math.abs(distanceMeters({ latitude: 0, longitude: 179.9 }, { latitude: 0, longitude: -179.9 }) - 22239) < 2);
  assert.ok(Number.isFinite(distanceMeters(zero, { latitude: 0, longitude: 180 })));
  assert.equal(distanceMeters(zero, { latitude: 91, longitude: 0 }), null);
  assert.equal(distanceMeters(zero, { latitude: null, longitude: 0 }), null);
  assert.equal(isWithinVillage({ latitude: 21.0616, longitude: 106.0822 }), true);
  assert.equal(isWithinVillage({ latitude: 21.0285, longitude: 105.8542 }), false);
});

test('nearest studios are ordered without mutating source records and invalid positions rank last', async () => {
  const { rankStudiosByDistance } = await import('../frontend/src/maps/map-settings.mjs');
  const studios = [
    { _id: 'far', latitude: 21.063, longitude: 106.084 },
    { _id: 'invalid', latitude: null, longitude: 106.081 },
    { _id: 'near', latitude: 21.0603, longitude: 106.081 },
    { _id: 'middle', latitude: 21.0616, longitude: 106.0822 },
  ];
  const original = JSON.stringify(studios);
  const ranked = rankStudiosByDistance(studios, { latitude: 21.0603, longitude: 106.081 });
  assert.deepEqual(ranked.map(studio => studio._id), ['near', 'middle', 'far', 'invalid']);
  assert.equal(ranked[0].distanceMeters, 0);
  assert.equal(ranked.at(-1).distanceMeters, null);
  assert.equal(JSON.stringify(studios), original);
  assert.notEqual(ranked[0], studios[2]);
});

test('directions include a measured origin when available and work without location permission', async () => {
  const { googleDirectionsUrl } = await import('../frontend/src/maps/map-settings.mjs');
  const studio = { latitude: 21.0616, longitude: 106.0822 };
  const origin = { latitude: 21.0285, longitude: 105.8542 };
  const route = new URL(googleDirectionsUrl(studio, origin));
  assert.equal(route.origin, 'https://www.google.com');
  assert.equal(route.pathname, '/maps/dir/');
  assert.equal(route.searchParams.get('api'), '1');
  assert.equal(route.searchParams.get('origin'), '21.0285,105.8542');
  assert.equal(route.searchParams.get('destination'), '21.0616,106.0822');
  assert.equal(route.searchParams.get('dir_action'), 'navigate');
  assert.equal(route.searchParams.has('key'), false);
  assert.equal(new URL(googleDirectionsUrl(studio)).searchParams.has('origin'), false);
  assert.throws(() => googleDirectionsUrl(studio, { latitude: NaN, longitude: 0 }));
});
