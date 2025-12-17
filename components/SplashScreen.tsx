import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Start fade out after 2 seconds
    const timer1 = setTimeout(() => setFading(true), 2000);
    // Unmount after animation completes
    const timer2 = setTimeout(onFinish, 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 bg-eco-green flex flex-col items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}>
      <div className="animate-float">
        <Logo size="xl" variant="light" />
      </div>
      <div className="mt-12 flex gap-3">
         <div className="w-2.5 h-2.5 bg-eco-orange rounded-full animate-bounce [animation-delay:-0.3s]"></div>
         <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
         <div className="w-2.5 h-2.5 bg-eco-orange rounded-full animate-bounce"></div>
      </div>
      <p className="absolute bottom-10 text-white/60 text-xs font-bold tracking-[0.2em] uppercase">
        Circular Economy Platform
      </p>
    </div>
  );
};