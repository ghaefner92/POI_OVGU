import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
} from '@dnd-kit/core';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";
import { Language, TransportMode, POI } from './types';
import { MAGDEBURG_CENTER, TRANSLATIONS, TRANSPORT_ICONS, BRAND_MAROON, FLUORESCENT_CYAN, SACHSEN_ANHALT_BOUNDS, NOMINATIM_VIEWBOX, URBAN_TILE_URL, TILE_OPTIONS } from './constants';
import LanguageSwitch from './components/LanguageSwitch';
import TransportSource from './components/TransportSource';
import POICard from './components/POICard';
import Tutorial from './components/Tutorial';

// Custom CSS for subtle pulsing
const pulseStyles = `
  @keyframes marker-soft-pulse {
    0% { transform: scale(1); opacity: 0.8; }
    50% { transform: scale(1.6); opacity: 0.3; }
    100% { transform: scale(2.2); opacity: 0; }
  }
`;

// Helper for generating unique IDs
const generateId = () => `poi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Fix Leaflet marker icon issues
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createMarkerIcon = (color: string, isSelected: boolean = false) => {
  // Fix: Tailwind JIT needs literal class names to be present in the source code
  const pulseColorClass = color === BRAND_MAROON ? 'bg-[#93132B]' : 'bg-red-500';
  
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        ${isSelected ? `
          <div class="absolute w-12 h-12 ${pulseColorClass} rounded-full opacity-0" 
               style="animation: marker-soft-pulse 2s infinite ease-out;"></div>
          <div class="absolute w-12 h-12 ${pulseColorClass} rounded-full opacity-0" 
               style="animation: marker-soft-pulse 2s infinite ease-out 1s;"></div>
        ` : ''}
        <div class="${isSelected ? 'scale-125 transition-all duration-500 ease-out' : 'transition-all duration-300'}" 
             style="filter: drop-shadow(0 ${isSelected ? '12px 20px' : '4px 8px'} rgba(0,0,0,0.2))">
          <svg width="${isSelected ? '48' : '36'}" height="${isSelected ? '48' : '36'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21C16 17.5 19 14.4087 19 10.5C19 6.63401 15.866 3.5 12 3.5C8.13401 3.5 5 6.63401 5 10.5C5 14.4087 8 17.5 12 21Z" fill="${color}" stroke="white" stroke-width="2.5"/>
            <circle cx="12" cy="10.5" r="3.5" fill="white"/>
          </svg>
        </div>
      </div>`,
    className: '',
    iconSize: isSelected ? [48, 48] : [36, 36],
    iconAnchor: isSelected ? [24, 48] : [18, 36]
  });
};

const createBackgroundPoiIcon = () => L.divIcon({
  html: `<div class="w-3 h-3 bg-slate-300/40 rounded-full border border-white shadow-sm transition-all hover:scale-150 hover:bg-[#93132B60] hover:opacity-100 group"></div>`,
  className: '',
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const defaultIcon = createMarkerIcon(BRAND_MAROON);
const selectedIcon = createMarkerIcon("#FF3B30", true); 
const incompleteIcon = createMarkerIcon("#CBD5E1"); 
const backgroundPoiIcon = createBackgroundPoiIcon();

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) { 
      // Ensure we are within bounds before allowing a click
      if (SACHSEN_ANHALT_BOUNDS.contains(e.latlng)) {
        onMapClick(e.latlng.lat, e.latlng.lng); 
      }
    },
  });
  return null;
};

const MapController = ({ center, zoom }: { center: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (zoom) {
      map.flyTo(center, zoom, { animate: true, duration: 1.2, easeLinearity: 0.25 });
    } else {
      map.panTo(center, { animate: true, duration: 0.6 });
    }
  }, [center, zoom, map]);
  return null;
};

const AppLogo = React.memo(() => (
  <div className="flex items-center justify-center w-10 h-10 bg-[#93132B] rounded-xl shadow-lg shadow-[#93132B20] mr-3 shrink-0">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  </div>
));

const getCategoryIcon = (res: any) => {
  if (res.source === 'gemini') return '✨';
  const category = res.class;
  const type = res.type;
  if (category === 'amenity') {
    if (type === 'cafe' || type === 'restaurant') return '🍴';
    if (type === 'school' || type === 'university') return '🏫';
    if (type === 'hospital') return '🏥';
    return '🏢';
  }
  if (category === 'leisure') return '🌳';
  if (category === 'shop') return '🛍️';
  return '📍';
};

interface CityPoi {
  name: string;
  lat: number;
  lng: number;
}

export default function App() {
  const [lang, setLang] = useState<Language>(Language.DE);
  const [pois, setPois] = useState<POI[]>([]);
  const [cityPois, setCityPois] = useState<CityPoi[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAGDEBURG_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [cityBoundary, setCityBoundary] = useState<any>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, any[]>>(new Map());
  const t = TRANSLATIONS[lang];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const completedPoisCount = useMemo(() => pois.filter(p => p.transportMode !== null).length, [pois]);
  const isValidCount = pois.length >= 3 && pois.length <= 6;
  const canSave = isValidCount && (completedPoisCount === pois.length) && pois.length > 0;
  const completionPercentage = pois.length > 0 ? (completedPoisCount / Math.max(pois.length, 3)) * 100 : 0;

  // Optimized Overpass API fetcher with robust error handling
  const fetchOpenSourcePois = useCallback(async () => {
    try {
      const overpassQuery = `[out:json][timeout:25];(node["amenity"~"restaurant|cafe|bar|fast_food|pub"](52.03,11.45,52.23,11.78);node["shop"](52.03,11.45,52.23,11.78);node["tourism"~"hotel|museum|attraction"](52.03,11.45,52.23,11.78);node["leisure"~"park|playground"](52.03,11.45,52.23,11.78););out body 200;`;
      const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Overpass returned status ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // This is where the XML/HTML error page usually comes from
        const text = await response.text();
        console.warn("Overpass API returned non-JSON response. Likely server overload or error. Response starting with:", text.substring(0, 50));
        return; 
      }

      const data = await response.json();
      
      if (data && data.elements) {
        const extracted = data.elements
          .filter((el: any) => el.tags && (el.tags.name || el.tags.operator))
          .map((el: any) => ({
            name: el.tags.name || el.tags.operator,
            lat: el.lat,
            lng: el.lon
          }));
        setCityPois(extracted);
      }
    } catch (err) { 
      console.error("Failed to fetch Overpass data:", err); 
    }
  }, []);

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.textContent = pulseStyles;
    document.head.appendChild(styleTag);

    const hasSeenTutorial = localStorage.getItem('ovgu_mobility_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
    
    fetchOpenSourcePois();
    
    const fetchBoundary = async () => {
      try {
        const res = await fetch('https://nominatim.openstreetmap.org/search?q=Magdeburg&format=json&polygon_geojson=1&limit=1');
        const data = await res.json();
        if (data && data[0] && data[0].geojson) setCityBoundary(data[0].geojson);
      } catch (err) { console.error("Failed to fetch city boundary", err); }
    };
    fetchBoundary();
  }, [fetchOpenSourcePois]);

  const handleOpenNewTab = () => { window.open(window.location.href, '_blank'); };

  const performSearch = useCallback(async (query: string) => {
    const qRaw = query.trim();
    const qLower = qRaw.toLowerCase();
    if (qRaw.length < 3) return;
    if (searchCache.current.has(qLower)) {
      setSearchResults(searchCache.current.get(qLower) || []);
      return;
    }
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;
    setIsSearching(true);
    try {
      const refinedQuery = qLower.includes('magdeburg') ? qRaw : `${qRaw}, Magdeburg`;
      const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(refinedQuery)}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=6&addressdetails=1`, { signal });
      const osmResults = await osmRes.json();
      setSearchResults(osmResults);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const aiResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Precisely locate "${qRaw}" in the city of Magdeburg.`,
        config: { tools: [{ googleSearch: {} }] },
      });

      const aiNames = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((c: any) => c.web?.title || c.maps?.title).filter(Boolean).slice(0, 3) || [];
      if (aiNames.length > 0) {
        const geocodeResults = await Promise.all(aiNames.map(async (name: string) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ', Magdeburg')}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=1`, { signal });
            const data = await res.json();
            return data.length > 0 ? { ...data[0], source: 'gemini' } : null;
          } catch { return null; }
        }));
        const combined = [...geocodeResults.filter(Boolean), ...osmResults];
        const seen = new Set();
        const final = combined.filter(item => {
          const id = item.place_id || item.display_name;
          if (seen.has(id)) return false;
          seen.add(id);
          return true;
        });
        setSearchResults(final);
        searchCache.current.set(qLower, final);
      } else { searchCache.current.set(qLower, osmResults); }
    } catch (err: any) { if (err.name !== 'AbortError') console.error(err); } 
    finally { setIsSearching(false); }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { if (searchQuery.trim().length > 2) performSearch(searchQuery); else setSearchResults([]); }, 250); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const addPoiAtLocation = useCallback(async (lat: number, lng: number, providedName?: string) => {
    if (pois.length >= 6) return;
    
    // Check for existing POI very close to click to prevent duplicates
    const existing = pois.find(p => Math.abs(p.lat - lat) < 0.00015 && Math.abs(p.lng - lng) < 0.00015);
    if (existing) {
      setEditingPoiId(existing.id);
      setMapCenter([existing.lat, existing.lng]);
      return;
    }

    const id = generateId();
    const newPoi: POI = {
      id,
      name: providedName || "Searching location...",
      lat,
      lng,
      transportMode: null,
      frequencyIndex: 0
    };

    setPois(prev => [...prev, newPoi]);
    setEditingPoiId(id);
    setMapCenter([lat, lng]);
    setMapZoom(17);
    setSearchResults([]);
    setSearchQuery('');

    // Background reverse geocoding if name not provided
    if (!providedName) {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await res.json();
        const finalName = data.display_name ? data.display_name.split(',')[0] : "Point of Interest";
        setPois(prev => prev.map(p => p.id === id ? { ...p, name: finalName } : p));
      } catch (e) {
        setPois(prev => prev.map(p => p.id === id ? { ...p, name: "Marked Location" } : p));
      }
    }
  }, [pois]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('poi-')) {
      const poiId = over.data.current?.poiId;
      if (active.data.current?.mode) setPois(prev => prev.map(p => p.id === poiId ? { ...p, transportMode: active.data.current.mode } : p));
      if (active.data.current?.frequencyIndex !== undefined) setPois(prev => prev.map(p => p.id === poiId ? { ...p, frequencyIndex: active.data.current.frequencyIndex } : p));
      setEditingPoiId(poiId);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row bg-[#F9FAFB] overflow-hidden text-slate-900 selection:bg-[#93132B20]">
      {/* Sidebar */}
      <div className="w-full md:w-[460px] flex flex-col bg-white z-20 overflow-hidden shrink-0 shadow-2xl border-r border-slate-100">
        <header className="p-8 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <AppLogo />
              <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none mb-1">
                <span className="text-[#93132B]">POI</span> Selector
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleOpenNewTab} 
                className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#93132B] hover:bg-[#93132B10] transition-all"
                title={t.openNewTab}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </button>
              <button onClick={() => setShowTutorial(true)} className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-[#93132B] hover:bg-[#93132B10] transition-colors">
                <span className="text-sm font-bold">?</span>
              </button>
              <LanguageSwitch current={lang} onChange={setLang} />
            </div>
          </div>

          <div className="relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              disabled={pois.length >= 6}
              className={`w-full pl-6 pr-14 py-4 bg-slate-50 border-transparent rounded-2xl text-sm font-medium focus:ring-4 focus:ring-[#93132B08] focus:bg-white focus:border-[#93132B20] outline-none transition-all shadow-inner ${pois.length >= 6 ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300">
              {isSearching ? <div className="animate-spin h-5 w-5 border-2 border-[#93132B] border-t-transparent rounded-full" /> : 
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            </div>
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-2xl shadow-3xl overflow-hidden z-50 max-h-[300px] overflow-y-auto custom-scrollbar">
                {searchResults.map((res, i) => (
                  <button key={i} onClick={() => addPoiAtLocation(parseFloat(res.lat), parseFloat(res.lon), res.display_name.split(',')[0])} className="w-full text-left px-5 py-3 hover:bg-[#93132B05] transition-colors border-b last:border-0 border-slate-50 flex items-center gap-3">
                    <span className="text-xl">{getCategoryIcon(res)}</span>
                    <div className="truncate"><span className="block font-bold text-slate-800 truncate">{res.display_name.split(',')[0]}</span><span className="text-[10px] text-slate-400 font-medium">{res.display_name.split(',').slice(1, 3).join(',')}</span></div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <div className="px-8 mb-4 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <div>
               <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{t.addedPois}</h2>
               <p className={`text-[9px] font-bold uppercase mt-0.5 tracking-tighter ${isValidCount ? 'text-green-500' : 'text-orange-500'}`}>
                  {pois.length < 3 ? t.poiNeeded : (pois.length > 6 ? t.poiTooMany : '✓ Count (3-6)')}
               </p>
            </div>
          </div>
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ease-out ${isValidCount ? 'bg-green-500' : 'bg-orange-400'}`} style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto px-8 py-2 custom-scrollbar">
            {pois.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                 <div className="w-24 h-24 bg-slate-50 rounded-3xl mb-4 flex items-center justify-center text-5xl">📍</div>
                 <p className="text-xs font-black uppercase tracking-widest text-slate-400 max-w-[200px] mb-2">{t.noPois}</p>
                 <div className="px-4 py-2 bg-[#93132B08] rounded-2xl border border-[#93132B10]">
                    <p className="text-[10px] text-[#93132B] font-black uppercase tracking-widest">{t.poiRequirement}</p>
                 </div>
              </div>
            ) : (
              <div className="space-y-4 pb-8">
                {pois.map(poi => (
                  <POICard 
                    key={poi.id} poi={poi} lang={lang} isEditing={editingPoiId === poi.id} 
                    onEditToggle={() => {
                      const isNowEditing = editingPoiId !== poi.id;
                      setEditingPoiId(isNowEditing ? poi.id : null);
                      if (isNowEditing) { setMapCenter([poi.lat, poi.lng]); setMapZoom(17); }
                    }} 
                    onRemove={(id) => setPois(p => p.filter(x => x.id !== id))} 
                    onFrequencyChange={(id, idx) => setPois(p => p.map(x => x.id === id ? {...x, frequencyIndex: idx} : x))} 
                    onNameChange={(id, n) => setPois(p => p.map(x => x.id === id ? {...x, name: n} : x))} 
                    onClearTransport={() => setPois(prev => prev.map(p => p.id === poi.id ? { ...p, transportMode: null } : p))}
                  />
                ))}
              </div>
            )}
          </div>

          <footer className="p-8 pb-10 bg-[#F9FAFB] border-t border-slate-100 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] shrink-0">
            <div className="grid grid-cols-5 gap-3 mb-8">
              {Object.values(TransportMode).slice(0, 10).map(mode => <TransportSource key={mode} mode={mode} lang={lang} />)}
            </div>
            
            <div className="relative">
              {!canSave && pois.length > 0 && (
                <div className="absolute -top-8 left-0 right-0 text-center animate-bounce">
                  <span className="text-[9px] font-black text-[#93132B] uppercase tracking-tighter bg-white px-3 py-1.5 rounded-full border border-[#93132B20] shadow-xl">
                    {pois.length < 3 ? t.poiNeeded : (completedPoisCount < pois.length ? t.modeMissing : '')}
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsFinalized(true)}
                disabled={!canSave}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-[0.98] ${
                  !canSave ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 
                  'bg-[#93132B] text-white hover:bg-[#7a0f24] shadow-[#93132B30] ring-4 ring-[#93132B10]'
                }`}
              >
                {t.saveData}
              </button>
            </div>
          </footer>
        </DndContext>
      </div>

      {/* Main Map Content */}
      <div className="flex-1 relative h-full">
        <MapContainer 
          center={MAGDEBURG_CENTER} 
          zoom={14} 
          minZoom={12} 
          maxZoom={TILE_OPTIONS.maxZoom} 
          maxBounds={SACHSEN_ANHALT_BOUNDS} 
          maxBoundsViscosity={1.0} 
          style={{ height: '100%', width: '100%', background: '#f8f8f7' }}
        >
          <TileLayer {...TILE_OPTIONS} url={URBAN_TILE_URL} />
          {cityBoundary && (
            <GeoJSON 
              data={cityBoundary} 
              style={{ color: FLUORESCENT_CYAN, weight: 3, fillOpacity: 0.04, fillColor: FLUORESCENT_CYAN, dashArray: '8, 12' }} 
            />
          )}
          
          {/* Background Selectable Dots (Overpass Data) */}
          {cityPois.map((cp, idx) => (
            <Marker 
              key={`bg-poi-${idx}`} 
              position={[cp.lat, cp.lng]} 
              icon={backgroundPoiIcon} 
              interactive={true}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  addPoiAtLocation(cp.lat, cp.lng, cp.name);
                }
              }}
            >
              <Tooltip direction="top" opacity={0.8} className="bg-white/95 border-none shadow-xl text-[9px] font-black text-[#93132B] uppercase tracking-tighter px-2 py-1 rounded-md pointer-events-none">
                {cp.name}
              </Tooltip>
            </Marker>
          ))}

          <MapEvents onMapClick={addPoiAtLocation} />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {/* Active POIs */}
          {pois.map(poi => (
            <Marker 
              key={poi.id} 
              position={[poi.lat, poi.lng]} 
              icon={editingPoiId === poi.id ? selectedIcon : (poi.transportMode ? defaultIcon : incompleteIcon)}
              eventHandlers={{ click: (e) => { 
                L.DomEvent.stopPropagation(e); 
                setEditingPoiId(poi.id); 
                setMapCenter([poi.lat, poi.lng]); 
              }}}
              zIndexOffset={editingPoiId === poi.id ? 1000 : 0}
            >
              <Tooltip direction="top" offset={[0, -25]} opacity={1} permanent={editingPoiId === poi.id}>
                <div className="px-4 py-2 bg-white rounded-xl shadow-2xl border border-slate-50 pointer-events-none min-w-[100px]">
                  <p className="font-extrabold text-slate-800 border-b border-slate-50 pb-1.5 mb-1 truncate max-w-[160px]">{poi.name}</p>
                  <div className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                    {poi.transportMode ? <><span className="text-sm">{TRANSPORT_ICONS[poi.transportMode]}</span> {t.modes[poi.transportMode]}</> : <span className="text-orange-500 uppercase tracking-tighter">Information needed</span>}
                  </div>
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {showTutorial && <Tutorial lang={lang} onClose={() => { setShowTutorial(false); localStorage.setItem('ovgu_mobility_tutorial_seen', 'true'); }} />}
      {isFinalized && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-slate-900/30 backdrop-blur-md animate-in fade-in">
           <div className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-3xl text-center">
              <h2 className="text-3xl font-black mb-6">{t.finalizeTitle}</h2>
              <div className="bg-slate-50 p-6 rounded-3xl text-left mb-8 max-h-[300px] overflow-y-auto custom-scrollbar">
                 <ul className="space-y-3">
                   {pois.map(p => (
                     <li key={p.id} className="flex justify-between border-b pb-2 border-slate-100 last:border-0">
                       <span className="font-bold text-slate-800">{p.name}</span>
                       <span className="text-slate-500 font-medium">{p.transportMode ? t.modes[p.transportMode] : '?'} • {t.frequencies[p.frequencyIndex]}</span>
                     </li>
                   ))}
                 </ul>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-500">Back</button>
                 <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 rounded-2xl font-bold bg-green-600 text-white shadow-xl">Confirm All</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}