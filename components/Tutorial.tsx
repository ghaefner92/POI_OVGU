
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

  return (
    <div className="fixed inset-0 z-[6000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-3xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Progress bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gray-100">
          <div 
            className="h-full bg-[#93132B] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / t.tutorialSteps.length) * 100}%` }}
          />
        </div>

        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors p-2"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mt-4 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center text-4xl mb-6 shadow-inner animate-bounce">
            {currentStep.icon}
          </div>
          
          <h2 className="text-2xl font-black text-[#1a1a1a] mb-4">
            {currentStep.title}
          </h2>
          
          <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8 font-medium h-[80px]">
            {currentStep.description}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-[#93132B] text-white rounded-2xl font-bold shadow-xl hover:shadow-[#93132B40] hover:bg-[#7a0f24] transition-all active:scale-[0.98]"
            >
              {isLast ? t.tutorialFinish : (step === 0 ? t.tutorialStart : t.tutorialNext)}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
            >
              {t.tutorialClose}
            </button>
          </div>

          <div className="flex gap-1.5 mt-8">
            {t.tutorialSteps.map((_, i) => (
              <div 
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[#93132B]' : 'w-1.5 bg-gray-200'
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
