import React, { useState, useEffect } from 'react';
import { Layout, Card, Badge } from './components/UI';
import { SplashScreen } from './components/SplashScreen';
import { LandingView } from './views/Landing';
import { AuthView } from './views/Auth';
import { InboundView } from './views/Inbound';
import { SortingView } from './views/Sorting';
import { FibreView } from './views/Fibre';
import { TraceabilityView } from './views/Traceability';
import { AdminView } from './views/Admin';
import { ConfigurationView } from './views/Configuration';
import { ConsignmentView } from './views/Consignment';
import { PrintingView } from './views/Printing';
import { getCurrentUser, logout, getAllItems, getAllUsers } from './services/api';
import { User, UserRole, TraceableItem, InboundBatch, BatchType } from './types';
import { ArrowRight, Box, Clock, TrendingUp, Calendar } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type PublicRoute = 'landing' | 'login' | 'signup';
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  
  // Public Routing State
  const [publicRoute, setPublicRoute] = useState<PublicRoute>('landing');
  
  // Private Routing State
  const [activeTab, setActiveTab] = useState<string>('home');

  // Dashboard Data State
  const [dashboardData, setDashboardData] = useState({
    // Operator stats
    inboundCount: 0,
    myTotalProcessed: 0,
    // Admin stats
    totalCartons: 0,
    totalFibreKg: 0,
    totalUsers: 0,
    totalBatches: 0,
    materialBreakdown: [] as { name: string; value: number }[],
    productionVolume: [] as { name: string; value: number }[],
  });

  useEffect(() => {
    // Check session
    const session = getCurrentUser();
    if (session) setUser(session);
  }, []);

  // Redirect OPERATOR role from 'home' to 'inbound'
  useEffect(() => {
    if (user && user.role === UserRole.OPERATOR && activeTab === 'home') {
      setActiveTab('inbound');
    }
  }, [user, activeTab]);

  // Fetch Dashboard Data when on Home tab
  useEffect(() => {
    if (user && activeTab === 'home') {
      Promise.all([getAllItems(), getAllUsers()]).then(([items, users]) => {
        // Operator calcs
        const inbound = items.filter(i => i.type === 'INBOUND').length;
        const myItems = items.filter(i => i.createdBy === user.username).length;
        
        // Admin calcs
        const inboundCartonTotal = items.filter(i => i.type === BatchType.INBOUND).reduce((acc, curr) => acc + (curr as InboundBatch).cartonCount, 0);
        const fibreTotal = items.filter(i => i.type === BatchType.FIBRE).reduce((acc, curr) => acc + (curr as any).weightKg, 0);
        const materialData = items
          .filter(i => i.type === BatchType.SORTED)
          .reduce((acc: any[], curr: any) => {
            const idx = acc.findIndex(a => a.name === curr.material);
            if (idx >= 0) acc[idx].value += curr.weightKg;
            else acc.push({ name: curr.material, value: curr.weightKg });
            return acc;
          }, []);

        const productionVolume = [
          { name: 'Inbound', value: items.filter(i => i.type === BatchType.INBOUND).length },
          { name: 'Sorted', value: items.filter(i => i.type === BatchType.SORTED).length },
          { name: 'Fibre', value: items.filter(i => i.type === BatchType.FIBRE).length },
        ];

        setDashboardData({
          inboundCount: inbound,
          myTotalProcessed: myItems,
          totalCartons: inboundCartonTotal,
          totalFibreKg: fibreTotal,
          totalUsers: users.length,
          totalBatches: items.length,
          materialBreakdown: materialData,
          productionVolume: productionVolume,
        });
      });
    }
  }, [user, activeTab]);

  const handleSplashFinish = () => {
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setPublicRoute('landing');
    setActiveTab('home');
  };

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setActiveTab(user.role === UserRole.OPERATOR ? 'inbound' : 'home');
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
    // Prevent flicker of home page for OPERATOR while redirecting
    if (user?.role === UserRole.OPERATOR && activeTab === 'home') {
      return null;
    }
    
    switch (activeTab) {
      case 'inbound': return <InboundView />;
      case 'sorting': return <SortingView />;
      case 'fibre': return <FibreView />;
      case 'consignment': return <ConsignmentView />;
      case 'trace': return <TraceabilityView />;
      case 'printing':
        return user?.role === UserRole.ADMIN ? <PrintingView /> : <div className="flex h-full items-center justify-center text-red-500 font-bold bg-white rounded-2xl p-10 shadow-sm border border-red-100">Access Denied: Admin Rights Required</div>;
      case 'admin': 
        return user?.role === UserRole.ADMIN ? <AdminView /> : <div className="flex h-full items-center justify-center text-red-500 font-bold bg-white rounded-2xl p-10 shadow-sm border border-red-100">Access Denied: Admin Rights Required</div>;
      case 'configs':
        return user?.role === UserRole.ADMIN ? <ConfigurationView /> : <div className="flex h-full items-center justify-center text-red-500 font-bold bg-white rounded-2xl p-10 shadow-sm border border-red-100">Access Denied: Admin Rights Required</div>;
      default:
        // Modern Personalized Dashboard
        return (
          <div className="space-y-8 animate-slide-up pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{getGreeting()}, {user?.username}.</h2>
                <p className="text-slate-500 mt-1 font-medium">
                  {user.role === UserRole.ADMIN 
                    ? "Here's a high-level overview of system activity."
                    : "Ready to track some sustainable impact today?"
                  }
                </p>
              </div>
              <div className="hidden md:flex flex-col items-end bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={10} /> Today
                </p>
                <p className="text-lg font-mono font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>
            
            {user.role === UserRole.ADMIN ? (
              <div className="space-y-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-100 p-5">
                    <div className="text-xs text-blue-600 font-bold uppercase">Total Cartons</div>
                    <div className="text-3xl font-bold text-blue-900">{dashboardData.totalCartons}</div>
                  </Card>
                  <Card className="bg-green-50 border-green-100 p-5">
                    <div className="text-xs text-green-600 font-bold uppercase">Fibre Produced</div>
                    <div className="text-3xl font-bold text-green-900">{dashboardData.totalFibreKg.toFixed(0)} kg</div>
                  </Card>
                  <Card className="bg-purple-50 border-purple-100 p-5">
                    <div className="text-xs text-purple-600 font-bold uppercase">Total Users</div>
                    <div className="text-3xl font-bold text-purple-900">{dashboardData.totalUsers}</div>
                  </Card>
                  <Card className="bg-gray-100 border-gray-200 p-5">
                    <div className="text-xs text-gray-600 font-bold uppercase">Total Batches</div>
                    <div className="text-3xl font-bold text-gray-900">{dashboardData.totalBatches}</div>
                  </Card>
                </div>
                {/* Charts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card title="Material Breakdown (kg)">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={dashboardData.materialBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                            {dashboardData.materialBreakdown.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  <Card title="Production Volume">
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardData.productionVolume}>
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="value" fill="#4ade80" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              // Operator Stats
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
            )}
            
            {/* Main Action Center */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 mt-6">Workflow Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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