
import React from 'react';
import { Language } from '../types';

interface LanguageSwitchProps {
  current: Language;
  onChange: (lang: Language) => void;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ current, onChange }) => {
  return (
    <div className="flex bg-slate-50/50 backdrop-blur rounded-2xl shadow-inner border border-slate-100 p-1.5 gap-1.5">
      <button
        onClick={() => onChange(Language.EN)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
          current === Language.EN ? 'bg-white text-[#93132B] shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange(Language.DE)}
        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
          current === Language.DE ? 'bg-white text-[#93132B] shadow-sm' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitch;
