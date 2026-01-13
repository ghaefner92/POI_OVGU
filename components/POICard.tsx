
import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { POI, Language } from '../types';
import { TRANSLATIONS, TRANSPORT_ICONS, BRAND_MAROON, FREQUENCY_ICONS } from '../constants';

interface POICardProps {
  poi: POI;
  lang: Language;
  isEditing: boolean;
  onEditToggle: () => void;
  onRemove: (id: string) => void;
  onFrequencyChange: (id: string, index: number) => void;
  onNameChange: (id: string, name: string) => void;
  onClearTransport: () => void;
}

const POICard: React.FC<POICardProps> = ({ 
  poi, 
  lang, 
  isEditing, 
  onEditToggle, 
  onRemove, 
  onFrequencyChange, 
  onNameChange,
  onClearTransport
}) => {
  const [tempName, setTempName] = useState(poi.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const { setNodeRef, isOver } = useDroppable({
    id: `poi-${poi.id}`,
    data: { poiId: poi.id }
  });

  const t = TRANSLATIONS[lang];
  const isComplete = poi.transportMode !== null;

  useEffect(() => {
    setTempName(poi.name);
  }, [poi.name]);

  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  const handleSave = () => {
    if (tempName.trim() && tempName !== poi.name) {
      onNameChange(poi.id, tempName.trim());
    } else {
      setTempName(poi.name);
    }
    onEditToggle();
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-ignore
        cardRef.current = node;
      }}
      onClick={!isEditing ? onEditToggle : undefined}
      className={`p-5 rounded-[1.75rem] border-l-[6px] transition-all duration-300 relative group cursor-pointer animate-in slide-in-from-left-4 ${
        isOver ? 'bg-[#93132B08] scale-[1.02] border-[#93132B]' : 'bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-transparent'
      } ${isEditing ? 'ring-2 ring-[#93132B10] shadow-[0_15px_40px_rgba(0,0,0,0.08)] z-10' : 'hover:shadow-[0_8px_25px_rgba(0,0,0,0.05)]'} ${
        isComplete ? 'border-l-green-500' : 'border-l-orange-300'
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(poi.id); }}
        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all z-20"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="flex items-center justify-between mb-4 pr-6">
        <div className="flex-1 overflow-hidden mr-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={tempName}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setTempName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="w-full font-bold text-slate-800 border-b border-[#93132B] focus:outline-none bg-transparent py-0.5 text-base"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 truncate text-base">{poi.name}</h3>
              {!isComplete && (
                <span className="shrink-0 text-[8px] font-black uppercase tracking-tighter bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full animate-pulse">
                   {t.modeMissing}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.frequencyLabel}</label>
          <div className="relative">
            <select
              value={poi.frequencyIndex}
              onChange={(e) => onFrequencyChange(poi.id, parseInt(e.target.value))}
              className="w-full text-[10px] font-bold text-slate-600 bg-slate-50 rounded-xl pl-8 pr-2 py-2.5 border-none outline-none cursor-pointer appearance-none hover:bg-slate-100 transition-colors"
            >
              {t.frequencies.map((f, i) => <option key={i} value={i}>{f}</option>)}
            </select>
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
              {FREQUENCY_ICONS[poi.frequencyIndex]}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{t.transportLabel}</label>
          <div className={`h-[42px] rounded-xl border-2 border-dashed flex items-center justify-center transition-all relative ${
            poi.transportMode ? 'bg-white border-green-500/10 shadow-sm' : 'bg-slate-50 border-slate-100'
          }`}>
            {poi.transportMode ? (
              <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 px-2 w-full">
                <span className="text-lg">{TRANSPORT_ICONS[poi.transportMode]}</span>
                <span className="text-[9px] font-black text-slate-700 uppercase truncate flex-1">{t.modes[poi.transportMode]}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onClearTransport(); }}
                  className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <span className="text-[8px] text-slate-400 font-black uppercase tracking-tighter text-center px-1 leading-none">{t.dragHint}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(POICard);
