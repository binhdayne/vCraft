import { useCallback, useEffect, useRef, useState } from 'react';
import { hasCoordinates } from './map-settings.mjs';

const INITIAL = { status: 'idle', position: null, error: '' };
const ERRORS = {
  1: 'Bạn chưa cho phép truy cập vị trí. Hãy bật quyền vị trí cho trang này trong trình duyệt rồi thử lại.',
  2: 'Chưa xác định được vị trí. Hãy kiểm tra định vị của thiết bị và thử lại.',
  3: 'Định vị mất quá nhiều thời gian. Bạn có thể thử lại.',
};

export function useUserLocation() {
  const [location, setLocation] = useState(INITIAL);
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current++; }, []);

  const locate = useCallback(() => {
    const current = ++requestId.current;
    if (!window.isSecureContext) {
      setLocation({ ...INITIAL, status: 'error', error: 'Định vị cần mở website qua HTTPS hoặc localhost.' });
      return;
    }
    if (!navigator.geolocation) {
      setLocation({ ...INITIAL, status: 'error', error: 'Trình duyệt này chưa hỗ trợ định vị.' });
      return;
    }
    setLocation({ ...INITIAL, status: 'loading' });
    const fail = error => {
      if (requestId.current === current) setLocation({ ...INITIAL, status: 'error', error: ERRORS[error?.code] || ERRORS[2] });
    };
    try {
      navigator.geolocation.getCurrentPosition(result => {
        if (requestId.current !== current) return;
        const position = {
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: Number.isFinite(result.coords.accuracy) && result.coords.accuracy >= 0 ? result.coords.accuracy : null,
        };
        if (!hasCoordinates(position)) { fail({ code: 2 }); return; }
        setLocation({ status: 'ready', position, error: '' });
      }, fail, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    } catch { fail({ code: 2 }); }
  }, []);

  const clear = useCallback(() => {
    requestId.current++;
    setLocation(INITIAL);
  }, []);
  return { ...location, locate, clear };
}
