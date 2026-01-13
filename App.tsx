
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  DndContext, 
  DragOverlay, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent,
} from '@dnd-kit/core';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { GoogleGenAI } from "@google/genai";
import { Language, TransportMode, POI, PendingMarker, MapLayer } from './types';
import { MAGDEBURG_CENTER, TRANSLATIONS, TRANSPORT_ICONS, BRAND_MAROON, SACHSEN_ANHALT_BOUNDS, LAYER_ICONS, FREQUENCY_ICONS, NOMINATIM_VIEWBOX } from './constants';
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
      ${isSelected ? '<div class="absolute w-12 h-12 bg-red-400 rounded-full animate-ping opacity-40"></div>' : ''}
      <div class="${isSelected ? 'scale-125 transition-transform duration-300' : ''}" style="filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3))">
        <svg width="${isSelected ? '48' : '32'}" height="${isSelected ? '48' : '32'}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21C16 17.5 19 14.4087 19 10.5C19 6.63401 15.866 3.5 12 3.5C8.13401 3.5 5 6.63401 5 10.5C5 14.4087 8 17.5 12 21Z" fill="${color}" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="10.5" r="3" fill="white"/>
        </svg>
      </div>
    </div>`,
  className: '',
  iconSize: isSelected ? [48, 48] : [32, 32],
  iconAnchor: isSelected ? [24, 48] : [16, 32]
});

const defaultIcon = createMarkerIcon(BRAND_MAROON);
const selectedIcon = createMarkerIcon("#FF3B30", true); 
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

const MapController = ({ center, zoom }: { center: [number, number], zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    if (zoom) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5,
        easeLinearity: 0.25
      });
    } else {
      map.panTo(center, { animate: true, duration: 0.8 });
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
  if (category === 'highway') return '🛣️';
  if (category === 'tourism') return '🏛️';
  if (category === 'railway') return '🚉';
  if (category === 'building') return '🏠';
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
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(MAGDEBURG_CENTER);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isStored, setIsStored] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingPoiId, setEditingPoiId] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [showLayerPicker, setShowLayerPicker] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchCache = useRef<Map<string, any[]>>(new Map());
  
  const t = TRANSLATIONS[lang];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('ovgu_mobility_tutorial_seen');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
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

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    setIsSearching(true);
    try {
      const refinedQuery = qLower.includes('magdeburg') ? qRaw : `${qRaw}, Magdeburg`;

      const standardSearchPromise = fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(refinedQuery)}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=6`,
        { signal }
      ).then(r => r.json());

      const aiSearchPromise = (async () => {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `STRICT GEOGRAPHIC FILTER: Identify up to 3 official POIs for "${qRaw}" located EXCLUSIVELY inside the city limits of Magdeburg, Germany. Do not return results outside the city. Return names only.`,
            config: {
              tools: [{ googleMaps: {} }],
              toolConfig: {
                retrievalConfig: {
                  latLng: { latitude: MAGDEBURG_CENTER[0], longitude: MAGDEBURG_CENTER[1] }
                }
              }
            },
          });
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          return chunks.map((c: any) => c.maps?.title).filter(Boolean).slice(0, 3);
        } catch (e) {
          console.error("AI Search Error:", e);
          return [];
        }
      })();

      const [osmResults, aiNames] = await Promise.all([standardSearchPromise, aiSearchPromise]);
      setSearchResults(osmResults);

      if (aiNames.length > 0) {
        const geocodeResults = await Promise.all(
          aiNames.map(async (name: string) => {
            try {
              const aiGeocodeQuery = name.toLowerCase().includes('magdeburg') ? name : `${name}, Magdeburg`;
              const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(aiGeocodeQuery)}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1&limit=1`,
                { signal }
              );
              const data = await res.json();
              return data.length > 0 ? { ...data[0], source: 'gemini' } : null;
            } catch {
              return null;
            }
          })
        );

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
      } else {
        searchCache.current.set(qLower, osmResults);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') console.error("Search error:", err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        performSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 400); 
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, performSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
        if (SACHSEN_ANHALT_BOUNDS.contains(userLatLng)) {
          setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        }
      });
    }
  }, []);

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);
      if (SACHSEN_ANHALT_BOUNDS.contains(userLatLng)) {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setMapZoom(16);
        setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
      }
    });
  };

  const selectSearchResult = (result: any) => {
    const newPoi: POI = {
      id: `poi-${Date.now()}`,
      name: result.display_name.split(',')[0],
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      transportMode: null,
      frequencyIndex: 0
    };
    setPois(prev => [...prev, newPoi]);
    setMapCenter([parseFloat(result.lat), parseFloat(result.lon)]);
    setMapZoom(17);
    setEditingPoiId(newPoi.id);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleMapClick = (lat: number, lng: number) => {
    const existingIndex = pendingMarkers.findIndex(m => Math.abs(m.lat - lat) < 0.0005 && Math.abs(m.lng - lng) < 0.0005);
    if (existingIndex !== -1) {
      setPendingMarkers(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setPendingMarkers(prev => [...prev, { lat, lng }]);
    }
    setEditingPoiId(null);
  };

  const confirmSelection = async () => {
    setIsProcessing(true);
    try {
      const reverseGeocodePromises = pendingMarkers.map(async (marker, idx) => {
        await new Promise(r => setTimeout(r, idx * 250));
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${marker.lat}&lon=${marker.lng}`);
        const data = await res.json();
        return {
          id: `poi-${Date.now()}-${Math.random()}`,
          name: data.display_name ? data.display_name.split(',')[0] : `Point ${idx + 1}`,
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
        setMapCenter([lastPoi.lat, lastPoi.lng]);
        setMapZoom(17);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
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

  const handleClearTransport = (id: string) => {
    setPois(prev => prev.map(p => p.id === id ? { ...p, transportMode: null } : p));
  };

  const getLayerName = (layer: MapLayer) => {
    switch(layer) {
      case MapLayer.STANDARD: return t.layerStandard;
      case MapLayer.BUILDINGS_3D: return t.layer3D;
      default: return "";
    }
  };

  // Improved, fully localized summary generation
  const summaryEN = useMemo(() => {
    if (pois.length === 0) return "";
    const en = TRANSLATIONS[Language.EN];
    let text = `${en.summaryPrefix}\n\n`;
    pois.forEach((poi, i) => {
      const mode = poi.transportMode ? en.modes[poi.transportMode] : en.summaryNoTransport;
      const freq = en.frequencies[poi.frequencyIndex] || en.frequencies[0];
      text += `${i + 1}. You visit **${poi.name}** primarily by **${mode}**, with a frequency of **${freq}**.\n`;
    });
    text += `\n${en.summaryFooter}`;
    return text;
  }, [pois]);

  const summaryDE = useMemo(() => {
    if (pois.length === 0) return "";
    const de = TRANSLATIONS[Language.DE];
    let text = `${de.summaryPrefix}\n\n`;
    pois.forEach((poi, i) => {
      const mode = poi.transportMode ? de.modes[poi.transportMode] : de.summaryNoTransport;
      const freq = de.frequencies[poi.frequencyIndex] || de.frequencies[0];
      text += `${i + 1}. Sie besuchen **${poi.name}** hauptsächlich mit dem **${mode}**, mit einer Häufigkeit von **${freq}**.\n`;
    });
    text += `\n${de.summaryFooter}`;
    return text;
  }, [pois]);

  const handleStoreData = async () => {
    setIsStoring(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsStoring(false);
    setIsStored(true);
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
                  {t.title.split(' ').map((w, i) => <span key={i} className={i === 0 ? "text-[#93132B]" : ""}>{w} </span>)}
                </h1>
                <a 
                  href="https://www.ovgu.de/imiq" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[10px] font-bold text-gray-400 hover:text-[#93132B] transition uppercase tracking-[0.15em] flex items-center gap-1"
                >
                  {t.imiqProject}
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
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
                {isSearching ? <div className="animate-spin h-5 w-5 border-2 border-[#93132B] border-t-transparent rounded-full" /> : 
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 max-h-[400px] overflow-y-auto custom-scrollbar">
                {searchResults.map((res, idx) => (
                  <button 
                    key={res.place_id || idx} 
                    onClick={() => selectSearchResult(res)} 
                    className="w-full text-left px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#93132B] transition-colors border-b last:border-b-0 border-gray-50 flex items-center gap-3 group"
                  >
                    <div className="text-xl bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#93132B10]">
                      {getCategoryIcon(res)}
                    </div>
                    <div className="overflow-hidden">
                      <span className="font-semibold block truncate">{res.display_name.split(',')[0]}</span>
                      <span className="text-[10px] text-gray-400 block truncate leading-tight">{res.display_name.split(',').slice(1).join(',')}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <DndContext 
          sensors={sensors} 
          onDragStart={(e) => {
            if (e.active.data.current?.mode) setActiveTransport(e.active.data.current.mode);
            if (e.active.data.current?.frequencyIndex !== undefined) setActiveFrequencyIndex(e.active.data.current.frequencyIndex);
          }} 
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">{t.addedPois}</h2>
              {pois.length > 0 && (
                <button onClick={() => setShowClearConfirm(true)} className="text-[10px] font-bold text-gray-400 hover:text-[#93132B] transition uppercase tracking-widest flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  {t.clearAll}
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {pois.length === 0 ? (
                <div className="py-12 px-6 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                  <div className="text-4xl mb-4">📍</div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{t.noPois}</p>
                </div>
              ) : (
                pois.map(poi => (
                  <POICard 
                    key={poi.id} 
                    poi={poi} 
                    lang={lang} 
                    isEditing={editingPoiId === poi.id} 
                    onEditToggle={() => {
                      const isNowEditing = editingPoiId !== poi.id;
                      setEditingPoiId(isNowEditing ? poi.id : null);
                      if (isNowEditing) {
                        setMapCenter([poi.lat, poi.lng]);
                        setMapZoom(17);
                      }
                    }} 
                    onRemove={(id) => setPois(p => p.filter(x => x.id !== id))} 
                    onFrequencyChange={(id, idx) => setPois(p => p.map(x => x.id === id ? {...x, frequencyIndex: idx} : x))} 
                    onNameChange={(id, n) => setPois(p => p.map(x => x.id === id ? {...x, name: n} : x))} 
                    onClearTransport={() => handleClearTransport(poi.id)}
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

            <button
              onClick={() => setIsFinalized(true)}
              disabled={pois.length === 0}
              className={`w-full py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl active:scale-[0.98] ${
                pois.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#93132B] text-white hover:bg-[#7a0f24]'
              }`}
            >
              {t.saveData}
            </button>
          </footer>

          <DragOverlay>
            {activeTransport && (
              <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-[#93132B] rounded-3xl shadow-2xl scale-125 z-[6000]">
                <span className="text-4xl">{TRANSPORT_ICONS[activeTransport]}</span>
              </div>
            )}
            {activeFrequencyIndex !== null && (
              <div className="flex flex-col items-center justify-center p-4 bg-white border-2 border-blue-500 rounded-3xl shadow-2xl scale-125 z-[6000]">
                <span className="text-4xl">{FREQUENCY_ICONS[activeFrequencyIndex]}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex-1 relative min-h-[400px]">
        <MapContainer 
          center={MAGDEBURG_CENTER} 
          zoom={14} 
          minZoom={12}
          maxZoom={19}
          maxBounds={SACHSEN_ANHALT_BOUNDS}
          maxBoundsViscosity={1.0}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer 
            key={mapLayer}
            url={`https://{s}.f4map.com/tiles/${mapLayer}/{z}/{x}/{y}.png`}
            subdomains={['tile1', 'tile2', 'tile3', 'tile4']}
            bounds={SACHSEN_ANHALT_BOUNDS}
            attribution='&copy; <a href="https://www.f4map.com">F4map</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapEvents onMapClick={handleMapClick} />
          <MapController center={mapCenter} zoom={mapZoom} />
          
          {pois.map(poi => (
            <Marker 
              key={poi.id} 
              position={[poi.lat, poi.lng]} 
              icon={editingPoiId === poi.id ? selectedIcon : (poi.transportMode ? defaultIcon : incompleteIcon)}
              eventHandlers={{ 
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  setEditingPoiId(poi.id); 
                  setMapCenter([poi.lat, poi.lng]);
                  setMapZoom(17);
                } 
              }}
              zIndexOffset={editingPoiId === poi.id ? 1000 : 0}
            >
              <Tooltip direction="top" offset={[0, -25]} opacity={1} permanent={editingPoiId === poi.id}>
                <div className="px-3 py-2 bg-white rounded-lg shadow-xl border border-gray-100 pointer-events-none">
                  <p className="font-bold text-[#1a1a1a] border-b pb-1 mb-1 truncate max-w-[150px]">{poi.name}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    {poi.transportMode ? <span>{TRANSPORT_ICONS[poi.transportMode]} {t.modes[poi.transportMode]}</span> : <span className="text-orange-500">Mode missing</span>}
                  </p>
                </div>
              </Tooltip>
            </Marker>
          ))}

          {pendingMarkers.map((m, i) => <Marker key={i} position={[m.lat, m.lng]} icon={createMarkerIcon("#f59e0b")} />)}
        </MapContainer>

        <div className="absolute top-6 right-20 z-[1000] flex flex-col items-end gap-2">
          {showLayerPicker && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-2 border border-white flex flex-col gap-1 animate-in slide-in-from-top-4 duration-200">
              {Object.values(MapLayer).map((layer) => (
                <button
                  key={layer}
                  onClick={() => { setMapLayer(layer); setShowLayerPicker(false); }}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                    mapLayer === layer ? 'bg-[#93132B] text-white shadow-lg' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{LAYER_ICONS[layer]}</span>
                  <span className="text-xs font-bold whitespace-nowrap">{getLayerName(layer)}</span>
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowLayerPicker(!showLayerPicker)}
            className="bg-white p-3 rounded-2xl shadow-2xl hover:bg-gray-50 text-[#93132B] transition-all active:scale-95 border border-gray-100 flex items-center gap-2 group"
          >
            <span className="text-2xl">{LAYER_ICONS[mapLayer]}</span>
            <svg className={`w-4 h-4 transition-transform duration-300 ${showLayerPicker ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>

        <button onClick={handleLocateMe} className="absolute top-6 right-6 z-[1000] bg-white p-3 rounded-2xl shadow-2xl hover:bg-gray-50 text-[#93132B] transition-all active:scale-95 border border-gray-100">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </button>

        {pendingMarkers.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-3 bg-white/95 backdrop-blur-xl p-3 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white animate-in slide-in-from-bottom-10">
            <div className="pl-6 pr-4 border-r border-gray-100 py-2">
              <span className="text-2xl font-black text-[#93132B]">{pendingMarkers.length}</span>
              <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.pendingCount}</span>
            </div>
            <button onClick={confirmSelection} disabled={isProcessing} className="bg-[#93132B] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#7a0f24] transition-all shadow-lg hover:shadow-[#93132B40] disabled:opacity-50 min-w-[140px]">
              {isProcessing ? <div className="animate-pulse">{t.processing}</div> : t.confirmSelection}
            </button>
            <button onClick={() => setPendingMarkers([])} className="px-6 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
              {t.clearSelection}
            </button>
          </div>
        )}
      </div>

      {showTutorial && (
        <Tutorial lang={lang} onClose={handleCloseTutorial} />
      )}

      {isFinalized && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-[#93132B]/20 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-4xl w-full shadow-3xl border border-gray-50 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-maroon-100 text-[#93132B] p-3 rounded-2xl bg-[#93132B10]">
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-[#1a1a1a]">{t.finalizeTitle}</h2>
              </div>
              <button onClick={() => { setIsFinalized(false); setIsStored(false); }} className="text-gray-400 hover:text-gray-600 transition-colors p-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            {!isStored ? (
              <>
                <p className="text-gray-500 mb-6 leading-relaxed font-medium">{t.finalizeDesc}</p>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-4 mb-8">
                  <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative">
                    <div className="absolute top-4 right-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.summaryIn} English</div>
                    <div className="prose prose-sm prose-maroon text-gray-600 max-w-none">
                       {summaryEN.split('\n').map((line, i) => (
                         <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#93132B] font-bold">$1</strong>') }} />
                       ))}
                    </div>
                  </div>

                  <div className="bg-[#93132B]/[0.02] p-6 rounded-3xl border border-[#93132B10] relative">
                    <div className="absolute top-4 right-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">{t.summaryIn} Deutsch</div>
                    <div className="prose prose-sm prose-maroon text-gray-600 max-w-none">
                       {summaryDE.split('\n').map((line, i) => (
                         <p key={i} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#93132B] font-bold">$1</strong>') }} />
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 px-6 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition-all">{t.cancel}</button>
                  <button 
                    onClick={handleStoreData} 
                    disabled={isStoring}
                    className="flex-[2] bg-[#93132B] text-white py-4 rounded-2xl font-bold hover:bg-[#7a0f24] transition-all shadow-xl hover:shadow-[#93132B40] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isStoring ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                        <span>{t.storingData}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        <span>{t.storeData}</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-green-100">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">{t.successMessage}</h3>
                <p className="text-gray-500 mb-8 max-w-sm">The IMIQ Project thanks you for your support. Your data will help improve urban planning in Magdeburg.</p>
                <button onClick={() => { setIsFinalized(false); setIsStored(false); }} className="px-10 py-4 bg-[#1a1a1a] text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-sm w-full shadow-3xl text-center animate-in scale-95 duration-200">
            <div className="mx-auto bg-red-50 p-5 rounded-full w-fit text-red-600 mb-6">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-xl font-bold text-[#1a1a1a] mb-8">{t.clearAllConfirm}</p>
            <div className="flex gap-4">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors">{t.cancel}</button>
              <button onClick={() => { setPois([]); setShowClearConfirm(false); }} className="flex-1 py-4 rounded-2xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200">{t.confirm}</button>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .prose strong { color: #93132B; font-weight: 800; }
      `}</style>
    </div>
  );
}
