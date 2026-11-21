import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VILLAGE_CENTER, VILLAGE_BOUNDS, MIN_ZOOM, MAX_ZOOM } from './map-settings.mjs';

const bounds = L.latLngBounds([VILLAGE_BOUNDS.south, VILLAGE_BOUNDS.west], [VILLAGE_BOUNDS.north, VILLAGE_BOUNDS.east]);

export function LocationPicker({ latitude, longitude, onChange }) {
  const element = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  useEffect(() => {
    if (!element.current) return undefined;
    const lat = Number(latitude); const lng = Number(longitude);
    const initial = Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : [VILLAGE_CENTER.lat, VILLAGE_CENTER.lng];
    const instance = L.map(element.current, { minZoom: MIN_ZOOM - 1, maxZoom: MAX_ZOOM, maxBounds: bounds, maxBoundsViscosity: 0.85 }).setView(initial, MIN_ZOOM);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors', maxZoom: MAX_ZOOM }).addTo(instance);
    map.current = instance;
    const place = pointLike => {
      const point = L.latLng(pointLike);
      if (!marker.current) marker.current = L.marker(point, { draggable: true }).addTo(instance);
      else marker.current.setLatLng(point);
      marker.current.bindTooltip('Vị trí xưởng', { permanent: true, direction: 'top', offset: [0, -8] }).openTooltip();
      onChange({ latitude: point.lat, longitude: point.lng });
    };
    if (!marker.current) marker.current = L.marker(initial, { draggable: true }).addTo(instance);
    marker.current.bindTooltip('Vị trí xưởng', { permanent: true, direction: 'top', offset: [0, -8] }).openTooltip();
    instance.on('click', event => place(event.latlng));
    marker.current.on('dragend', event => place(event.target.getLatLng()));
    setTimeout(() => instance.invalidateSize(), 0);
    return () => { instance.remove(); map.current = null; marker.current = null; };
  }, []);
  useEffect(() => {
    const lat = Number(latitude); const lng = Number(longitude);
    if (marker.current && Number.isFinite(lat) && Number.isFinite(lng)) marker.current.setLatLng([lat, lng]);
  }, [latitude, longitude]);
  return <div className="location-picker"><div className="location-picker-map" ref={element} aria-label="Bản đồ chọn vị trí xưởng" /><p className="location-picker-hint">Bấm vào bản đồ hoặc kéo ghim đỏ để chọn đúng vị trí xưởng.</p><div className="location-picker-coordinates">Vĩ độ <strong>{Number(latitude).toFixed(6)}</strong> · Kinh độ <strong>{Number(longitude).toFixed(6)}</strong></div></div>;
}
