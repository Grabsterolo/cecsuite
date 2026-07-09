import { useState, useCallback } from "react";

function rawPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      reject,
      options
    );
  });
}

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const getPosition = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      const msg = "Tu navegador no soporta geolocalización.";
      setLoading(false); setError(msg);
      throw new Error(msg);
    }

    try {
      // Primer intento: alta precisión (GPS si está disponible)
      const pos = await rawPosition({ enableHighAccuracy: true, timeout: 8000, maximumAge: 0 });
      setLoading(false);
      return pos;
    } catch (err1) {
      if (err1.code === err1.PERMISSION_DENIED) {
        const msg = "Permiso de ubicación denegado. Actívalo en tu navegador para poder marcar.";
        setLoading(false); setError(msg);
        throw new Error(msg);
      }
      // POSITION_UNAVAILABLE o TIMEOUT: reintentar con ubicación aproximada (red/IP),
      // más confiable en computadoras sin GPS.
      try {
        const pos = await rawPosition({ enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
        setLoading(false);
        return pos;
      } catch (err2) {
        const msg = err2.code === err2.PERMISSION_DENIED
          ? "Permiso de ubicación denegado. Actívalo en tu navegador para poder marcar."
          : err2.code === err2.TIMEOUT
            ? "No se pudo obtener tu ubicación a tiempo. Verifica tu conexión e intenta de nuevo."
            : "No se pudo obtener tu ubicación. Verifica que los servicios de ubicación estén activados en tu dispositivo y navegador.";
        setLoading(false); setError(msg);
        throw new Error(msg);
      }
    }
  }, []);

  return { getPosition, loading, error };
}
