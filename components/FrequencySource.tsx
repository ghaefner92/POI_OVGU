
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { FREQUENCY_ICONS } from '../constants';

interface FrequencySourceProps {
  label: string;
  index: number;
}

const FrequencySource: React.FC<FrequencySourceProps> = ({ label, index }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `frequency-${index}`,
    data: { frequencyIndex: index }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const icon = FREQUENCY_ICONS[index] || "⏱️";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group flex flex-col items-center justify-center p-3 bg-white rounded-3xl cursor-grab active:cursor-grabbing transition-all duration-300 ${
        isDragging ? 'opacity-30 scale-110 z-50 ring-8 ring-blue-500/05' : 'opacity-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] border border-slate-50 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(59,130,246,0.08)] hover:-translate-y-1'
      }`}
      title={label}
    >
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-xl mb-1.5 transition-colors group-hover:bg-blue-50">
        {icon}
      </div>
      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest text-center px-1">
        {label}
      </span>
    </div>
  );
};

export default React.memo(FrequencySource);
