import React from 'react';
import { LogOut, Home, Box, Layers, Factory, Search, History, Check, Settings, Ship, Printer } from 'lucide-react';
import { User, UserRole } from '../types';
import { Logo } from './Logo';

// --- Navigation ---

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, activeTab, onNavigate }) => {
  if (!user) return <div className="min-h-screen bg-eco-cream flex flex-col">{children}</div>;

  const getNavItems = (role: UserRole) => {
    const operatorItems = [
      { id: 'inbound', label: 'Inbound', icon: Box },
      { id: 'sorting', label: 'Sorting', icon: Layers },
      { id: 'fibre', label: 'Fibre', icon: Factory },
      { id: 'consignment', label: 'Consignment', icon: Ship },
      { id: 'trace', label: 'Trace', icon: Search },
    ];

    if (role === UserRole.ADMIN) {
        return [
            { id: 'home', label: 'Home', icon: Home },
            ...operatorItems,
            { id: 'printing', label: 'Printing', icon: Printer },
            { id: 'admin', label: 'Admin', icon: History },
            { id: 'configs', label: 'Configs', icon: Settings },
        ];
    }
    
    return operatorItems;
  };

  const NAV_ITEMS = getNavItems(user.role);

  return (
    <div className="min-h-screen flex flex-col bg-eco-cream pb-24 md:pb-0 font-sans">
      {/* Top Header - Dark Green with Texture */}
      <header className="bg-eco-green text-white px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-xl shadow-eco-green/10 relative overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-denim-texture opacity-20 pointer-events-none mix-blend-overlay"></div>
        
        <div className="relative z-10 flex items-center gap-2">
           <Logo size="sm" variant="light" />
        </div>

        <div className="relative z-10 flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-bold tracking-wide">{user.username}</span>
            <span className="text-[10px] uppercase tracking-widest opacity-80 bg-white/10 px-2 py-0.5 rounded-md text-white border border-white/10">{user.role}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="group flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-white/80 hover:text-white"
            title="Log Out"
          >
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 w-full max-w-5xl mx-auto animate-fade-in">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Floating Glass */}
      <div className="fixed bottom-6 left-6 right-6 md:hidden z-30">
        <nav className="bg-eco-charcoal/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-white/10 flex justify-around p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl w-full transition-all duration-300 relative group`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/10 rounded-xl animate-fade-in"></div>
                )}
                <item.icon 
                  size={22} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 relative z-10 ${isActive ? 'text-eco-orange -translate-y-0.5' : 'text-gray-400 group-active:scale-95'}`} 
                />
                <span className={`text-[9px] font-bold mt-1 transition-all duration-300 relative z-10 ${isActive ? 'text-white opacity-100' : 'opacity-0 h-0 hidden'}`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex flex-col fixed left-0 top-[72px] bottom-0 w-24 bg-white border-r border-gray-100 pt-6 z-20 shadow-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center p-4 mb-3 mx-3 rounded-2xl transition-all duration-200 group relative ${
                isActive ? 'bg-eco-green/5' : 'hover:bg-gray-50'
              }`}
            >
               {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-eco-orange rounded-r-full"></div>}
              <item.icon 
                size={24} 
                strokeWidth={isActive ? 2.5 : 2} 
                className={`mb-2 transition-transform group-hover:scale-110 ${isActive ? 'text-eco-green' : 'text-gray-400'}`} 
              />
              <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'text-eco-green' : 'text-gray-400'}`}>{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  );
};

// --- Components ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'disabled' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', className = '', isLoading, children, ...props }) => {
  const baseStyle = "w-full py-4 px-6 rounded-2xl font-bold text-base tracking-wide transition-all duration-200 transform active:scale-[0.98] flex items-center justify-center";
  
  const variants = {
    primary: "bg-eco-orange text-white hover:bg-[#E57A4E] shadow-xl shadow-eco-orange/20 border border-transparent",
    secondary: "bg-eco-charcoal text-white hover:bg-[#4D4D4D] shadow-xl shadow-eco-charcoal/20 border border-transparent",
    disabled: "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none active:scale-100",
    ghost: "bg-transparent text-eco-charcoal hover:bg-gray-100",
  };

  const finalVariant = (props.disabled || isLoading) ? 'disabled' : variant;

  return (
    <button className={`${baseStyle} ${variants[finalVariant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
      {isLoading ? (
        <span className="flex items-center gap-2">
           <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           Processing...
        </span>
      ) : children}
    </button>
  );
};

// FIX: Update Card component to accept standard HTML div attributes like onClick.
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string; title?: string; action?: React.ReactNode; }> = ({ children, className = '', title, action, ...props }) => (
  <div className={`bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 ${className}`} {...props}>
    {(title || action) && (
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-50">
        {title && <h3 className="text-xl font-bold text-eco-charcoal tracking-tight">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    {children}
  </div>
);

// Standard Input with optional "Large Text" mode for numeric entry ease
export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; largeText?: boolean }> = ({ label, largeText, className = '', ...props }) => (
  <div className="mb-6 group">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-eco-orange transition-colors">{label}</label>
    <input
      className={`w-full bg-eco-cream border border-transparent hover:border-gray-200 rounded-2xl text-eco-charcoal placeholder:text-gray-400 focus:bg-white focus:border-eco-orange focus:ring-4 focus:ring-eco-orange/10 outline-none transition-all ${largeText ? 'p-5 text-3xl font-mono tracking-tight font-bold' : 'p-4 font-semibold'} ${className}`}
      {...props}
    />
  </div>
);

// Selection Grid - Replaces Select for small sets of options (Pills)
export const SelectionGrid: React.FC<{
  label: string;
  options: { id: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
  className?: string;
}> = ({ label, options, value, onChange, className = '' }) => (
  <div className={`mb-8 ${className}`}>
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{label}</label>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={`py-4 px-3 rounded-2xl text-sm font-bold transition-all border relative overflow-hidden active:scale-95 ${
            value === opt.id
              ? 'border-eco-orange bg-eco-orange text-white shadow-lg shadow-eco-orange/20'
              : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  </div>
);

export const MultiSelectionGrid: React.FC<{
  label: string;
  options: string[];
  values: string[];
  onChange: (newValues: string[]) => void;
  className?: string;
}> = ({ label, options, values, onChange, className = '' }) => {
  const handleToggle = (opt: string) => {
    const newValues = values.includes(opt)
      ? values.filter(v => v !== opt)
      : [...values, opt];
    onChange(newValues);
  };
  return (
      <div className={`mb-8 ${className}`}>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{label}</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {options.map((opt) => (
                  <button
                      key={opt}
                      type="button"
                      onClick={() => handleToggle(opt)}
                      className={`py-4 px-3 rounded-2xl text-sm font-bold transition-all border relative overflow-hidden active:scale-95 flex items-center justify-center gap-2 ${
                          values.includes(opt)
                              ? 'border-eco-orange bg-eco-orange text-white shadow-lg shadow-eco-orange/20'
                              : 'border-gray-100 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                  >
                      {values.includes(opt) && <Check size={16} />}
                      {opt}
                  </button>
              ))}
          </div>
      </div>
  );
};


// Visual Color Selector
export const ColorSelector: React.FC<{
  label: string;
  options: { name: string; hex: string; class?: string }[];
  value: string;
  onChange: (val: string) => void;
}> = ({ label, options, value, onChange }) => (
  <div className="mb-8">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-1">{label}</label>
    <div className="flex flex-wrap gap-4">
      {options.map((opt) => {
        const isSelected = value === opt.name;
        return (
          <button
            key={opt.name}
            type="button"
            onClick={() => onChange(opt.name)}
            className={`group relative flex flex-col items-center gap-2 transition-all active:scale-90`}
          >
            <div 
              className={`w-14 h-14 rounded-full shadow-sm border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-eco-orange ring-4 ring-eco-orange/10 scale-110 shadow-md' : 'border-gray-100 hover:border-gray-300'}`}
              style={{ backgroundColor: opt.hex }}
            >
              {isSelected && <div className="bg-black/20 backdrop-blur-md rounded-full p-1"><Check size={16} className="text-white" strokeWidth={3} /></div>}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-eco-orange' : 'text-gray-400'}`}>{opt.name}</span>
          </button>
        );
      })}
    </div>
  </div>
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }> = ({ label, children, className = '', ...props }) => (
  <div className="mb-6 group">
    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-eco-orange transition-colors">{label}</label>
    <div className="relative">
      <select
        className={`w-full p-4 bg-eco-cream border border-transparent hover:border-gray-200 rounded-2xl text-eco-charcoal focus:bg-white focus:border-eco-orange focus:ring-4 focus:ring-eco-orange/10 outline-none transition-all appearance-none font-bold text-lg ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-gray-100 text-gray-700' }) => (
  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border border-current/10 ${color}`}>
    {children}
  </span>
);