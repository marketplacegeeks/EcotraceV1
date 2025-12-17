import React from 'react';
import { Recycle } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'light' | 'dark' | 'color';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', variant = 'color' }) => {
  const sizes = {
    sm: { icon: 20, text: 'text-lg' },
    md: { icon: 32, text: 'text-2xl' },
    lg: { icon: 48, text: 'text-4xl' },
    xl: { icon: 64, text: 'text-5xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[size];
  
  // Design System Colors
  const iconColor = variant === 'light' ? 'text-white' : 'text-eco-green';
  const textColor = variant === 'light' ? 'text-white' : 'text-eco-charcoal';

  return (
    <div className={`flex items-center gap-3 font-sans ${className}`}>
      <div className={`relative flex items-center justify-center rounded-xl ${variant === 'light' ? 'bg-white/10' : 'bg-eco-green/10'} p-1.5`}>
        <Recycle size={iconSize} className={iconColor} strokeWidth={2} />
      </div>
      <span className={`font-bold tracking-tight ${textSize} ${textColor}`}>
        EcoTrace
      </span>
    </div>
  );
};