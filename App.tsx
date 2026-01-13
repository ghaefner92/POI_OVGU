
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap, GeoJSON, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";
import { Language, TransportMode, POI, PendingMarker } from './types';
import { 
  MAGDEBURG_CENTER, 
  TRANSLATIONS, 
  TRANSPORT_ICONS, 
  BRAND_MAROON, 
  SACHSEN_ANHALT_BOUNDS, 
  FREQUENCY_ICONS, 
  NOMINATIM_VIEWBOX,
  SACHSEN_ANHALT_GEOJSON,
  WORLD_MASK_GEOJSON
} from './constants';
import LanguageSwitch from './components/LanguageSwitch';
import POICard from './components/POICard';
import Tutorial from './components/Tutorial';

// Fix Leaflet marker icon issues
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createMarkerIcon = (color: string, isSelected: boolean = false) => L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      ${isSelected ? `
        <div class="absolute w-24 h-24 bg-red-500 rounded-full animate-ping opacity-20"></div>
        <div class="absolute w-16 h-16 bg-red-400 rounded-full animate-pulse opacity-30 blur-md"></div>
      ` : ''}
      <div class="${isSelected ? 'scale-125 transition-all duration-700 ease-out' : 'transition-all duration-300'}" 
           style="filter: drop-shadow(0 ${isSelected ? '10px 20px' : '4px 8px'} rgba(0,0,0,0.35))">
        <svg width="${isSelected ? '48' : '32'}" height="${isSelected ? '48' : '32'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21.5C16.5 17.8 19.5 14.2 19.5 10.5C19.5 6.4 16.1 3 12 3C7.9 3 4.5 6.4 4.5 10.5C4.5 14.2 7.5 17.8 12 21.5Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="10.5" r="3.5" fill="white"/>
        </svg>
      </div>
    </div>`,
  className: '',
  iconSize: isSelected ? [64, 64] : [32, 32],
  iconAnchor: isSelected ? [32, 64] : [16, 32]
});

// Defining icons for different POI states
const selectedIcon = createMarkerIcon(BRAND_MAROON, true);
const defaultIcon = createMarkerIcon(BRAND_MAROON, false);
const incompleteIcon = createMarkerIcon("#94a3b8", false);

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) { 
      if (SACHSEN_ANHALT_BOUNDS.contains(e.latlng)) {
        onMapClick(e.latlng.lat, e.latlng.lng); 
      }
    },
  });
  return null;
};

const MapController = ({ center, zoom, onReady }: { center: [number, number], zoom?: number, onReady: () => void }) => {
  const map = useMap();
  useEffect(() => { map.whenReady(onReady); }, [map, onReady]);
  useEffect(() => {
    if (zoom) map.flyTo(center, zoom, { animate: true, duration: 1.0 });
    else map.panTo(center, { animate: true, duration: 1.0 });
  }, [center, zoom, map]);
  return null;
};

const OVGULogo = React.memo(() => (
  <svg width="36" height="36" viewBox="0 0 100 100" className="mr-3 filter drop-shadow-sm">
    <rect width="100" height="100" rx="14" fill={BRAND_MAROON} />
    <path d="M30 30 L70 30 L70 45 L30 45 Z" fill="white" />
    <path d="M30 55 L70 55 L70 70 L30 70 Z" fill="white" />
    <circle cx="50" cy="50" r="10" fill={BRAND_MAROON} stroke="white" strokeWidth="4" />
  </svg>
));

const getCategoryIcon = (res: any) => {
  if (res.source === 'gemini') return '✨';
  const category = res.class || res.category || (res.tags && res.tags.amenity ? 'amenity' : null);
  const type = res.type || (res.tags && (res.tags.amenity || res.tags.shop || res.tags.tourism));
  const mapping: any = {
    amenity: { cafe: '☕', restaurant: '🍴', pub: '🍺', bar: '🍸', school: '🏫', hospital: '🏥', bank: '🏦', pharmacy: '⚕️' },
    tourism: { museum: '🏛️', gallery: '🖼️', hotel: '🏨', attraction: '🎡' },
    shop: { supermarket: '🛒', convenience: '🏪', bakery: '🥐', clothes: '👕' },
    historic: { castle: '🏰', monument: '🗿' }
  };
  return mapping[category || '']?.[type || ''] || '📍';
};

export default function App() {
  const [lang, setLang] = useState<Language>(Language.DE);
  const [pois, setPois] = useState<POI[]>([]);
  const [pendingMarkers, setPendingMarkers] = useState<PendingMarker[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingOSM, setIsSearchingOSM] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectingResultId, setSelectingResultId] = useState<string | number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAGDEBURG_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [overpassPois, setOverpassPois] = useState<any[]>([]);
  const [isFetchingOverpass, setIsFetchingOverpass] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, any[]>>(new Map());
  
  const t = TRANSLATIONS[lang];

  // Requirements: 3-6 POIs
  const isValidCount = pois.length >= 3 && pois.length <= 6;
  const isTooFew = pois.length < 3;
  const isTooMany = pois.length > 6;

  const mobilitySummary = useMemo(() => {
    let summary = `${t.summaryPrefix}\n\n`;
    pois.forEach((poi, index) => {
      summary += `**${index + 1}. ${poi.name}**\nMode: ${poi.transportMode ? t.modes[poi.transportMode] : t.modeMissing}\nFreq: ${t.frequencies[poi.frequencyIndex]}\n\n`;
    });
    return summary;
  }, [pois, t]);

  useEffect(() => {
    const seen = localStorage.getItem('ovgu_mobility_tutorial_seen');
    if (!seen) setShowTutorial(true);
  }, []);

  const fetchLocalPois = useCallback(async (bounds: L.LatLngBounds) => {
    setIsFetchingOverpass(true);
    const sw = bounds.getSouthWest(), ne = bounds.getNorthEast();
    const query = `[out:json][timeout:25];(node["amenity"](${sw.lat},${sw.lng},${ne.lat},${ne.lng});node["shop"](${sw.lat},${sw.lng},${ne.lat},${ne.lng}););out body;`;
    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Overpass Error");
      const text = await response.text();
      const data = JSON.parse(text); // Guard against non-JSON responses
      const mapped = (data.elements || []).filter((e: any) => e.tags && e.tags.name).map((e: any) => ({
        id: e.id, name: e.tags.name, lat: e.lat, lng: e.lon, tags: e.tags
      }));
      setOverpassPois(mapped);
    } catch (e) { console.error("POI Fetch Error:", e); } finally { setIsFetchingOverpass(false); }
  }, []);

  const performSearch = useCallback(async (query: string) => {
    const qRaw = query.trim().toLowerCase();
    if (qRaw.length < 3) return;
    if (searchCache.current.has(qRaw)) { setSearchResults(searchCache.current.get(qRaw) || []); return; }
    
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    
    setIsSearchingOSM(true); setIsSearchingAI(true);
    const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(qRaw + ", Magdeburg")}&limit=10&lat=${MAGDEBURG_CENTER[0]}&lon=${MAGDEBURG_CENTER[1]}`;
    
    fetch(photonUrl, { signal: abortControllerRef.current.signal })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        const results = (data.features || []).map((f: any) => ({
          display_name: f.properties.name || f.properties.street || "Place",
          lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0],
          place_id: f.properties.osm_id
        }));
        setSearchResults(results);
        searchCache.current.set(qRaw, results);
        setIsSearchingOSM(false);
      }).catch(() => setIsSearchingOSM(false));
      
    (async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const res = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Top 3 popular landmarks or frequent travel destinations for "${qRaw}" in Magdeburg, Germany. Names only.`,
          config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: { latitude: MAGDEBURG_CENTER[0], longitude: MAGDEBURG_CENTER[1] } } } }
        });
        const chunks = res.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const names = chunks.map((c: any) => c.maps?.title).filter(Boolean);
        if (names.length > 0) {
          const geocodes = await Promise.all(names.map(async (n) => {
             try {
               const gr = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(n + ", Magdeburg")}&limit=1`);
               if (!gr.ok) return null;
               const gd = await gr.json();
               return gd[0] ? { ...gd[0], source: 'gemini' } : null;
             } catch { return null; }
          }));
          const valid = geocodes.filter(Boolean);
          if (valid.length > 0) setSearchResults(prev => [...valid, ...prev]);
        }
      } catch (e) { console.error("AI Search Error:", e); } finally { setIsSearchingAI(false); }
    })();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { if (searchQuery.length > 2) performSearch(searchQuery); else setSearchResults([]); }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, performSearch]);

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat), lng = parseFloat(result.lon);
    const newPoi: POI = { id: `poi-${Date.now()}`, name: result.display_name.split(',')[0], lat, lng, transportMode: null, frequencyIndex: 0 };
    setPois(prev => [...prev, newPoi]);
    setEditingPoiId(newPoi.id);
    setMapCenter([lat, lng]); setMapZoom(17);
    setSearchResults([]); setSearchQuery('');
  };

  const handleMapClick = async (lat: number, lng: number) => {
    const opMatch = overpassPois.find(op => Math.abs(op.lat - lat) < 0.0003 && Math.abs(op.lng - lng) < 0.0003);
    if (opMatch) {
      const newPoi: POI = { id: `poi-op-${opMatch.id}`, name: opMatch.name, lat: opMatch.lat, lng: opMatch.lng, transportMode: null, frequencyIndex: 0 };
      setPois(prev => [...prev, newPoi]);
      setEditingPoiId(newPoi.id);
      return;
    }
    setPendingMarkers(prev => [...prev, { lat, lng }]);
  };

  const confirmSelection = async () => {
    setIsProcessing(true);
    const newPois = await Promise.all(pendingMarkers.map(async (m, i) => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${m.lat}&lon=${m.lng}&zoom=18`);
        if (!r.ok) throw new Error();
        const d = await r.json();
        const name = d.address?.amenity || d.address?.shop || d.address?.tourism || d.address?.road || "Location";
        return { id: `poi-${Date.now()}-${i}`, name, lat: m.lat, lng: m.lng, transportMode: null, frequencyIndex: 0 };
      } catch {
        return { id: `poi-${Date.now()}-${i}`, name: "Location", lat: m.lat, lng: m.lng, transportMode: null, frequencyIndex: 0 };
      }
    }));
    setPois(prev => [...prev, ...newPois]);
    setPendingMarkers([]);
    setIsProcessing(false);
    if (newPois.length > 0) setEditingPoiId(newPois[0].id);
  };

  const updateActivePoi = (updates: Partial<POI>) => {
    if (!editingPoiId) return;
    setPois(prev => prev.map(p => p.id === editingPoiId ? { ...p, ...updates } : p));
  };

  const finalizeStore = () => {
    setIsStoring(true);
    setTimeout(() => {
      setIsStoring(false);
      setIsStored(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFDFD] h-screen overflow-hidden font-sans text-gray-900">
      <div className="w-full md:w-[400px] flex flex-col border-r border-gray-100 bg-white z-20 overflow-hidden shrink-0 shadow-2xl">
        <header className="p-6 border-b bg-white relative z-30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <OVGULogo />
              <div className="flex flex-col">
                <h1 className="text-lg font-black text-[#1a1a1a] tracking-tight leading-tight">
                  <span className="text-[#93132B]">OVGU</span> Mobility
                </h1>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.imiqProject}</span>
              </div>
            </div>
            <LanguageSwitch current={lang} onChange={setLang} />
          </div>
          <div className="relative">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.searchPlaceholder} className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-[#93132B15] focus:border-[#93132B] focus:outline-none transition-all" />
            {(isSearchingOSM || isSearchingAI) && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-5 w-5 border-2 border-[#93132B] border-t-transparent rounded-full" />}
          </div>
          {searchResults.length > 0 && searchQuery.length > 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 mx-6 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
              {searchResults.map((res, i) => (
                <button key={i} onClick={() => selectSearchResult(res)} className="w-full text-left px-5 py-3 text-sm border-b hover:bg-gray-50 flex items-center gap-3">
                  <span className="text-lg">{getCategoryIcon(res)}</span>
                  <div className="flex-1 truncate"><span className="font-bold">{res.display_name.split(',')[0]}</span></div>
                </button>
              ))}
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/30 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t.addedPois}</h2>
            <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isValidCount ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
              {pois.length} / 6
            </div>
          </div>
          
          <div className="space-y-4 pb-20">
            {pois.length === 0 ? (
              <div className="py-12 text-center text-gray-400 leading-relaxed text-sm px-4">
                {t.noPois}
              </div>
            ) : (
              pois.map(poi => (
                <POICard key={poi.id} poi={poi} lang={lang} isEditing={editingPoiId === poi.id} onEditToggle={() => setEditingPoiId(poi.id)} onRemove={(id) => setPois(p => p.filter(x => x.id !== id))} onFrequencyChange={(id, idx) => updateActivePoi({ frequencyIndex: idx })} onNameChange={(id, n) => updateActivePoi({ name: n })} onClearTransport={() => updateActivePoi({ transportMode: null })} />
              ))
            )}
          </div>
        </div>

        <footer className="p-6 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="mb-4">
            {isTooFew && <p className="text-[10px] text-red-500 font-bold text-center animate-pulse">Add at least {3 - pois.length} more locations</p>}
            {isTooMany && <p className="text-[10px] text-red-500 font-bold text-center">Please remove some locations (max 6)</p>}
            {isValidCount && <p className="text-[10px] text-green-600 font-bold text-center">Perfect! Your profile is ready.</p>}
          </div>
          <button 
            onClick={() => setIsFinalized(true)} 
            disabled={!isValidCount} 
            className={`w-full py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-[0.95] ${!isValidCount ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none' : 'bg-[#93132B] text-white hover:bg-[#7a0f24]'}`}
          >
            {t.saveData}
          </button>
        </footer>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={MAGDEBURG_CENTER} zoom={13} minZoom={10} maxZoom={18} maxBounds={SACHSEN_ANHALT_BOUNDS} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" keepBuffer={8} />
          <GeoJSON data={WORLD_MASK_GEOJSON} style={{ fillColor: '#0f172a', fillOpacity: 0.65, stroke: false }} interactive={false} />
          <GeoJSON data={SACHSEN_ANHALT_GEOJSON} style={{ color: BRAND_MAROON, weight: 4, fillOpacity: 0, opacity: 0.8, dashArray: '5, 10' }} interactive={false} />
          
          {overpassPois.map(op => (
            <CircleMarker key={op.id} center={[op.lat, op.lng]} radius={4} pathOptions={{ color: BRAND_MAROON, weight: 1, fillOpacity: 0.2 }} eventHandlers={{ click: () => handleMapClick(op.lat, op.lng) }}>
              <Tooltip direction="top"><span>{op.name}</span></Tooltip>
            </CircleMarker>
          ))}
          
          <MapEvents onMapClick={handleMapClick} />
          <MapController center={mapCenter} zoom={mapZoom} onReady={() => setMapLoaded(true)} />
          
          {pois.map(poi => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={editingPoiId === poi.id ? selectedIcon : (poi.transportMode ? defaultIcon : incompleteIcon)} eventHandlers={{ click: () => { setEditingPoiId(poi.id); setMapCenter([poi.lat, poi.lng]); } }}>
              <Tooltip direction="top" permanent={editingPoiId === poi.id}><span>{poi.name}</span></Tooltip>
            </Marker>
          ))}
          
          {pendingMarkers.map((m, i) => <Marker key={i} position={[m.lat, m.lng]} icon={createMarkerIcon("#f59e0b")} />)}
          <OverpassFetcher zoom={mapZoom || 13} onFetch={fetchLocalPois} />
        </MapContainer>

        {/* QUICK ACTION HUD MENU */}
        {editingPoiId && (
          <div className="absolute inset-0 z-[4000] flex items-end justify-center pointer-events-none p-4 md:p-12">
            <div className="w-full max-w-2xl bg-white/95 backdrop-blur-3xl rounded-[2.5rem] shadow-4xl pointer-events-auto p-8 border border-white animate-in slide-in-from-bottom-24 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black text-gray-900 leading-tight">{pois.find(p => p.id === editingPoiId)?.name}</h3>
                  <p className="text-[10px] font-black text-[#93132B] uppercase tracking-widest mt-1">
                    {pois.find(p => p.id === editingPoiId)?.transportMode ? t.modes[pois.find(p => p.id === editingPoiId)!.transportMode!] : t.modeMissing}
                  </p>
                </div>
                <button onClick={() => setEditingPoiId(null)} className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 13l4 4L19 7" /></svg>
                </button>
              </div>

              <div className="space-y-8 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                <section>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">{t.transportLabel}</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {Object.values(TransportMode).map(mode => (
                      <button key={mode} onClick={() => updateActivePoi({ transportMode: mode })} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border-2 ${pois.find(p => p.id === editingPoiId)?.transportMode === mode ? 'border-[#93132B] bg-[#93132B08] scale-105' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                        <span className="text-2xl mb-1">{TRANSPORT_ICONS[mode]}</span>
                        <span className="text-[7px] font-black text-gray-400 uppercase truncate w-full text-center leading-none">{t.modes[mode].split(' ')[0]}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <label className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 block">{t.frequencyLabel}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {t.frequencies.map((label, idx) => (
                      <button key={idx} onClick={() => updateActivePoi({ frequencyIndex: idx })} className={`flex items-center gap-2 p-3 rounded-xl transition-all border-2 ${pois.find(p => p.id === editingPoiId)?.frequencyIndex === idx ? 'border-blue-500 bg-blue-50/30 scale-105' : 'border-gray-50 bg-white hover:border-gray-200'}`}>
                        <span className="text-xl">{FREQUENCY_ICONS[idx]}</span>
                        <span className="text-[8px] font-black text-gray-500 uppercase leading-tight text-left">{label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {pendingMarkers.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/95 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl border border-white">
            <div className="pl-6 pr-4 border-r border-gray-100 py-2"><span className="text-2xl font-black text-[#93132B]">{pendingMarkers.length}</span><span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.pendingCount}</span></div>
            <button onClick={confirmSelection} disabled={isProcessing} className="bg-[#93132B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#7a0f24] transition-all shadow-lg min-w-[140px]">{isProcessing ? t.processing : t.confirmSelection}</button>
            <button onClick={() => setPendingMarkers([])} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100">{t.clearSelection}</button>
          </div>
        )}
      </div>

      {showTutorial && <Tutorial lang={lang} onClose={() => setShowTutorial(false)} />}
      
      {isFinalized && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#93132B]/20 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-4xl flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-black text-[#1a1a1a] mb-6">{t.finalizeTitle}</h2>
            {!isStored ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-8 pr-2">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 whitespace-pre-wrap leading-relaxed text-sm text-gray-600">
                    {mobilitySummary.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-colors">Back</button>
                  <button onClick={finalizeStore} disabled={isStoring} className="flex-[2] bg-[#93132B] text-white py-4 rounded-2xl font-bold shadow-xl hover:bg-[#7a0f24] transition-all">{isStoring ? 'Storing...' : t.storeData}</button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 animate-in zoom-in-95">
                <div className="text-6xl mb-6">🏆</div>
                <h3 className="text-2xl font-black mb-2">{t.successMessage}</h3>
                <p className="text-gray-500 mb-8">{t.successDesc}</p>
                <button onClick={() => window.location.reload()} className="px-12 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold shadow-xl hover:scale-105 transition-all">Finish & Close</button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}

const OverpassFetcher = ({ zoom, onFetch }: { zoom: number, onFetch: (bounds: L.LatLngBounds) => void }) => {
  const map = useMap();
  const lastFetch = useRef(0);
  useMapEvents({ moveend: () => { if (map.getZoom() >= 15 && Date.now() - lastFetch.current > 3000) { onFetch(map.getBounds()); lastFetch.current = Date.now(); } } });
  return null;
}
