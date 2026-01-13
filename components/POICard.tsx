
import React, { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { POI, Language } from '../types';
import { TRANSLATIONS, TRANSPORT_ICONS, BRAND_MAROON, FREQUENCY_ICONS } from '../constants';

interface POICardProps {
  poi: POI;
  lang: Language;
  isEditing: boolean;
  isNewlyAdded?: boolean;
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
  isNewlyAdded,
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

  useEffect(() => {
    setTempName(poi.name);
  }, [poi.name]);

  useEffect(() => {
    if (isEditing || isNewlyAdded) {
      const timer = setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (isEditing) inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isEditing, isNewlyAdded]);

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
      className={`p-5 rounded-[1.5rem] border-2 transition-all duration-300 relative group cursor-pointer ${
        isOver ? 'border-[#93132B] bg-[#93132B08] scale-[1.02]' : 'border-gray-50 bg-white'
      } ${isEditing ? 'ring-4 ring-[#93132B15] border-[#93132B] shadow-xl z-10' : 'shadow-sm hover:shadow-md hover:border-gray-200'} ${
        isNewlyAdded ? 'animate-newly-added' : ''
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(poi.id); }}
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-20"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="pr-8 mb-4">
        {isEditing ? (
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={tempName}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setTempName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-full font-bold text-[#1a1a1a] border-b-2 border-[#93132B] focus:outline-none bg-transparent py-1"
            />
            <button onClick={(e) => { e.stopPropagation(); handleSave(); }} className="text-green-500 hover:scale-110 transition-transform">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </button>
          </div>
        ) : (
          <h3 className="font-bold text-[#1a1a1a] truncate transition-colors flex items-center gap-2">
            <span className={isEditing ? 'text-[#93132B]' : ''}>{poi.name}</span>
            <svg className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </h3>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4" onClick={(e) => e.stopPropagation()}>
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t.frequencyLabel}</label>
          <div className="flex flex-col gap-2">
            <select
              value={poi.frequencyIndex}
              onChange={(e) => onFrequencyChange(poi.id, parseInt(e.target.value))}
              className="w-full text-xs font-bold text-[#1a1a1a] bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            >
              {t.frequencies.map((f, i) => <option key={i} value={i}>{f}</option>)}
            </select>
            <div className={`h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-all bg-gray-50/50 border-gray-100 text-[8px] font-bold text-gray-400 gap-1`}>
              <span>{FREQUENCY_ICONS[poi.frequencyIndex] || "⏱️"}</span>
              <span>{t.frequencies[poi.frequencyIndex]}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">{t.transportLabel}</label>
          <div className={`h-full min-h-[4rem] rounded-xl border-2 border-dashed flex items-center justify-center transition-all relative ${
            poi.transportMode ? 'bg-[#93132B05] border-[#93132B30]' : 'bg-gray-50 border-gray-100'
          }`}>
            {poi.transportMode ? (
              <div className="flex flex-col items-center gap-1 animate-in fade-in zoom-in-75 p-2">
                <span className="text-2xl">{TRANSPORT_ICONS[poi.transportMode]}</span>
                <span className="text-[10px] font-black text-[#93132B] uppercase truncate max-w-[80px] text-center">{t.modes[poi.transportMode]}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); onClearTransport(); }}
                  className="absolute -top-2 -right-2 bg-white border shadow-sm rounded-full p-0.5 hover:text-red-500 transition-colors"
                  title={t.resetTransport}
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <span className="text-[9px] text-gray-400 font-bold px-2 leading-tight text-center">{t.dragHint}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(POICard);
