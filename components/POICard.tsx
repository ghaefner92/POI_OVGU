
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { POI, Language } from '../types';
import { TRANSLATIONS, TRANSPORT_ICONS } from '../constants';

interface POICardProps {
  poi: POI;
  lang: Language;
  onRemove: (id: string) => void;
  onFrequencyChange: (id: string, frequency: string) => void;
  onClearTransport: () => void;
}

const POICard: React.FC<POICardProps> = ({ poi, lang, onRemove, onFrequencyChange, onClearTransport }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `poi-${poi.id}`,
    data: { poiId: poi.id }
  });

  const t = TRANSLATIONS[lang];

  return (
    <div
      ref={setNodeRef}
      className={`p-4 rounded-xl border-2 transition-all relative ${
        isOver ? 'border-[#93132B] bg-[#93132B]/5' : 'border-gray-100 bg-white'
      } shadow-sm`}
    >
      <button 
        onClick={() => onRemove(poi.id)} 
        className="absolute top-2 right-2 text-gray-300 hover:text-red-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <h3 className="font-bold text-sm mb-3 truncate pr-4 text-slate-800">{poi.name}</h3>
      
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-[10px] uppercase font-black text-slate-400 block mb-1 tracking-widest">{t.frequencyLabel}</label>
          <select 
            value={poi.frequency} 
            onChange={(e) => onFrequencyChange(poi.id, e.target.value)}
            className="w-full p-2 text-xs border border-slate-100 rounded-lg outline-none bg-slate-50 font-bold text-slate-600 focus:bg-white focus:border-[#93132B20] transition-all"
          >
            {t.frequencies.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <div className="w-12 h-12 border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center text-2xl bg-slate-50 relative group">
          {poi.transportMode ? (
            <>
              {TRANSPORT_ICONS[poi.transportMode]}
              <button 
                onClick={(e) => { e.stopPropagation(); onClearTransport(); }}
                className="absolute -top-1 -right-1 bg-white border shadow-sm rounded-full p-0.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </>
          ) : (
            <span className="text-slate-300 text-xs">?</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(POICard);
