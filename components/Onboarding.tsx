import React, { useState } from 'react';
import { Box, Layers, Factory, ArrowRight, Check } from 'lucide-react';
import { Button } from './UI';
import { Logo } from './Logo';

const SLIDES = [
  {
    id: 1,
    title: "Track Inbound",
    description: "Effortlessly log new deliveries from suppliers. Generate unique QR codes instantly.",
    icon: Box,
    color: "bg-eco-green text-white",
  },
  {
    id: 2,
    title: "Smart Sorting",
    description: "Categorize materials by type, color, and grade. Maintain granular control.",
    icon: Layers,
    color: "bg-eco-orange text-white",
  },
  {
    id: 3,
    title: "Fibre Production",
    description: "Combine sorted packs into high-quality fibre. Full lineage traceability.",
    icon: Factory,
    color: "bg-eco-charcoal text-white",
  }
];

export const Onboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      onComplete();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-40 bg-eco-cream flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <Logo size="sm" />
        <button onClick={onComplete} className="text-gray-400 text-sm font-bold hover:text-eco-charcoal transition-colors">
          SKIP
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto w-full">
        {/* Animated Icon Container */}
        <div key={slide.id} className={`w-64 h-64 rounded-full ${slide.color} flex items-center justify-center mb-10 animate-fade-in shadow-2xl relative overflow-hidden`}>
           <div className="absolute inset-0 bg-white/10 rounded-full scale-90"></div>
           <slide.icon size={80} strokeWidth={1.5} className="animate-float relative z-10" />
        </div>

        <div key={`text-${slide.id}`} className="animate-slide-up">
          <h2 className="text-3xl font-bold text-eco-green mb-4 tracking-tight">{slide.title}</h2>
          <p className="text-gray-500 text-lg leading-relaxed">{slide.description}</p>
        </div>
      </div>

      <div className="p-6 pb-12 max-w-md mx-auto w-full">
        <div className="flex justify-center gap-3 mb-8">
          {SLIDES.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-eco-orange' : 'w-2 bg-gray-300'}`}
            />
          ))}
        </div>

        <Button onClick={next} variant="primary">
          {currentSlide === SLIDES.length - 1 ? (
            <span className="flex items-center justify-center gap-2">Start App <Check size={20} /></span>
          ) : (
            <span className="flex items-center justify-center gap-2">Next <ArrowRight size={20} /></span>
          )}
        </Button>
      </div>
    </div>
  );
};