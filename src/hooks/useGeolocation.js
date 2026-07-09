import { useState, useCallback } from "react";

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const getPosition = useCallback(() => {
    setLoading(true);
    setError(null);
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const msg = "Tu navegador no soporta geolocalización.";
        setLoading(false); setError(msg);
        reject(new Error(msg));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => {
          setLoading(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        err => {
          const msg = err.code === err.PERMISSION_DENIED
            ? "Permiso de ubicación denegado. Actívalo en tu navegador para poder marcar."
            : "No se pudo obtener tu ubicación. Intenta de nuevo.";
          setLoading(false); setError(msg);
          reject(new Error(msg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { getPosition, loading, error };
}
