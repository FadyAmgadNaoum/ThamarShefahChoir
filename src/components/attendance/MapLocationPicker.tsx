"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  X,
  Crosshair,
  Check,
  Search,
  Sparkles,
  AlertCircle,
  Navigation,
  Loader2,
  Church,
  Link as LinkIcon,
} from "lucide-react";
import { EGYPTIAN_CHURCHES_REGISTRY, ChurchRecord } from "@/data/churches-egypt";

interface MapLocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (data: {
    locationName: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
    saveAsDefault?: boolean;
  }) => void;
  initialLocation: {
    locationName: string;
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  source: "church_registry" | "google_maps" | "coordinates" | "osm";
  isChurch?: boolean;
}

export default function MapLocationPicker({
  isOpen,
  onClose,
  onSelectLocation,
  initialLocation,
}: MapLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [lat, setLat] = useState(initialLocation.latitude || 26.5565);
  const [lng, setLng] = useState(initialLocation.longitude || 31.6958);
  const [radius, setRadius] = useState(initialLocation.radiusMeters || 100);
  const [name, setName] = useState(initialLocation.locationName || "");
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Search in Map states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Map instance references
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const churchMarkersLayerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setLat(initialLocation.latitude || 26.5565);
      setLng(initialLocation.longitude || 31.6958);
      setRadius(initialLocation.radiusMeters || 100);
      setName(initialLocation.locationName || "");
      setSearchQuery("");
      setSearchResults([]);
    }
  }, [isOpen, initialLocation]);

  // Load Leaflet dynamically on client
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    const loadLeaflet = async () => {
      try {
        if (!(window as any).L) {
          // Add Leaflet CSS
          if (!document.getElementById("leaflet-css")) {
            const link = document.createElement("link");
            link.id = "leaflet-css";
            link.rel = "stylesheet";
            link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
            document.head.appendChild(link);
          }

          // Add Leaflet JS
          await new Promise<void>((resolve, reject) => {
            if (document.getElementById("leaflet-js")) {
              resolve();
              return;
            }
            const script = document.createElement("script");
            script.id = "leaflet-js";
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load map library"));
            document.body.appendChild(script);
          });
        }

        if (!isMounted || !mapContainerRef.current) return;

        const L = (window as any).L;
        if (!L) return;

        // Clean up previous map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize map
        const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
        mapInstanceRef.current = map;

        // Tile Layer: OpenStreetMap with Arabic labels
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        // Custom Cross/Church Icon for churches and landmarks
        const churchIcon = L.divIcon({
          className: "custom-church-marker",
          html: `<div style="background-color: #640810; color: #DCA40C; border: 2px solid #DCA40C; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3); font-size: 14px; font-weight: bold; line-height: 24px; text-align: center; cursor: pointer;">☦</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        // Layer group for Landmark Churches
        const churchLayer = L.layerGroup().addTo(map);
        churchMarkersLayerRef.current = churchLayer;

        EGYPTIAN_CHURCHES_REGISTRY.forEach((church: ChurchRecord) => {
          const m = L.marker([church.lat, church.lng], { icon: churchIcon }).addTo(churchLayer);
          m.bindTooltip(
            `<div style="text-align: right; direction: rtl; font-family: sans-serif; padding: 2px 4px;">
              <strong style="color: #640810; font-size: 12px;">${church.name}</strong><br/>
              <span style="font-size: 11px; color: #4b5563;">${church.area} • ${church.city}</span><br/>
              <span style="font-size: 10px; color: #2563eb; font-weight: bold;">(انقر لتحديد موقع البروفة هنا)</span>
             </div>`,
            { direction: "top", offset: [0, -12] }
          );

          m.on("click", () => {
            setName(church.name);
            updateMapPosition(church.lat, church.lng, radius);
          });
        });

        // Main Selected Location Marker (Draggable)
        const selectedIcon = L.divIcon({
          className: "custom-selected-marker",
          html: `<div style="background-color: #DCA40C; color: #640810; border: 3px solid #640810; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4); font-size: 18px; line-height: 30px; text-align: center; cursor: grab;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });

        const marker = L.marker([lat, lng], { draggable: true, icon: selectedIcon }).addTo(map);
        markerRef.current = marker;

        // Geofence Radius Circle
        const circle = L.circle([lat, lng], {
          radius: radius,
          color: "#640810",
          fillColor: "#DCA40C",
          fillOpacity: 0.25,
          weight: 2,
        }).addTo(map);
        circleRef.current = circle;

        // Map Click: place marker and update
        map.on("click", (e: any) => {
          const newLat = Math.round(e.latlng.lat * 10000) / 10000;
          const newLng = Math.round(e.latlng.lng * 10000) / 10000;
          setLat(newLat);
          setLng(newLng);
          marker.setLatLng([newLat, newLng]);
          circle.setLatLng([newLat, newLng]);
        });

        // Marker Drag: update coordinates
        marker.on("dragend", (e: any) => {
          const newPos = e.target.getLatLng();
          const newLat = Math.round(newPos.lat * 10000) / 10000;
          const newLng = Math.round(newPos.lng * 10000) / 10000;
          setLat(newLat);
          setLng(newLng);
          circle.setLatLng([newLat, newLng]);
        });

        // Size invalidation to load all tiles correctly
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (err: any) {
        setMapError("فشل تحميل الخريطة التفاعلية، يمكنك إدخال الإحداثيات يدوياً.");
      }
    };

    loadLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isOpen]);

  // Update map coordinates
  const updateMapPosition = (newLat: number, newLng: number, newRadius: number) => {
    setLat(newLat);
    setLng(newLng);
    setRadius(newRadius);

    if (mapInstanceRef.current && markerRef.current && circleRef.current) {
      markerRef.current.setLatLng([newLat, newLng]);
      circleRef.current.setLatLng([newLat, newLng]);
      circleRef.current.setRadius(newRadius);
      mapInstanceRef.current.flyTo([newLat, newLng], 16, { duration: 0.8 });
    }
  };

  // Perform search using Backend API (Church Registry + Google Maps Resolver + Komoot Photon + Nominatim)
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setIsSearching(true);
    setShowSearchResults(true);
    setMapError(null);

    try {
      const res = await fetch(`/api/admin/maps/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = (await res.json()) as { results?: SearchResult[] };
      const items: SearchResult[] = data.results || [];
      setSearchResults(items);

      if (items.length === 0) {
        setMapError("لم يتم العثور على نتائج. جرّب كتابة اسم الكنيسة (مثل: العذراء الزيتون) أو الصق رابط Google Maps مباشرة.");
      } else if (items.length === 1 && (items[0].source === "google_maps" || items[0].source === "coordinates")) {
        // Auto-select if direct Google Maps link or coordinates paste
        handleSelectSearchResult(items[0]);
      }
    } catch {
      setMapError("تعذر الاتصال بخدمة البحث. تأكد من اتصال الإنترنت.");
    } finally {
      setIsSearching(false);
    }
  };

  // Select Search Result
  const handleSelectSearchResult = (result: SearchResult) => {
    const newLat = Math.round(result.latitude * 10000) / 10000;
    const newLng = Math.round(result.longitude * 10000) / 10000;
    setName(result.name);
    updateMapPosition(newLat, newLng, radius);
    setShowSearchResults(false);
  };

  // Get current device GPS location
  const handleAcquireCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("متصفحك لا يدعم خدمات تحديد الموقع الجغرافي");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const currentLat = Math.round(pos.coords.latitude * 10000) / 10000;
        const currentLng = Math.round(pos.coords.longitude * 10000) / 10000;
        updateMapPosition(currentLat, currentLng, radius);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert("تعذر الحصول على إحداثياتك الحالية: " + err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    onSelectLocation({
      locationName: name.trim() || "كنيسة السيدة العذراء مريم — قاعة الكورال",
      latitude: lat,
      longitude: lng,
      radiusMeters: radius,
      saveAsDefault,
    });
    onClose();
  };

  const isGoogleMapsQuery =
    searchQuery.includes("maps.app.goo.gl") ||
    searchQuery.includes("goo.gl/maps") ||
    searchQuery.includes("google.com/maps") ||
    searchQuery.includes("maps.google.com");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl border border-gold/40 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-surface-border">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-burgundy text-gold flex items-center justify-center shadow-xs">
              <Church className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-burgundy">
                الخريطة التفاعلية: الكنائس والمنشآت الحيوية
              </h3>
              <p className="text-[11px] text-charcoal-muted">
                ابحث باسم الكنيسة، الصق رابط Google Maps، أو اختر علامة ☦ من الخريطة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-surface-canvas text-charcoal-muted hover:text-charcoal cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto py-3 space-y-3.5 flex-1 pr-1">
          {/* SEARCH BAR IN MAP */}
          <div className="relative">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <div className="relative flex-1">
                {isGoogleMapsQuery ? (
                  <LinkIcon className="w-4 h-4 text-blue-600 absolute right-3.5 top-3" />
                ) : (
                  <Search className="w-4 h-4 text-charcoal-muted absolute right-3.5 top-3" />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!showSearchResults && e.target.value.length > 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchResults(true);
                  }}
                  placeholder="ابحث باسم الكنيسة أو الدير بسوهاج (مثل: العذراء سوهاج، الدير الأبيض، مارجرجس أخميم...) أو الصق رابط خرائط جوجل..."
                  className="w-full pr-10 pl-12 py-2.5 rounded-2xl bg-surface-canvas border border-surface-border text-xs font-semibold text-charcoal focus:border-gold focus:ring-2 focus:ring-gold/30 outline-none shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSearchResults([]);
                      setShowSearchResults(false);
                      setMapError(null);
                    }}
                    className="absolute left-3 top-2.5 text-charcoal-muted hover:text-charcoal text-xs bg-gray-200/70 hover:bg-gray-200 px-2 py-0.5 rounded-md cursor-pointer"
                  >
                    مسح
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-burgundy hover:bg-burgundy-900 transition-colors flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>بحث</span>
              </button>
            </form>

            {/* Quick banner if Google Maps link detected */}
            {isGoogleMapsQuery && (
              <div className="mt-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between animate-in fade-in duration-150">
                <span className="flex items-center gap-1.5 font-medium">
                  <Navigation className="w-3.5 h-3.5 text-blue-600" />
                  تم رصد رابط Google Maps! اضغط زر <strong>بحث</strong> لاستخراج الإحداثيات فوراً.
                </span>
                <button
                  type="button"
                  onClick={() => handleSearch()}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-bold text-[10px] hover:bg-blue-700 cursor-pointer shrink-0"
                >
                  تحديد الموقع الآن
                </button>
              </div>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full right-0 left-0 mt-1.5 bg-white border border-gold/40 rounded-2xl shadow-xl z-30 overflow-hidden divide-y divide-surface-border animate-in fade-in zoom-in-95 duration-150 max-h-64 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-right p-3 hover:bg-gold-50/70 flex items-start gap-2.5 transition-colors text-xs cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-xl bg-burgundy/10 text-burgundy group-hover:bg-burgundy group-hover:text-gold transition-colors shrink-0 mt-0.5">
                      {result.source === "google_maps" ? (
                        <Navigation className="w-4 h-4 text-blue-600" />
                      ) : result.isChurch || result.source === "church_registry" ? (
                        <Church className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <strong className="block text-charcoal font-bold truncate group-hover:text-burgundy">
                          {result.name}
                        </strong>
                        {result.source === "church_registry" && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-burgundy/10 text-burgundy border border-burgundy/20">
                            ☦ كنيسة معتمدة
                          </span>
                        )}
                        {result.source === "google_maps" && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            📍 Google Maps
                          </span>
                        )}
                        {result.source === "coordinates" && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                            🌐 إحداثيات
                          </span>
                        )}
                        {result.source === "osm" && (
                          <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-charcoal-muted">
                            خريطة
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-charcoal-muted line-clamp-1">
                        {result.address}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Churches Strip (Landmarks on Map) */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-charcoal-muted flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-gold" />
                أشهر كنائس وأديرة محافظة سوهاج (انقر للتحديد فوراً):
              </span>
              <span className="text-[10px] text-burgundy font-medium">☦ علامات ظاهرة ع الخريطة</span>
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
              {EGYPTIAN_CHURCHES_REGISTRY.slice(0, 18).map((church) => (
                <button
                  key={church.id}
                  type="button"
                  onClick={() => {
                    setName(church.name);
                    updateMapPosition(church.lat, church.lng, radius);
                  }}
                  className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-surface-canvas hover:bg-gold-50 hover:text-burgundy border border-surface-border transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="text-burgundy font-bold">☦</span>
                  <span>{church.name.split("—")[0].replace("الشهيد العظيم ", "").replace("مطرانية السيدة العذراء مريم بسوهاج (المقر المطراني)", "مطرانية سوهاج")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Canvas */}
          <div className="relative rounded-2xl overflow-hidden border border-surface-border h-72 w-full shadow-inner bg-gray-100">
            <div ref={mapContainerRef} className="w-full h-full z-10" />

            {/* Current GPS button floating on map */}
            <button
              type="button"
              onClick={handleAcquireCurrentLocation}
              disabled={gpsLoading}
              className="absolute top-3 right-3 z-20 bg-white hover:bg-gray-50 text-charcoal px-3 py-1.5 rounded-xl shadow-md border border-surface-border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Crosshair className={`w-3.5 h-3.5 text-burgundy ${gpsLoading ? "animate-spin" : ""}`} />
              <span>{gpsLoading ? "جاري التحديد..." : "موقعي الحالي بالـ GPS"}</span>
            </button>

            {/* Map Legend Floating Tag */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-xs border border-surface-border text-[10px] text-charcoal font-medium flex items-center gap-2">
              <span className="flex items-center gap-1 text-burgundy font-bold">
                <span>☦</span> كنائس ومعالم
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-gold-700 font-bold">
                <span>📍</span> مكان البروفة المختار
              </span>
            </div>

            {mapError && (
              <div className="absolute inset-0 bg-white/90 z-20 flex items-center justify-center p-4 text-center">
                <p className="text-xs text-red-600 flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {mapError}
                </p>
              </div>
            )}
          </div>

          {/* Coordinate Details Form */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-bold text-charcoal mb-1">
                اسم قاعة البروفة / الكنيسة:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مطرانية السيدة العذراء مريم بسوهاج — قاعة الكورال"
                className="w-full px-3 py-2 rounded-xl bg-surface-canvas border border-surface-border focus:border-gold outline-none font-semibold text-charcoal"
              />
            </div>

            <div>
              <label className="block text-[10px] text-charcoal-muted mb-0.5">خط العرض (Latitude):</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  updateMapPosition(val, lng, radius);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-surface-canvas border border-surface-border font-mono font-bold text-charcoal text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-charcoal-muted mb-0.5">خط الطول (Longitude):</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  updateMapPosition(lat, val, radius);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-surface-canvas border border-surface-border font-mono font-bold text-charcoal text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] text-charcoal-muted mb-0.5">نصف القطر (بالمتر):</label>
              <select
                value={radius}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateMapPosition(lat, lng, val);
                }}
                className="w-full px-3 py-1.5 rounded-xl bg-surface-canvas border border-surface-border font-bold text-charcoal text-xs"
              >
                <option value={50}>50 متراً (قاعة داخلية دقيقة)</option>
                <option value={100}>100 متراً (افتراضي - مجمع الكنيسة)</option>
                <option value={150}>150 متراً (نطاق واسع)</option>
                <option value={200}>200 متراً (محيط الكنيسة والشارع)</option>
              </select>
            </div>
          </div>

          {/* Option to Save as Default Church Location */}
          <div className="bg-gold-50/70 border border-gold-200 rounded-2xl p-3 flex items-center gap-2.5">
            <input
              type="checkbox"
              id="saveDefault"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-4 h-4 rounded text-burgundy focus:ring-gold accent-burgundy cursor-pointer"
            />
            <label htmlFor="saveDefault" className="text-xs text-charcoal font-semibold cursor-pointer select-none">
              حفظ هذا الموقع كموقع الكنيسة الافتراضي لجميع البروفات القادمة تلقائياً
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-surface-border flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal hover:bg-surface-canvas transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-burgundy text-white hover:bg-burgundy-900 shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 text-gold" />
            <span>تأكيد واختيار هذا الموقع للبروفة</span>
          </button>
        </div>
      </div>
    </div>
  );
}
