
import React from 'react';
import { Language } from '../types';
import { BRAND_MAROON } from '../constants';

interface LanguageSwitchProps {
  current: Language;
  onChange: (lang: Language) => void;
}

const LanguageSwitch: React.FC<LanguageSwitchProps> = ({ current, onChange }) => {
  return (
    <div className="flex bg-white rounded-lg shadow-sm border p-1 gap-1">
      <button
        onClick={() => onChange(Language.EN)}
        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
          current === Language.EN ? 'bg-[#93132B] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => onChange(Language.DE)}
        className={`px-3 py-1 rounded-md text-xs font-bold transition ${
          current === Language.DE ? 'bg-[#93132B] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'
        }`}
      >
        DE
      </button>
    </div>
  );
};

export default LanguageSwitch;
