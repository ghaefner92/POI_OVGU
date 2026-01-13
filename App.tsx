
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Language, TransportMode, POI, PendingMarker } from './types';
import { MAGDEBURG_CENTER, TRANSLATIONS, TRANSPORT_ICONS, BRAND_MAROON, SACHSEN_ANHALT_BOUNDS, NOMINATIM_VIEWBOX } from './constants';
import LanguageSwitch from './components/LanguageSwitch';
import TransportSource from './components/TransportSource';
import POICard from './components/POICard';

const createMarkerIcon = (color: string) => L.divIcon({
  html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2"><path d="M12 21C16 17.5 19 14.4087 19 10.5C19 6.63401 15.866 3.5 12 3.5C8.13401 3.5 5 6.63401 5 10.5C5 14.4087 8 17.5 12 21Z"/></svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const defaultIcon = createMarkerIcon(BRAND_MAROON);

const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) { if (SACHSEN_ANHALT_BOUNDS.contains(e.latlng)) onMapClick(e.latlng.lat, e.latlng.lng); }
  });
  return null;
};

export default function App() {
  const [lang, setLang] = useState<Language>(Language.DE);
  const [pois, setPois] = useState<POI[]>([]);
  const [pendingMarkers, setPendingMarkers] = useState<PendingMarker[]>([]);
  const [activeTransport, setActiveTransport] = useState<TransportMode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [isStored, setIsStored] = useState(false);
  
  const t = TRANSLATIONS[lang];
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&viewbox=${NOMINATIM_VIEWBOX}&bounded=1`);
          const data = await res.json();
          setSearchResults(data);
        } catch (e) { console.error(e); }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const selectSearchResult = (result: any) => {
    const newPoi: POI = {
      id: `poi-${Date.now()}`,
      name: result.display_name.split(',')[0],
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      transportMode: null,
      frequency: t.frequencies[0]
    };
    setPois(prev => [...prev, newPoi]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const confirmSelection = () => {
    const newPois = pendingMarkers.map((m, i) => ({
      id: `poi-${Date.now()}-${i}`,
      name: `Location ${pois.length + i + 1}`,
      lat: m.lat,
      lng: m.lng,
      transportMode: null,
      frequency: t.frequencies[0]
    }));
    setPois(prev => [...prev, ...newPois]);
    setPendingMarkers([]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.id.toString().startsWith('poi-')) {
      const poiId = over.data.current?.poiId;
      if (active.data.current?.mode) {
        setPois(prev => prev.map(p => p.id === poiId ? { ...p, transportMode: active.data.current.mode } : p));
      }
    }
    setActiveTransport(null);
  };

  const summary = useMemo(() => {
    return pois.map(p => `• ${p.name}: ${p.transportMode ? t.modes[p.transportMode] : '?'} (${p.frequency})`).join('\n');
  }, [pois, t]);

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-white selection:bg-[#93132B15]">
      <div className="w-full md:w-[380px] flex flex-col border-r shadow-xl z-20 overflow-hidden bg-white">
        <header className="p-6 border-b">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-black text-2xl text-[#93132B] tracking-tighter uppercase">{t.title.split(' ')[0]} <span className="text-slate-400">Tracker</span></h1>
            <LanguageSwitch current={lang} onChange={setLang} />
          </div>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full px-4 py-3 bg-slate-50 border border-transparent rounded-xl text-sm outline-none focus:bg-white focus:border-[#93132B15] transition-all"
            />
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border shadow-2xl z-50 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {searchResults.map((res, i) => (
                  <button key={i} onClick={() => selectSearchResult(res)} className="w-full text-left p-3 hover:bg-slate-50 text-xs border-b last:border-0 border-slate-50 transition-colors">
                    {res.display_name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        <DndContext sensors={sensors} onDragStart={(e) => setActiveTransport(e.active.data.current?.mode)} onDragEnd={handleDragEnd}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.addedPois}</h2>
            {pois.length === 0 ? <p className="text-slate-400 text-sm text-center py-20 font-medium italic">{t.noPois}</p> :
              pois.map(poi => (
                <POICard 
                  key={poi.id} poi={poi} lang={lang} 
                  onRemove={(id) => setPois(p => p.filter(x => x.id !== id))} 
                  onFrequencyChange={(id, f) => setPois(p => p.map(x => x.id === id ? {...x, frequency: f} : x))}
                  onClearTransport={() => setPois(prev => prev.map(p => p.id === poi.id ? { ...p, transportMode: null } : p))}
                />
              ))
            }
          </div>

          <footer className="p-6 border-t bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t.transportLabel}</label>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {Object.values(TransportMode).slice(0, 10).map(mode => <TransportSource key={mode} mode={mode} lang={lang} />)}
            </div>
            <button onClick={() => setIsFinalized(true)} disabled={pois.length === 0} className="w-full py-4 bg-[#93132B] text-white rounded-2xl font-black uppercase tracking-widest text-xs disabled:opacity-30 transition-all hover:brightness-110 shadow-lg shadow-[#93132B30]">
              {t.saveData}
            </button>
          </footer>

          <DragOverlay>
            {activeTransport && <div className="text-4xl p-4 bg-white rounded-2xl shadow-2xl border-2 border-[#93132B] flex items-center justify-center">{TRANSPORT_ICONS[activeTransport]}</div>}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex-1 relative">
        <MapContainer center={MAGDEBURG_CENTER} zoom={13} style={{ height: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents onMapClick={(lat, lng) => setPendingMarkers(prev => [...prev, { lat, lng }])} />
          {pois.map(p => <Marker key={p.id} position={[p.lat, p.lng]} icon={defaultIcon}><Tooltip direction="top" offset={[0, -32]}>{p.name}</Tooltip></Marker>)}
          {pendingMarkers.map((m, i) => <Marker key={i} position={[m.lat, m.lng]} icon={createMarkerIcon("#f59e0b")} />)}
        </MapContainer>
        {pendingMarkers.length > 0 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[1000] bg-white p-3 rounded-full shadow-2xl flex gap-4 items-center border border-slate-100 animate-in slide-in-from-bottom-4">
            <span className="font-bold px-4 text-sm">{pendingMarkers.length} {t.pendingCount}</span>
            <div className="flex gap-2">
               <button onClick={() => setPendingMarkers([])} className="bg-slate-100 text-slate-500 px-6 py-2 rounded-full font-bold text-sm">Cancel</button>
               <button onClick={confirmSelection} className="bg-[#93132B] text-white px-8 py-2 rounded-full font-bold text-sm shadow-lg shadow-[#93132B20]">{t.confirmSelection}</button>
            </div>
          </div>
        )}
      </div>

      {isFinalized && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-3xl text-center">
            <h2 className="text-3xl font-black mb-4 text-slate-800">{t.finalizeTitle}</h2>
            <p className="text-slate-500 mb-8 font-medium">{t.finalizeDesc}</p>
            <div className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100 shadow-inner max-h-48 overflow-y-auto">
               <pre className="text-left whitespace-pre-wrap font-mono text-xs text-slate-700 leading-relaxed">{summary}</pre>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setIsFinalized(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-[10px]">Back</button>
              <button onClick={() => { setIsStoring(true); setTimeout(() => { setIsStoring(false); setIsStored(true); }, 1500); }} className="flex-[2] py-4 bg-[#93132B] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-[#93132B20]">
                {isStoring ? t.storingData : t.storeData}
              </button>
            </div>
          </div>
        </div>
      )}

      {isStored && (
        <div className="fixed inset-0 z-[6000] flex items-center justify-center bg-white p-10 text-center animate-in fade-in duration-500">
          <div>
            <div className="text-8xl mb-8 animate-bounce">🌍</div>
            <h2 className="text-4xl font-black mb-4 text-[#93132B] uppercase tracking-tighter">{t.successMessage}</h2>
            <p className="text-slate-400 mb-10 max-w-sm mx-auto font-medium">{t.summaryFooter}</p>
            <button onClick={() => window.location.reload()} className="px-16 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl active:scale-95 transition-all">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
