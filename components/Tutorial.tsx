
import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, BRAND_MAROON } from '../constants';

interface TutorialProps {
  lang: Language;
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ lang, onClose }) => {
  const [step, setStep] = useState(0);
  const t = TRANSLATIONS[lang];
  const currentStep = t.tutorialSteps[step];
  const isLast = step === t.tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose();
    } else {
      setStep(s => s + 1);
    }
  };

  const getActionTag = (index: number) => {
    const tags = {
      [Language.EN]: ["Goal", "Map", "Search", "Detail", "Save"],
      [Language.DE]: ["Ziel", "Karte", "Suche", "Details", "Speichern"]
    };
    return tags[lang][index];
  };

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-8 md:p-12 max-w-md w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gray-100">
          <div 
            className="h-full bg-[#93132B] transition-all duration-700 ease-in-out"
            style={{ width: `${((step + 1) / t.tutorialSteps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-full hover:bg-gray-50"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-4 flex flex-col items-center text-center">
          <div className="mb-2">
             <span className="px-3 py-1 bg-[#93132B10] text-[#93132B] text-[10px] font-black uppercase tracking-widest rounded-full">
               Step {step + 1} • {getActionTag(step)}
             </span>
          </div>

          <div className="w-24 h-24 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-5xl mb-8 shadow-inner ring-4 ring-white relative">
            <div className="absolute inset-0 bg-[#93132B05] rounded-[2.5rem] animate-pulse"></div>
            <span className="relative z-10">{currentStep.icon}</span>
          </div>
          
          <h2 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
            {currentStep.title}
          </h2>
          
          <p className="text-gray-500 text-sm md:text-[15px] leading-relaxed mb-10 font-medium min-h-[100px]">
            {currentStep.description}
          </p>

          <div className="flex flex-col w-full gap-4">
            <button
              onClick={handleNext}
              className="w-full py-5 bg-[#93132B] text-white rounded-[1.5rem] font-black shadow-2xl hover:shadow-[#93132B40] hover:bg-[#7a0f24] transition-all active:scale-[0.97] text-lg"
            >
              {isLast ? t.tutorialFinish : (step === 0 ? t.tutorialStart : t.tutorialNext)}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 text-[10px] font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-[0.2em]"
            >
              {t.tutorialClose}
            </button>
          </div>

          <div className="flex gap-2 mt-10">
            {t.tutorialSteps.map((_, i) => (
              <div 
                key={i}
                className={`h-2 rounded-full transition-all duration-500 ${
                  i === step ? 'w-10 bg-[#93132B]' : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
