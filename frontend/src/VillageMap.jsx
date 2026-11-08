import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, LocateFixed, Navigation, Satellite } from 'lucide-react';
import { Empty, LoadState, PageTitle, useLoad } from './shared';
import { LeafletVillageCanvas } from './maps/LeafletVillageCanvas';
import { formatDistance, googleDirectionsUrl, googleSatelliteUrl, isWithinVillage, rankStudiosByDistance } from './maps/map-settings.mjs';
import { useUserLocation } from './maps/useUserLocation';
import './village-map.css';

export function VillageMap() {
  const state = useLoad('/workshops');
  const [selectedId, setSelectedId] = useState(null);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState(0);
  const location = useUserLocation();
  const visibleStudios = useMemo(() => (state.data || []).filter(studio => !onlyOpen || studio.openForVisits), [state.data, onlyOpen]);
  const studios = useMemo(() => location.position ? rankStudiosByDistance(visibleStudios, location.position) : visibleStudios, [visibleStudios, location.position]);
  const nearest = location.position ? studios.find(studio => studio.distanceMeters !== null) : null;
  const selected = studios.find(studio => studio._id === selectedId) || null;
  const selectStudio = useCallback(studio => {
    setSelectedId(studio._id);
    setFocusRequest(value => value + 1);
  }, []);
  return <section className="wrap page">
    <PageTitle eyebrow="MỘT CHUYẾN GHÉ THĂM" title="Đi dọc làng, gặp người giữ nghề.">
      Khám phá các xưởng và mở ảnh vệ tinh quanh vị trí bạn chọn trên Google Maps.
    </PageTitle>
    <div className="map-notice">Tên xưởng và vị trí ghim trong bản demo dùng để minh họa; các liên kết chỉ đường sử dụng tọa độ mẫu.</div>
    <LoadState {...state} retry={state.reload} />
    {state.data && <div className="map-layout">
      <aside>
        <section className="map-location-tools" aria-label="Vị trí của bạn">
          <button type="button" className="btn outline full" disabled={location.status === 'loading'} onClick={location.locate}>
            <LocateFixed size={17} /> {location.status === 'loading' ? 'Đang xác định vị trí…' : location.position ? 'Cập nhật vị trí của tôi' : 'Vị trí của tôi'}
          </button>
          {location.error && <p className="map-location-error" role="alert">{location.error}</p>}
          {location.position && <div className="map-location-status" role="status">
            <p>Đã xác định vị trí{location.position.accuracy !== null && ` · Sai số khoảng ${formatDistance(location.position.accuracy)}`}.</p>
            {!isWithinVillage(location.position) && <p>Bạn đang ở ngoài khu vực làng. Bản đồ vẫn giữ khung làng; khoảng cách và chỉ đường vẫn dùng được.</p>}
            <button className="text-link" type="button" onClick={location.clear}>Bỏ vị trí của tôi</button>
          </div>}
        </section>
        {nearest && <section className="map-nearest" aria-label="Xưởng gần bạn nhất">
          <span className="eyebrow">GẦN BẠN NHẤT TRONG DANH SÁCH</span>
          <h3>{nearest.name}</h3>
          <p>{formatDistance(nearest.distanceMeters)} · khoảng cách đường thẳng</p>
          <p>{nearest.openForVisits ? 'Đang đón khách tham quan' : 'Hẹn trước khi ghé thăm'}</p>
          <a className="btn full" href={googleDirectionsUrl(nearest, location.position)} target="_blank" rel="noopener noreferrer">
            <Navigation size={17} /> Chỉ đường đến xưởng gần nhất
          </a>
          <button className="text-link" type="button" onClick={() => selectStudio(nearest)}>Xem xưởng trên bản đồ <ArrowUpRight size={16} /></button>
        </section>}
        <label className="toggle">
          <input type="checkbox" checked={onlyOpen} onChange={event => {
            setOnlyOpen(event.target.checked);
            setSelectedId(null);
          }} />
          Chỉ xưởng đang đón khách
        </label>
        <p className="muted">{studios.length} không gian xưởng{location.position && ' · Gần bạn trước'}</p>
        {studios.map((studio, index) => <button
          className={'map-studio ' + (selectedId === studio._id ? 'selected' : '')}
          key={studio._id}
          onClick={() => selectStudio(studio)}
        >
          <span className="map-index">{index + 1}</span>
          <div>
            <h3>{studio.name}</h3>
            {location.position && studio.distanceMeters !== null && <p className="map-distance">{formatDistance(studio.distanceMeters)} từ bạn · đường thẳng</p>}
            <p>{studio.visitingHours}</p>
            <span className={studio.openForVisits ? 'green' : 'muted'}>
              {studio.openForVisits ? '● Đang đón khách' : '○ Hẹn trước'}
            </span>
          </div>
        </button>)}
        {!studios.length && <Empty title="Chưa có xưởng mở cửa" />}
        {selected && <section className="map-selected" aria-label="Xưởng đã chọn">
          <span className="eyebrow">KHÁM PHÁ VỊ TRÍ</span>
          <h3>{selected.name}</h3>
          <p>{selected.address}</p>
          <a className="btn full map-directions-link" href={googleDirectionsUrl(selected, location.position)} target="_blank" rel="noopener noreferrer">
            <Navigation size={17} /> {location.position ? 'Chỉ đường từ vị trí của tôi' : 'Chỉ đường đến xưởng'}
          </a>
          <a className="btn full" href={googleSatelliteUrl(selected)} target="_blank" rel="noopener noreferrer">
            <Satellite size={17} /> Xem ảnh vệ tinh trên Google Maps
          </a>
          <Link className="text-link" to={'/xuong/' + selected._id}>Xem hồ sơ xưởng <ArrowUpRight size={17} /></Link>
        </section>}
      </aside>
      <div className="village-map-view">
        <LeafletVillageCanvas studios={studios} selected={selected} focusRequest={focusRequest} onSelect={selectStudio}
          userLocation={location.position} nearestId={nearest?._id} />
      </div>
    </div>}
  </section>;
}
