import React from 'react';
import { BarChart3, QrCode, ShieldCheck, ArrowRight, Play } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Button } from '../components/UI';

interface LandingProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const LandingView: React.FC<LandingProps> = ({ onGetStarted, onSignIn }) => {
  return (
    <div className="min-h-screen bg-eco-cream flex flex-col font-sans overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 px-6 py-4 glass">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Logo />
          <div className="flex gap-3">
            <button 
              onClick={onSignIn}
              className="px-5 py-2 text-sm font-bold text-eco-charcoal hover:text-eco-orange transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2 text-sm font-bold text-white bg-eco-charcoal rounded-full hover:bg-black transition-all shadow-md"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 px-4 overflow-hidden">
        {/* Fabric Pattern Overlay */}
        <div className="absolute inset-0 bg-denim-texture opacity-10 pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-green/5 border border-eco-green/10 text-eco-green text-xs font-bold tracking-widest uppercase mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
            Circular Economy v1.0
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold text-eco-green tracking-tight mb-8 leading-[0.95] animate-slide-up">
            Manage your <br/>
            <span className="text-eco-orange">textile waste.</span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-12 leading-relaxed animate-slide-up [animation-delay:0.2s]">
            The complete operating system for modern recycling. Track batches, sort materials, and generate fibre packs with verifiable lineage.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto animate-slide-up [animation-delay:0.4s]">
            <Button onClick={onGetStarted} variant="primary">
              Scan Clothes
            </Button>
            <Button onClick={onSignIn} variant="secondary">
              View Fibre Stats
            </Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 rounded-3xl bg-eco-cream/50 border border-gray-100 hover:border-eco-orange/30 transition-all duration-300 hover:shadow-xl group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <QrCode className="text-eco-green" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-eco-charcoal mb-4">QR Identification</h3>
              <p className="text-gray-500 leading-relaxed text-lg">
                Automated QR generation for every stage of the lifecycle. Scan to verify origin instantly.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-eco-cream/50 border border-gray-100 hover:border-eco-orange/30 transition-all duration-300 hover:shadow-xl group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="text-eco-orange" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-eco-charcoal mb-4">Deep Lineage</h3>
              <p className="text-gray-500 leading-relaxed text-lg">
                Traverse the graph from finished fibre back to the original supplier delivery.
              </p>
            </div>
            <div className="p-10 rounded-3xl bg-eco-cream/50 border border-gray-100 hover:border-eco-orange/30 transition-all duration-300 hover:shadow-xl group">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="text-eco-charcoal" size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-eco-charcoal mb-4">Audit Ready</h3>
              <p className="text-gray-500 leading-relaxed text-lg">
                Immutable action logs and role-based access ensures compliance and trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-eco-green text-white/80">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Logo size="sm" variant="light" />
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};