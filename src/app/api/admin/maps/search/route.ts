import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/cookies";
import { searchLocalChurches, normalizeArabic } from "@/data/churches-egypt";

export interface MapSearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  source: "church_registry" | "google_maps" | "coordinates" | "osm";
  isChurch?: boolean;
}

/**
 * Parses raw coordinate input e.g. "30.1062, 31.3129" or "30.1062 31.3129"
 */
function parseRawCoordinates(text: string): { lat: number; lng: number } | null {
  const coordRegex = /^\s*(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)\s*$/;
  const match = text.match(coordRegex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

/**
 * Extracts decoded place name from Google Maps URL path
 */
function extractPlaceNameFromUrl(urlStr: string): string | undefined {
  const placeMatch = urlStr.match(/\/maps\/place\/([^/@?]+)/);
  if (placeMatch && placeMatch[1]) {
    try {
      const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
      if (decoded && !decoded.startsWith("@")) {
        return decoded;
      }
    } catch {}
  }
  return undefined;
}

/**
 * Extracts coordinates from Google Maps URLs (desktop, mobile redirect, protobuf query)
 */
function extractCoordsFromGoogleMapsUrl(
  urlStr: string
): { lat: number; lng: number; name?: string } | null {
  try {
    // 1. Check for @lat,lng
    const atMatch = urlStr.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
        name: extractPlaceNameFromUrl(urlStr),
      };
    }

    // 2. Check for !3dlat!4dlng (protobuf format)
    const protoMatch = urlStr.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (protoMatch) {
      return {
        lat: parseFloat(protoMatch[1]),
        lng: parseFloat(protoMatch[2]),
        name: extractPlaceNameFromUrl(urlStr),
      };
    }

    // 3. Check for q=lat,lng or ll=lat,lng or query=lat,lng
    const qMatch =
      urlStr.match(/[?&](?:q|ll|query|loc)=loc:?(-?\d+\.\d+)[,+](-?\d+\.\d+)/) ||
      urlStr.match(/[?&](?:q|ll|query|loc)=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
    if (qMatch) {
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2]),
        name: extractPlaceNameFromUrl(urlStr),
      };
    }

    // 4. Check for destination=lat,lng
    const destMatch = urlStr.match(/[?&]destination=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
    if (destMatch) {
      return {
        lat: parseFloat(destMatch[1]),
        lng: parseFloat(destMatch[2]),
        name: extractPlaceNameFromUrl(urlStr),
      };
    }
  } catch {}
  return null;
}

/**
 * Follows redirects for Google Maps short links (maps.app.goo.gl or goo.gl/maps)
 */
async function resolveGoogleMapsRedirect(shortUrl: string): Promise<string> {
  try {
    const res = await fetch(shortUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    return res.url || shortUrl;
  } catch {
    return shortUrl;
  }
}

/**
 * Clean Arabic query for external OSM services (stripping prepositions attached to place names)
 */
function cleanQueryForExternalServices(query: string): string {
  return query
    .replace(/[ًٌٍَُِّْـ]/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/بسوهاج/g, "سوهاج")
    .replace(/باخميم/g, "اخميم")
    .replace(/بطهطا/g, "طهطا")
    .replace(/بطما/g, "طما")
    .replace(/بالمراغة/g, "المراغة")
    .replace(/بالمنشاة/g, "المنشاة")
    .replace(/بجرجا/g, "جرجا")
    .replace(/بالبلينا/g, "البلينا")
    .replace(/بساقلتة/g, "ساقلتة")
    .replace(/\bبال([^\s]+)/g, "$1")
    .replace(/\bبمسرة\b/g, "مسرة")
    .replace(/\bبشبرا\b/g, "شبرا")
    .replace(/\bبحلوان\b/g, "حلوان")
    .replace(/\bبالمعادي\b/g, "المعادي")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * GET /api/admin/maps/search?q=...
 */
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (!user.roles.includes("ADMIN") && !user.roles.includes("SUPER_ADMIN"))) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = (searchParams.get("q") || "").trim();

    if (!rawQuery) {
      return NextResponse.json({ results: [] });
    }

    const results: MapSearchResult[] = [];

    // --- CASE 1: Direct Coordinates Input (e.g. "30.1062, 31.3129") ---
    const rawCoords = parseRawCoordinates(rawQuery);
    if (rawCoords) {
      return NextResponse.json({
        results: [
          {
            id: `coord_${Date.now()}`,
            name: "إحداثيات جغرافية مخصصة",
            address: `خط العرض: ${rawCoords.lat}، خط الطول: ${rawCoords.lng}`,
            latitude: rawCoords.lat,
            longitude: rawCoords.lng,
            source: "coordinates",
            isChurch: false,
          },
        ],
      });
    }

    // --- CASE 2: Google Maps Link / Share URL ---
    const isGoogleMapsLink =
      rawQuery.includes("maps.app.goo.gl") ||
      rawQuery.includes("goo.gl/maps") ||
      rawQuery.includes("google.com/maps") ||
      rawQuery.includes("maps.google.com");

    if (isGoogleMapsLink) {
      let resolvedUrl = rawQuery;
      if (rawQuery.includes("maps.app.goo.gl") || rawQuery.includes("goo.gl/maps")) {
        resolvedUrl = await resolveGoogleMapsRedirect(rawQuery);
      }

      const extracted = extractCoordsFromGoogleMapsUrl(resolvedUrl);
      if (extracted) {
        return NextResponse.json({
          results: [
            {
              id: `gmaps_${Date.now()}`,
              name: extracted.name || "موقع محدد من خرائط Google Maps",
              address: `تم استخراجه بنجاح من رابط خرائط جوجل (${extracted.lat.toFixed(4)}, ${extracted.lng.toFixed(4)})`,
              latitude: extracted.lat,
              longitude: extracted.lng,
              source: "google_maps",
              isChurch: true,
            },
          ],
        });
      }
    }

    // --- CASE 3: Local Egyptian Churches Database Search (0ms instant response) ---
    const localMatches = searchLocalChurches(rawQuery);
    for (const ch of localMatches) {
      results.push({
        id: ch.id,
        name: ch.name,
        address: `${ch.area}، ${ch.city}`,
        latitude: ch.lat,
        longitude: ch.lng,
        source: "church_registry",
        isChurch: true,
      });
    }

    // --- CASE 4: External Geocoding (Photon & OpenStreetMap) ---
    // If we have fewer than 5 local matches or user searched generic street/neighborhood
    if (results.length < 5) {
      const cleaned = cleanQueryForExternalServices(rawQuery);

      // 4a. Komoot Photon API (Sohag biased)
      try {
        const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(
          cleaned
        )}&limit=5&lat=26.5565&lon=31.6958`;
        const pRes = await fetch(photonUrl, {
          signal: AbortSignal.timeout(3500),
          headers: { "Accept-Language": "ar" },
        });

        if (pRes.ok) {
          const pData = (await pRes.json()) as any;
          if (pData?.features && Array.isArray(pData.features)) {
            for (const f of pData.features) {
              const coords = f.geometry?.coordinates;
              const props = f.properties || {};
              if (Array.isArray(coords) && coords.length >= 2) {
                const lng = coords[0];
                const lat = coords[1];

                // Ensure it's in or near Egypt (lat: 22-32, lng: 25-36)
                if (lat >= 22 && lat <= 32 && lng >= 25 && lng <= 36) {
                  const placeName = props.name || props.street || cleaned;
                  const addressParts = [props.street, props.district, props.city, props.country]
                    .filter(Boolean)
                    .join("، ");

                  // Check for close duplicate in already found results
                  const isDuplicate = results.some(
                    (r) => Math.abs(r.latitude - lat) < 0.001 && Math.abs(r.longitude - lng) < 0.001
                  );

                  if (!isDuplicate) {
                    const isChurchPlace =
                      placeName.includes("كنيسة") ||
                      placeName.includes("دير") ||
                      placeName.includes("مطرانية") ||
                      props.osm_value === "place_of_worship";

                    results.push({
                      id: `photon_${f.properties.osm_id || Math.random()}`,
                      name: placeName,
                      address: addressParts || "مصر",
                      latitude: lat,
                      longitude: lng,
                      source: "osm",
                      isChurch: isChurchPlace,
                    });
                  }
                }
              }
            }
          }
        }
      } catch (photonErr) {
        // Fallback silently if Photon has timeout or network glitch
      }

      // 4b. Nominatim Fallback if still low results
      if (results.length < 3) {
        try {
          const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            cleaned
          )}&countrycodes=eg&limit=4&accept-language=ar`;
          const nRes = await fetch(nomUrl, {
            signal: AbortSignal.timeout(3500),
            headers: {
              "User-Agent": "ThamarShefahChoirApp/1.0 (info@thamar-shefah.org)",
              "Accept-Language": "ar",
            },
          });

          if (nRes.ok) {
            const nData = (await nRes.json()) as any[];
            if (Array.isArray(nData)) {
              for (const item of nData) {
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                const isDuplicate = results.some(
                  (r) => Math.abs(r.latitude - lat) < 0.001 && Math.abs(r.longitude - lng) < 0.001
                );

                if (!isDuplicate && !isNaN(lat) && !isNaN(lng)) {
                  const parts = item.display_name.split(",");
                  const placeName = parts[0] || item.display_name;
                  const address = parts.slice(1, 4).join("، ").trim();

                  results.push({
                    id: `nom_${item.place_id || Math.random()}`,
                    name: placeName,
                    address: address || item.display_name,
                    latitude: lat,
                    longitude: lng,
                    source: "osm",
                    isChurch: placeName.includes("كنيسة") || placeName.includes("دير"),
                  });
                }
              }
            }
          }
        } catch (nomErr) {
          // Ignore fallback error
        }
      }
    }

    return NextResponse.json({ results: results.slice(0, 10) });
  } catch (err: unknown) {
    console.error("Map search error:", err);
    return NextResponse.json({ error: "فشل البحث في الخريطة" }, { status: 500 });
  }
}

