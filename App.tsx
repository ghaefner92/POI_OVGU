
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
import { Language, TransportMode, POI, PendingMarker, MapLayer } from './types';
import { 
  MAGDEBURG_CENTER, 
  TRANSLATIONS, 
  TRANSPORT_ICONS, 
  BRAND_MAROON, 
  SACHSEN_ANHALT_BOUNDS, 
  LAYER_ICONS, 
  FREQUENCY_ICONS, 
  NOMINATIM_VIEWBOX,
  SACHSEN_ANHALT_GEOJSON,
  WORLD_MASK_GEOJSON
} from './constants';
import LanguageSwitch from './components/LanguageSwitch';
import TransportSource from './components/TransportSource';
import FrequencySource from './components/FrequencySource';
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
        <div class="absolute w-10 h-10 bg-red-300 rounded-full animate-pulse opacity-40 blur-sm"></div>
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

const feedbackIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-32 h-32 bg-[#93132B] rounded-full animate-ping opacity-20"></div>
      <div class="absolute w-16 h-16 bg-[#93132B] rounded-full opacity-40 animate-pulse blur-sm"></div>
      <div class="z-10 bg-[#93132B] p-2 rounded-full border-2 border-white shadow-2xl scale-125 animate-bounce-short">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      </div>
    </div>`,
  className: '',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

const defaultIcon = createMarkerIcon(BRAND_MAROON);
const selectedIcon = createMarkerIcon("#FF3131", true); 
const incompleteIcon = createMarkerIcon("#94a3b8");

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
  
  useEffect(() => {
    map.whenReady(onReady);
  }, [map, onReady]);

  useEffect(() => {
    const animationOptions = {
      animate: true,
      duration: 1.5,
      easeLinearity: 0.1,
      noMoveStart: true
    };

    if (zoom) {
      map.flyTo(center, zoom, animationOptions);
    } else {
      map.panTo(center, animationOptions);
    }
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

export default function App() {
  const [lang, setLang] = useState<Language>(Language.DE);
  const [mapLayer, setMapLayer] = useState<MapLayer>(MapLayer.STANDARD);
  const [pois, setPois] = useState<POI[]>([]);
  const [pendingMarkers, setPendingMarkers] = useState<PendingMarker[]>([]);
  const [activeTransport, setActiveTransport] = useState<TransportMode | null>(null);
  const [activeFrequencyIndex, setActiveFrequencyIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearchingOSM, setIsSearchingOSM] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectingResultId, setSelectingResultId] = useState<string | number | null>(null);
  const [feedbackMarker, setFeedbackMarker] = useState<{lat: number, lng: number} | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAGDEBURG_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, any[]>>(new Map());
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const t = TRANSLATIONS[lang];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ovgu_mobility_tutorial_seen');
    if (!hasSeenTutorial) setShowTutorial(true);
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('ovgu_mobility_tutorial_seen', 'true');
  };

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

    setIsSearchingOSM(true);
    setIsSearchingAI(true);
    setSearchResults([]);

    const refinedQuery = qLower.includes('magdeburg') ? qRaw : `${qRaw}, Magdeburg`;
    
    // Fast Nominatim Search
    fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(refinedQuery)}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=5`,
      { signal }
    )
    .then(r => r.json())
    .then(osmResults => {
      setSearchResults(prev => {
        const existingIds = new Set(prev.map(r => r.place_id || r.display_name));
        const filtered = osmResults.filter((r: any) => !existingIds.has(r.place_id || r.display_name));
        return [...prev, ...filtered];
      });
      setIsSearchingOSM(false);
    })
    .catch(err => { if (err.name !== 'AbortError') setIsSearchingOSM(false); });

    // AI Enhanced Search (Background)
    (async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash-lite-latest", // Using lite for faster results
          contents: `Provide top 3 locations for "${qRaw}" in Magdeburg, Germany. Names only.`,
          config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: MAGDEBURG_CENTER[0], longitude: MAGDEBURG_CENTER[1] } } }
          },
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const aiNames = chunks.map((c: any) => c.maps?.title).filter(Boolean).slice(0, 3);
        
        if (aiNames.length > 0) {
          const geocodeResults = await Promise.all(
            aiNames.map(async (name: string) => {
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ", Magdeburg")}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=1`,
                  { signal }
                );
                const data = await res.json();
                return data.length > 0 ? { ...data[0], source: 'gemini' } : null;
              } catch { return null; }
            })
          );
          
          setSearchResults(prev => {
            const validNew = geocodeResults.filter(Boolean);
            const seen = new Set(prev.map(r => r.place_id || r.display_name));
            const uniqueAi = validNew.filter((item: any) => {
              const id = item.place_id || item.display_name;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            const updated = [...uniqueAi, ...prev];
            searchCache.current.set(qLower, updated);
            return updated;
          });
        }
      } catch (e) { console.error("AI Search Failed", e); }
      finally { setIsSearchingAI(false); }
    })();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) performSearch(searchQuery);
      else setSearchResults([]);
    }, 300); // Shorter debounce for snappier feel
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  const triggerFeedbackMarker = useCallback((lat: number, lng: number) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedbackMarker({ lat, lng });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackMarker(null);
    }, 2000);
  }, []);

  const selectSearchResult = (result: any) => {
    const resId = result.place_id || result.display_name;
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setSelectingResultId(resId);
    triggerFeedbackMarker(lat, lng);
    setMapCenter([lat, lng]);
    setMapZoom(17);

    setTimeout(() => {
      const newPoi: POI = {
        id: `poi-${Date.now()}`,
        name: result.display_name.split(',')[0],
        lat,
        lng,
        transportMode: null,
        frequencyIndex: 0
      };
      setPois(prev => [...prev, newPoi]);
      setNewlyAddedId(newPoi.id);
      setEditingPoiId(newPoi.id);
      setSearchResults([]);
      setSearchQuery('');
      setSelectingResultId(null);
      setTimeout(() => setNewlyAddedId(null), 2500);
    }, 800);
  };

  const handleMapClick = (lat: number, lng: number) => {
    setPendingMarkers(prev => {
      const isRemoving = prev.some(m => Math.abs(m.lat - lat) < 0.0005);
      if (isRemoving) return prev.filter(m => Math.abs(m.lat - lat) >= 0.0005);
      triggerFeedbackMarker(lat, lng);
      return [...prev, { lat, lng }];
    });
  };

  const confirmSelection = async () => {
    setIsProcessing(true);
    setFeedbackMarker(null);
    try {
      const reverseGeocodePromises = pendingMarkers.map(async (marker, idx) => {
        await new Promise(r => setTimeout(r, idx * 150));
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${marker.lat}&lon=${marker.lng}`);
        const data = await res.json();
        const id = `poi-${Date.now()}-${Math.random()}`;
        return {
          id,
          name: data.display_name ? data.display_name.split(',')[0] : `${t.summaryPointLabel} ${idx + 1}`,
          lat: marker.lat,
          lng: marker.lng,
          transportMode: null,
          frequencyIndex: 0
        };
      });
      const newPois = await Promise.all(reverseGeocodePromises);
      setPois(prev => [...prev, ...newPois]);
      setPendingMarkers([]);
      if (newPois.length > 0) {
        const lastPoi = newPois[newPois.length - 1];
        setEditingPoiId(lastPoi.id);
        setNewlyAddedId(lastPoi.id);
        setMapCenter([lastPoi.lat, lastPoi.lng]);
        setMapZoom(17);
        setTimeout(() => setNewlyAddedId(null), 2500);
      }
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('poi-')) {
      const poiId = over.data.current?.poiId;
      if (active.data.current?.mode) {
        const mode = active.data.current.mode as TransportMode;
        setPois(prev => prev.map(p => p.id === poiId ? { ...p, transportMode: mode } : p));
      }
      if (active.data.current?.frequencyIndex !== undefined) {
        const freqIdx = active.data.current.frequencyIndex as number;
        setPois(prev => prev.map(p => p.id === poiId ? { ...p, frequencyIndex: freqIdx } : p));
      }
      setEditingPoiId(poiId);
    }
    setActiveTransport(null);
    setActiveFrequencyIndex(null);
  };

  const summaryEN = useMemo(() => {
    if (pois.length === 0) return "";
    const en = TRANSLATIONS[Language.EN];
    let text = `${en.summaryPrefix}\n\n`;
    pois.forEach((poi, i) => {
      const mode = poi.transportMode ? en.modes[poi.transportMode] : en.summaryNoTransport;
      const freq = en.frequencies[poi.frequencyIndex] || en.frequencies[0];
      text += `${i + 1}. **${poi.name}** by **${mode}** (${freq})\n`;
    });
    return text;
  }, [pois]);

  const summaryDE = useMemo(() => {
    if (pois.length === 0) return "";
    const de = TRANSLATIONS[Language.DE];
    let text = `${de.summaryPrefix}\n\n`;
    pois.forEach((poi, i) => {
      const mode = poi.transportMode ? de.modes[poi.transportMode] : de.summaryNoTransport;
      const freq = de.frequencies[poi.frequencyIndex] || de.frequencies[0];
      text += `${i + 1}. **${poi.name}** mit **${mode}** (${freq})\n`;
    });
    return text;
  }, [pois]);

  const handleStoreData = async () => {
    setIsStoring(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsStoring(false);
    setIsStored(true);
  };

  // Determine standard tile URL - using CartoDB Positron for speed and clarity
  const standardTileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  const building3DTileUrl = "https://{s}.f4map.com/tiles/f4_3d/{z}/{x}/{y}.png";

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FDFDFD] h-screen overflow-hidden font-sans text-gray-900">
      <div className="w-full md:w-[400px] flex flex-col border-r border-gray-100 bg-white z-20 overflow-hidden shrink-0 shadow-2xl">
        <header className="p-6 border-b bg-white relative z-30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <OVGULogo />
              <div className="flex flex-col">
                <h1 className="text-lg font-black text-[#1a1a1a] tracking-tight leading-tight">
                  {t.title.split(' ').map((w, i) => <span key={i} className={i === 0 ? "text-[#93132B]" : ""}>{w} </span>)}
                </h1>
                <a href="https://www.ovgu.de/imiq" target="_blank" className="text-[10px] font-bold text-gray-400 hover:text-[#93132B] transition uppercase tracking-[0.15em] flex items-center gap-1">
                  {t.imiqProject}
                </a>
              </div>
            </div>
            <LanguageSwitch current={lang} onChange={setLang} />
          </div>

          <div ref={searchContainerRef} className="relative group">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:ring-4 focus:ring-[#93132B15] focus:border-[#93132B] focus:bg-white focus:outline-none transition-all shadow-sm"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {(isSearchingOSM || isSearchingAI) ? <div className="animate-spin h-5 w-5 border-2 border-[#93132B] border-t-transparent rounded-full" /> : 
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              </div>
            </div>
            {(searchResults.length > 0 || isSearchingAI) && searchQuery.length > 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar">
                {searchResults.map((res, idx) => {
                  const resId = res.place_id || res.display_name;
                  const isSelected = selectingResultId === resId;
                  return (
                    <button 
                      key={resId} 
                      onClick={() => selectSearchResult(res)} 
                      disabled={selectingResultId !== null}
                      className={`w-full text-left px-5 py-3 text-sm transition-all border-b last:border-b-0 border-gray-50 flex items-center gap-3 group active:scale-[0.98] ${
                        isSelected ? 'bg-[#93132B] text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-[#93132B]'
                      }`}
                    >
                      <div className="flex-1 overflow-hidden">
                        <span className={`font-semibold block truncate ${isSelected ? 'text-white' : ''}`}>
                          {res.display_name.split(',')[0]}
                          {res.source === 'gemini' && <span className="ml-2 text-[8px] bg-[#93132B] text-white px-1.5 py-0.5 rounded-full">AI</span>}
                        </span>
                        <span className={`text-[10px] block truncate leading-tight ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                          {res.display_name.split(',').slice(1).join(',')}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        <DndContext sensors={sensors} onDragStart={(e) => {
            if (e.active.data.current?.mode) setActiveTransport(e.active.data.current.mode);
            if (e.active.data.current?.frequencyIndex !== undefined) setActiveFrequencyIndex(e.active.data.current.frequencyIndex);
          }} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar bg-gray-50/30">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">{t.addedPois}</h2>
            <div className="space-y-4">
              {pois.length === 0 ? (
                <div className="py-12 px-6 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{t.noPois}</p>
                </div>
              ) : (
                pois.map(poi => (
                  <POICard 
                    key={poi.id} poi={poi} lang={lang} 
                    isEditing={editingPoiId === poi.id} 
                    isNewlyAdded={newlyAddedId === poi.id}
                    onEditToggle={() => { 
                      setEditingPoiId(poi.id); 
                      setMapCenter([poi.lat, poi.lng]);
                      setMapZoom(17);
                    }} 
                    onRemove={(id) => setPois(p => p.filter(x => x.id !== id))} 
                    onFrequencyChange={(id, idx) => setPois(p => p.map(x => x.id === id ? {...x, frequencyIndex: idx} : x))} 
                    onNameChange={(id, n) => setPois(p => p.map(x => x.id === id ? {...x, name: n} : x))} 
                    onClearTransport={() => setPois(prev => prev.map(p => p.id === poi.id ? { ...p, transportMode: null } : p))}
                  />
                ))
              )}
            </div>
          </div>

          <footer className="p-6 bg-white border-t border-gray-100 overflow-y-auto max-h-[45%] custom-scrollbar">
            <div className="mb-4">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.frequencyLabel}</h3>
              <div className="grid grid-cols-4 gap-2">
                {t.frequencies.map((f, i) => <FrequencySource key={i} label={f} index={i} />)}
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">{t.transportLabel}</h3>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-6">
                {Object.values(TransportMode).map(mode => <TransportSource key={mode} mode={mode} lang={lang} />)}
              </div>
            </div>
            <button onClick={() => setIsFinalized(true)} disabled={pois.length === 0} className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] ${pois.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#93132B] text-white hover:bg-[#7a0f24] shadow-[#93132B40]'}`}>
              {t.saveData}
            </button>
          </footer>

          <DragOverlay>
            {activeTransport && <div className="p-4 bg-white border-2 border-[#93132B] rounded-3xl shadow-2xl scale-125 z-[6000] flex items-center justify-center"><span className="text-4xl">{TRANSPORT_ICONS[activeTransport]}</span></div>}
            {activeFrequencyIndex !== null && <div className="p-4 bg-white border-2 border-blue-500 rounded-3xl shadow-2xl scale-125 z-[6000] flex items-center justify-center"><span className="text-4xl">{FREQUENCY_ICONS[activeFrequencyIndex]}</span></div>}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex-1 relative min-h-[400px]">
        {!mapLoaded && (
          <div className="absolute inset-0 z-[2000] bg-gray-100 flex flex-col items-center justify-center text-[#93132B]">
            <OVGULogo />
            <p className="font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Loading Region...</p>
          </div>
        )}

        <MapContainer 
          center={MAGDEBURG_CENTER} 
          zoom={11} 
          minZoom={8} 
          maxZoom={19} 
          maxBounds={SACHSEN_ANHALT_BOUNDS} 
          maxBoundsViscosity={1.0} 
          worldCopyJump={false}
          preferCanvas={true}
          style={{ height: '100%', width: '100%', backgroundColor: '#e2e8f0' }}
        >
          <TileLayer 
            key={mapLayer}
            url={mapLayer === MapLayer.STANDARD ? standardTileUrl : building3DTileUrl}
            subdomains={mapLayer === MapLayer.STANDARD ? 'abcd' : ['tile1', 'tile2', 'tile3', 'tile4']}
            bounds={SACHSEN_ANHALT_BOUNDS}
            keepBuffer={2}
            updateWhenIdle={true}
          />
          
          {/* Inverse mask to hide map data outside Sachsen-Anhalt */}
          <GeoJSON 
            data={WORLD_MASK_GEOJSON} 
            style={{ fillColor: '#0f172a', fillOpacity: 0.7, stroke: false }} 
            interactive={false}
          />

          {/* Explicitly highlight the border of Sachsen-Anhalt */}
          <GeoJSON 
            data={SACHSEN_ANHALT_GEOJSON} 
            style={{ color: BRAND_MAROON, weight: 6, fillOpacity: 0, opacity: 1, dashArray: '5, 10' }} 
            interactive={false}
          />

          <MapEvents onMapClick={handleMapClick} />
          <MapController center={mapCenter} zoom={mapZoom} onReady={() => setMapLoaded(true)} />
          
          {feedbackMarker && <Marker position={[feedbackMarker.lat, feedbackMarker.lng]} icon={feedbackIcon} zIndexOffset={1000} />}
          
          {pois.map(poi => (
            <Marker key={poi.id} position={[poi.lat, poi.lng]} icon={editingPoiId === poi.id ? selectedIcon : (poi.transportMode ? defaultIcon : incompleteIcon)}
              eventHandlers={{ click: () => { setEditingPoiId(poi.id); setMapCenter([poi.lat, poi.lng]); setMapZoom(17); } }}>
              <Tooltip direction="top" permanent={editingPoiId === poi.id}>
                <div className="px-3 py-1 bg-white rounded shadow-md font-bold text-xs">{poi.name}</div>
              </Tooltip>
            </Marker>
          ))}
          {pendingMarkers.map((m, i) => <Marker key={i} position={[m.lat, m.lng]} icon={createMarkerIcon("#f59e0b")} />)}
        </MapContainer>

        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2">
          <button onClick={() => setMapLayer(prev => prev === MapLayer.STANDARD ? MapLayer.BUILDINGS_3D : MapLayer.STANDARD)} className="bg-white p-3 rounded-2xl shadow-xl text-[#93132B] border border-gray-100">
            <span className="text-2xl">{LAYER_ICONS[mapLayer]}</span>
          </button>
        </div>

        {pendingMarkers.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/95 backdrop-blur-xl p-3 rounded-[2rem] shadow-2xl border border-white animate-in slide-in-from-bottom duration-500">
            <div className="pl-6 pr-4 border-r border-gray-100 py-2">
              <span className="text-2xl font-black text-[#93132B]">{pendingMarkers.length}</span>
              <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.pendingCount}</span>
            </div>
            <button onClick={confirmSelection} disabled={isProcessing} className="bg-[#93132B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#7a0f24] transition-all shadow-lg min-w-[140px]">
              {isProcessing ? t.processing : t.confirmSelection}
            </button>
            <button onClick={() => setPendingMarkers([])} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100">{t.clearSelection}</button>
          </div>
        )}
      </div>

      {showTutorial && <Tutorial lang={lang} onClose={handleCloseTutorial} />}

      {isFinalized && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#93132B]/20 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-2xl w-full shadow-3xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">{t.finalizeTitle}</h2>
              <button onClick={() => { setIsFinalized(false); setIsStored(false); }} className="text-gray-400 p-2"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {!isStored ? (
              <>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-8">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                    <div className="prose prose-sm text-gray-600 max-w-none">
                       {(lang === Language.EN ? summaryEN : summaryDE).split('\n').map((line, i) => <p key={i} className="mb-1" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#93132B]">$1</strong>') }} />)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 px-6 border text-gray-500 rounded-2xl font-bold">{t.cancel}</button>
                  <button onClick={handleStoreData} disabled={isStoring} className="flex-[2] bg-[#93132B] text-white py-4 rounded-2xl font-bold hover:bg-[#7a0f24] shadow-xl">
                    {isStoring ? t.storingData : t.storeData}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6"><svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">{t.successMessage}</h3>
                <p className="text-gray-500 mb-8">{t.successDesc}</p>
                <button onClick={() => { setIsFinalized(false); setIsStored(false); }} className="px-10 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold shadow-xl">{t.done}</button>
              </div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        
        @keyframes bounce-short {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0) scale(1.25); }
          40% { transform: translateY(-10px) scale(1.3); }
          60% { transform: translateY(-5px) scale(1.28); }
        }
        .animate-bounce-short {
          animation: bounce-short 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
