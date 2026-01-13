
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { TransportMode } from '../types';
import { TRANSPORT_ICONS, TRANSLATIONS } from '../constants';
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
      className={`group flex flex-col items-center justify-center p-3 bg-white rounded-3xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isDragging ? 'opacity-30 scale-110 z-50 ring-8 ring-[#93132B05]' : 'opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-50 hover:border-[#93132B20] hover:shadow-[0_12px_30px_rgba(147,19,43,0.08)] hover:-translate-y-1'
      }`}
      title={t.modes[mode]}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl mb-2 transition-colors group-hover:bg-[#93132B05]">
        {TRANSPORT_ICONS[mode]}
      </div>
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center px-1 overflow-hidden whitespace-nowrap">
        {t.modes[mode].split(' ')[0]}
      </span>
    </div>
  );
};

export default React.memo(TransportSource);
