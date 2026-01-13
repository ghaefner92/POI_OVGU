
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
      className={`flex flex-col items-center justify-center p-2 bg-white border border-gray-100 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all hover:border-blue-500 hover:shadow-lg ${
        isDragging ? 'opacity-30 scale-110 z-50 ring-4 ring-blue-500/10' : 'opacity-100'
      }`}
      title={label}
    >
      <span className="text-xl mb-0.5">{icon}</span>
      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter leading-none text-center">
        {label}
      </span>
    </div>
  );
};

export default React.memo(FrequencySource);
