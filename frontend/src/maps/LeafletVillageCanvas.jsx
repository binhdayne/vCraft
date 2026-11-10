import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MAX_ZOOM, MIN_ZOOM, VILLAGE_BOUNDS, VILLAGE_CENTER, formatDistance, googleDirectionsUrl, googleSatelliteUrl, isWithinVillage } from './map-settings.mjs';
import { createWorkshopPhotoGallery } from './workshop-photo-gallery.mjs';

const AREA = L.latLngBounds(
  [VILLAGE_BOUNDS.south, VILLAGE_BOUNDS.west],
  [VILLAGE_BOUNDS.north, VILLAGE_BOUNDS.east],
);
const SOURCES = [
  {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  {
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &middot; <a href="https://www.hotosm.org/">HOT</a> &middot; <a href="https://www.openstreetmap.fr/">OSM France</a>',
  },
];

export function LeafletVillageCanvas({ studios, selected, focusRequest, onSelect, userLocation, nearestId }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const retryTiles = useRef(null);
  const [tileStatus, setTileStatus] = useState('loading');

  useEffect(() => {
    const map = L.map(container.current, {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: AREA,
      maxBoundsViscosity: 1,
      bounceAtZoomLimits: false,
    }).setView([VILLAGE_CENTER.lat, VILLAGE_CENTER.lng], MIN_ZOOM);
    mapRef.current = map;
    const constrainView = () => {
      map.setMinZoom(Math.max(MIN_ZOOM, map.getBoundsZoom(AREA, true)));
      map.panInsideBounds(AREA, { animate: false });
    };
    constrainView();
    map.on('resize', constrainView);
    const observer = new ResizeObserver(() => map.invalidateSize({ pan: false }));
    observer.observe(container.current);

    let disposed = false;
    let layer;
    let timeout;
    let switchTimer;
    const useSource = index => {
      if (disposed) return;
      clearTimeout(timeout);
      clearTimeout(switchTimer);
      switchTimer = undefined;
      if (layer) layer.remove().off();
      setTileStatus('loading');
      const current = L.tileLayer(SOURCES[index].url, {
        attribution: SOURCES[index].attribution,
        minZoom: MIN_ZOOM,
        maxZoom: MAX_ZOOM,
        bounds: AREA,
        noWrap: true,
        updateWhenIdle: true,
        updateWhenZooming: false,
        keepBuffer: 1,
      });
      layer = current;
      let loadedTiles = 0;
      let hasError = false;
      const fail = () => {
        if (disposed || layer !== current) return;
        clearTimeout(timeout);
        if (index + 1 < SOURCES.length) {
          if (switchTimer === undefined) switchTimer = setTimeout(() => useSource(index + 1), 0);
        } else {
          hasError = true;
          setTileStatus('error');
        }
      };
      current.on('tileload', () => {
        if (!disposed && layer === current && !hasError) loadedTiles++;
      });
      current.on('load', () => {
        if (disposed || layer !== current || hasError) return;
        clearTimeout(timeout);
        if (loadedTiles) setTileStatus('ready');
        else fail();
      });
      current.on('tileerror', fail);
      timeout = setTimeout(() => {
        if (loadedTiles && !hasError) setTileStatus('ready');
        else fail();
      }, 8000);
      current.addTo(map);
    };
    retryTiles.current = () => useSource(0);
    useSource(0);
    return () => {
      disposed = true;
      clearTimeout(timeout);
      clearTimeout(switchTimer);
      observer.disconnect();
      if (layer) layer.remove().off();
      retryTiles.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const markers = L.layerGroup().addTo(map);
    studios.forEach((studio, index) => {
      const icon = L.divIcon({
        className: 'map-marker' + (studio._id === nearestId ? ' map-marker-nearest' : ''), html: `<span><b>${index + 1}</b></span>`,
        iconSize: [36, 44], iconAnchor: [18, 42],
      });
      const content = document.createElement('div');
      const title = document.createElement('strong');
      title.className = 'map-popup-title';
      title.textContent = studio.name;
      const description = document.createElement('p');
      description.className = 'map-popup-status';
      description.textContent = studio.openForVisits ? 'Đang đón khách tham quan' : 'Hẹn trước khi ghé thăm';
      const actions = document.createElement('div');
      actions.className = 'map-popup-actions';
      const satellite = document.createElement('a');
      satellite.href = googleSatelliteUrl(studio);
      satellite.target = '_blank';
      satellite.rel = 'noopener noreferrer';
      satellite.textContent = 'Xem ảnh vệ tinh trên Google Maps ↗';
      const profile = document.createElement('a');
      profile.href = '#/xuong/' + studio._id;
      profile.textContent = 'Xem hồ sơ xưởng →';
      const directions = document.createElement('a');
      directions.href = googleDirectionsUrl(studio, userLocation);
      directions.target = '_blank';
      directions.rel = 'noopener noreferrer';
      directions.textContent = 'Chỉ đường đến xưởng ↗';
      actions.append(satellite, directions, profile);
      content.append(title, createWorkshopPhotoGallery(studio), description, actions);
      const marker = L.marker([studio.latitude, studio.longitude], { icon, title: studio.name })
        .addTo(markers).bindPopup(content, {
          className: 'workshop-map-popup', minWidth: 220, maxWidth: 300,
          maxHeight: Math.max(220, map.getSize().y - 70), autoPanPadding: [14, 14], keepInView: true,
        }).on('click', () => onSelect(studio));
      marker.on('popupopen', () => {
        const popup = marker.getPopup();
        const height = Math.max(220, map.getSize().y - 70);
        if (popup.options.maxHeight !== height) { popup.options.maxHeight = height; popup.update(); }
      });
    });
    return () => markers.remove();
  }, [studios, onSelect, userLocation, nearestId]);

  useEffect(() => {
    if (selected) mapRef.current?.flyTo([selected.latitude, selected.longitude], 17);
  }, [selected, focusRequest]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userLocation || !isWithinVillage(userLocation)) return;
    const point = [userLocation.latitude, userLocation.longitude];
    const group = L.layerGroup().addTo(map);
    if (userLocation.accuracy !== null) L.circle(point, {
      radius: userLocation.accuracy, color: '#2563eb', fillColor: '#60a5fa', fillOpacity: 0.08,
      weight: 1, interactive: false, className: 'user-location-accuracy',
    }).addTo(group);
    const label = document.createElement('div');
    label.textContent = 'Vị trí của bạn' + (userLocation.accuracy !== null ? ` · Sai số khoảng ${formatDistance(userLocation.accuracy)}` : '');
    L.circleMarker(point, {
      radius: 8, color: '#ffffff', weight: 3, fillColor: '#2563eb', fillOpacity: 1,
      className: 'user-location-dot',
    }).addTo(group).bindPopup(label).bindTooltip('Vị trí của bạn', { direction: 'top' });
    map.panTo(point);
    return () => group.remove();
  }, [userLocation]);

  return <>
    <div className="map-canvas" ref={container} aria-label="Bản đồ vị trí xưởng" data-map-provider="openstreetmap" />
    {tileStatus === 'loading' && <div className="map-tile-status" role="status">Đang tải nền bản đồ…</div>}
    {tileStatus === 'error' && <div className="map-tile-status" role="status">
      <p>Chưa tải được nền bản đồ. Bạn vẫn có thể chọn xưởng và xem ảnh vệ tinh trên Google Maps.</p>
      <button className="btn outline small" type="button" onClick={() => retryTiles.current?.()}>Thử tải lại</button>
    </div>}
  </>;
}
