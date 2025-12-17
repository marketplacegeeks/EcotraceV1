import React, { useState, useEffect } from 'react';
import { Layout, Card, Badge } from './components/UI';
import { SplashScreen } from './components/SplashScreen';
import { Onboarding } from './components/Onboarding';
import { LandingView } from './views/Landing';
import { AuthView } from './views/Auth';
import { InboundView } from './views/Inbound';
import { SortingView } from './views/Sorting';
import { FibreView } from './views/Fibre';
import { TraceabilityView } from './views/Traceability';
import { AdminView } from './views/Admin';
import { getCurrentUser, logout, getAllItems } from './services/api';
import { User, UserRole, TraceableItem } from './types';
import { ArrowRight, Box, Clock, TrendingUp, AlertCircle, Calendar, Activity } from 'lucide-react';

type PublicRoute = 'landing' | 'login' | 'signup';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  // Public Routing State
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('landing');
  
  // Private Routing State
  const [activeTab, setActiveTab] = useState<string>('home');

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    inboundCount: 0,
    myTotalProcessed: 0,
    recentActivity: [] as TraceableItem[]
  });

  useEffect(() => {
    // Check session
    const session = getCurrentUser();
    if (session) setUser(session);
    
    // Check onboarding status
    const hasSeenOnboarding = localStorage.getItem('ecotrace_onboarding_completed');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Fetch Dashboard Data when on Home tab
  useEffect(() => {
    if (user && activeTab === 'home') {
      getAllItems().then(items => {
        // Count total inbound (inventory)
        const inbound = items.filter(i => i.type === 'INBOUND').length;
        
        // Count items created by THIS user
        const myItems = items.filter(i => i.createdBy === user.username).length;
        
        // Get 3 most recent items sorted by date
        const recent = [...items]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);

        setDashboardData({
          inboundCount: inbound,
          myTotalProcessed: myItems,
          recentActivity: recent
        });
      });
    }
  }, [user, activeTab]);

  const handleSplashFinish = () => {
    setLoading(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('ecotrace_onboarding_completed', 'true');
    setShowOnboarding(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPublicRoute('landing');
    setActiveTab('home');
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setActiveTab('home');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (showOnboarding && !user) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // --- Public Views ---
  if (!user) {
    if (publicRoute === 'landing') {
      return (
        <LandingView 
          onGetStarted={() => setPublicRoute('signup')} 
          onSignIn={() => setPublicRoute('login')} 
        />
      );
    }
    return (
      <AuthView 
        initialMode={publicRoute === 'signup' ? 'signup' : 'login'}
        onSuccess={handleLoginSuccess}
        onBack={() => setPublicRoute('landing')}
      />
    );
  }

  // --- Protected Views ---
  const renderAppView = () => {
    switch (activeTab) {
      case 'inbound': return <InboundView />;
      case 'sorting': return <SortingView />;
      case 'fibre': return <FibreView />;
      case 'trace': return <TraceabilityView />;
      case 'admin': 
        return user?.role === UserRole.ADMIN ? <AdminView /> : <div className="flex h-full items-center justify-center text-red-500 font-bold bg-white rounded-2xl p-10 shadow-sm border border-red-100">Access Denied: Admin Rights Required</div>;
      default:
        // Modern Personalized Dashboard
        return (
          <div className="space-y-8 animate-slide-up pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getGreeting()}, {user?.username}.</h2>
                <p className="text-slate-500 mt-1 font-medium">Ready to track some sustainable impact today?</p>
              </div>
              <div className="hidden md:flex flex-col items-end bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> Today
                </p>
                <p className="text-lg font-mono font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:border-brand-200 transition-colors cursor-default group">
                 <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                   <Box size={20} />
                 </div>
                 <div>
                   <span className="text-3xl font-bold text-slate-900 block tracking-tight">{dashboardData.inboundCount}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Inbound</span>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:border-brand-200 transition-colors cursor-default group">
                 <div className="bg-orange-50 w-10 h-10 rounded-full flex items-center justify-center text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                   <TrendingUp size={20} />
                 </div>
                 <div>
                   <span className="text-3xl font-bold text-slate-900 block tracking-tight">{dashboardData.myTotalProcessed}</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">My Batches</span>
                 </div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-32 hover:border-brand-200 transition-colors cursor-default group">
                 <div className="bg-green-50 w-10 h-10 rounded-full flex items-center justify-center text-green-600 mb-2 group-hover:scale-110 transition-transform">
                   <Clock size={20} />
                 </div>
                 <div>
                   <span className="text-3xl font-bold text-slate-900 block tracking-tight">98%</span>
                   <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Efficiency</span>
                 </div>
              </div>
              <div className="bg-eco-orange p-5 rounded-2xl shadow-lg shadow-orange-200 flex flex-col justify-between h-32 text-white relative overflow-hidden group cursor-pointer" onClick={() => setActiveTab('inbound')}>
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
                    <Box size={60} />
                 </div>
                 <div className="z-10 h-full flex flex-col justify-between">
                   <span className="text-xs font-bold uppercase tracking-wider opacity-90 block mb-1">Quick Action</span>
                   <span className="text-xl font-bold flex items-center gap-2">New Batch <ArrowRight size={20} /></span>
                 </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Main Action Center */}
              <div className="md:col-span-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Workflow Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button onClick={() => setActiveTab('inbound')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all text-left">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-brand-50 rounded-2xl text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                        <Box size={24} />
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Inbound Receiving</h4>
                    <p className="text-sm text-slate-500 font-medium">Log deliveries and generate batch QRs.</p>
                  </button>

                  <button onClick={() => setActiveTab('sorting')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all text-left">
                     <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-orange-50 rounded-2xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Box size={24} />
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-orange-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Material Sorting</h4>
                    <p className="text-sm text-slate-500 font-medium">Classify and weigh sorted packs.</p>
                  </button>

                  <button onClick={() => setActiveTab('fibre')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left">
                     <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Box size={24} />
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Fibre Processing</h4>
                    <p className="text-sm text-slate-500 font-medium">Create final product from packs.</p>
                  </button>
                  
                  <button onClick={() => setActiveTab('trace')} className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-purple-200 transition-all text-left">
                     <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-50 rounded-2xl text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Box size={24} />
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 mb-1">Traceability</h4>
                    <p className="text-sm text-slate-500 font-medium">Track lineage and audit logs.</p>
                  </button>
                </div>
              </div>

              {/* Sidebar / Recent Activity */}
              <div>
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
                    <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Live
                    </span>
                 </div>
                 
                 <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                    <div className="space-y-6">
                      {dashboardData.recentActivity.length > 0 ? (
                        dashboardData.recentActivity.map((item) => (
                          <div key={item.id} className="flex items-start gap-3 group">
                             <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                               item.type === 'INBOUND' ? 'bg-blue-400' : 
                               item.type === 'SORTED' ? 'bg-orange-400' : 'bg-green-400'
                             }`}></div>
                             <div>
                               <p className="text-xs font-bold text-slate-800 group-hover:text-eco-orange transition-colors">
                                 {item.type === 'INBOUND' ? 'Received Batch' : 
                                  item.type === 'SORTED' ? 'Sorted Pack' : 'Fibre Created'}
                               </p>
                               <p className="text-xs text-slate-500 mt-0.5 font-mono">{item.id}</p>
                               <p className="text-[10px] text-slate-400 mt-1">
                                 {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by {item.createdBy}
                               </p>
                             </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-sm text-slate-400 italic">No recent activity.</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1 font-medium">Personal Goal</p>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                          <div 
                            className="bg-eco-orange h-full rounded-full transition-all duration-1000" 
                            style={{ width: `${Math.min((dashboardData.myTotalProcessed / 10) * 100, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-bold text-slate-700">{dashboardData.myTotalProcessed} / 10 Batches Today</p>
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      onNavigate={setActiveTab}
    >
      {renderAppView()}
    </Layout>
  );
};

export default App;