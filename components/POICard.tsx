
import React from 'react';
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
  onRemove 
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div
      onClick={onEditToggle}
      className={`p-5 rounded-[1.5rem] border-2 transition-all duration-300 relative group cursor-pointer ${
        isEditing ? 'border-[#93132B] bg-[#93132B08] shadow-xl z-10 scale-[1.02]' : 'border-gray-50 bg-white shadow-sm hover:border-gray-200'
      }`}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(poi.id); }}
        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors z-20"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>

      <div className="flex items-start gap-3">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-all ${
          poi.transportMode ? 'bg-white shadow-md' : 'bg-gray-100 text-gray-400'
        }`}>
          {poi.transportMode ? TRANSPORT_ICONS[poi.transportMode] : '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[#1a1a1a] truncate mb-1">
            {poi.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
              {poi.transportMode ? t.modes[poi.transportMode] : t.modeMissing}
            </span>
            <span className="text-[10px] font-bold text-blue-500 flex items-center gap-1">
              {FREQUENCY_ICONS[poi.frequencyIndex]} {t.frequencies[poi.frequencyIndex]}
            </span>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#93132B] rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default React.memo(POICard);
