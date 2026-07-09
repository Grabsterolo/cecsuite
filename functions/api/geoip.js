// Cloudflare Pages Function: expone la geolocalización por IP que Cloudflare
// ya adjunta a cada request (request.cf), sin depender de navigator.geolocation
// ni de ningún servicio externo.
export async function onRequestGet(context) {
  const cf = context.request.cf;
  const lat = cf?.latitude != null ? parseFloat(cf.latitude) : null;
  const lng = cf?.longitude != null ? parseFloat(cf.longitude) : null;

  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) {
    return new Response(JSON.stringify({ error: "No se pudo determinar la ubicación por IP." }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({
    lat, lng,
    city: cf?.city ?? null,
    country: cf?.country ?? null,
  }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
