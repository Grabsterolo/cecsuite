import { useState, useCallback } from "react";

// Ubicación aproximada por IP (via función de Cloudflare Pages en /api/geoip),
// en vez de navigator.geolocation: no requiere permiso del navegador y no
// depende de GPS, que en computadoras de escritorio suele fallar o tardar.
export function useIpLocation() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const getPosition = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/geoip");
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || data.lat == null || data.lng == null) {
        throw new Error("No se pudo determinar tu ubicación por IP.");
      }
      setLoading(false);
      return { lat: data.lat, lng: data.lng };
    } catch (_) {
      const msg = "No se pudo determinar tu ubicación por IP. Intenta de nuevo.";
      setLoading(false); setError(msg);
      throw new Error(msg);
    }
  }, []);

  return { getPosition, loading, error };
}
