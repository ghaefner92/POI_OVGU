
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TransportMode } from '../types';
import { TRANSPORT_ICONS, TRANSLATIONS, BRAND_MAROON } from '../constants';
import { Language } from '../types';

interface TransportSourceProps {
  mode: TransportMode;
  lang: Language;
}

const TransportSource: React.FC<TransportSourceProps> = ({ mode, lang }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `transport-${mode}`,
    data: { mode }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const t = TRANSLATIONS[lang];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex flex-col items-center justify-center p-3 bg-white border border-gray-100 rounded-[1.25rem] shadow-sm cursor-grab active:cursor-grabbing transition-all hover:border-[#93132B] hover:shadow-lg ${
        isDragging ? 'opacity-30 scale-110 z-50 ring-4 ring-[#93132B10]' : 'opacity-100'
      }`}
      title={t.modes[mode]}
    >
      <span className="text-2xl mb-1">{TRANSPORT_ICONS[mode]}</span>
      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter leading-none text-center">
        {t.modes[mode].split(' ')[0]}
      </span>
    </div>
  );
};

export default React.memo(TransportSource);
