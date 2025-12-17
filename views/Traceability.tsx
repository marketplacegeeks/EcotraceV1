import React, { useState } from 'react';
import { Card, Input, Button, Badge } from '../components/UI';
import { getTraceabilityChain } from '../services/api';
import { TraceableItem, BatchType } from '../types';
import { Search, ArrowUp, Link as LinkIcon } from 'lucide-react';

const ItemNode: React.FC<{ item: TraceableItem; isRoot?: boolean }> = ({ item, isRoot }) => (
  <div className={`
    p-5 rounded-2xl border transition-all duration-300 relative group
    ${isRoot 
      ? 'bg-white border-eco-green shadow-xl shadow-eco-green/10 ring-4 ring-eco-green/5 z-10 scale-105' 
      : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
    } 
    flex flex-col gap-2 min-w-[220px] max-w-[240px] text-center items-center
  `}>
    {/* Connector Dot for visual flow */}
    {!isRoot && <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-eco-green transition-colors"></div>}
    
    <div className="mb-2">
      <Badge color={
        item.type === BatchType.INBOUND ? 'bg-blue-50 text-blue-700 border-blue-100' :
        item.type === BatchType.SORTED ? 'bg-orange-50 text-orange-700 border-orange-100' :
        'bg-green-50 text-green-700 border-green-100'
      }>{item.type}</Badge>
    </div>
    
    <div className="font-mono font-bold text-lg text-eco-charcoal tracking-tight">{item.id}</div>
    
    <div className="text-sm font-medium text-gray-600 leading-tight px-2">
       {item.type === BatchType.INBOUND && (item as any).supplier}
       {item.type === BatchType.SORTED && `${(item as any).color} ${(item as any).material}`}
       {item.type === BatchType.FIBRE && (item as any).qualityGrade}
    </div>
    
    <div className="mt-2 pt-2 border-t border-gray-50 w-full flex justify-between items-center text-xs">
       <span className="font-bold text-eco-charcoal">{(item as any).weightKg} kg</span>
       <span className="text-gray-400">{item.createdAt.split('T')[0]}</span>
    </div>
  </div>
);

export const TraceabilityView: React.FC = () => {
  const [searchId, setSearchId] = useState('');
  const [chain, setChain] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setSearched(true);
    setNotFound(false);
    const result = await getTraceabilityChain(searchId.trim());
    if (result) {
      setChain(result);
    } else {
      setChain(null);
      setNotFound(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col">
      {/* Hero Search Section - Moves to top when searched */}
      <div className={`transition-all duration-700 ease-out flex flex-col items-center ${searched ? 'pt-0 mb-8' : 'pt-32 mb-0'}`}>
         {!searched && (
            <div className="mb-8 text-center animate-fade-in">
               <div className="w-16 h-16 bg-eco-green/10 text-eco-green rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3">
                  <LinkIcon size={32} />
               </div>
               <h2 className="text-3xl font-bold text-eco-charcoal mb-2">Traceability Explorer</h2>
               <p className="text-gray-400">Scan or enter an ID to visualize the entire supply chain lineage.</p>
            </div>
         )}

         <Card className={`w-full max-w-lg transition-all duration-500 ${searched ? 'p-4 rounded-2xl shadow-sm' : 'p-6 shadow-xl shadow-eco-green/5'}`}>
          <form onSubmit={handleSearch} className="flex gap-2 items-center">
            <div className="flex-1">
               <Input 
                 label="" 
                 placeholder="e.g. FP-123456" 
                 className={`mb-0 transition-all ${searched ? 'py-3 text-base' : 'py-4 text-xl'}`}
                 value={searchId}
                 onChange={e => setSearchId(e.target.value)}
                 autoFocus
               />
            </div>
            <Button type="submit" className={`w-auto mb-6 aspect-square flex items-center justify-center bg-eco-charcoal text-white hover:bg-black transition-all ${searched ? 'h-[50px] rounded-xl' : 'h-[60px] rounded-2xl'}`}>
              <Search size={24} />
            </Button>
          </form>
         </Card>
      </div>

      {notFound && (
        <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in zoom-in-95">
          <div className="bg-red-50 p-4 rounded-full mb-4">
             <Search size={24} className="text-red-400" />
          </div>
          <p className="text-gray-900 font-bold">ID Not Found</p>
          <p className="text-gray-500 text-sm">Please check the ID and try again.</p>
        </div>
      )}

      {chain && (
        <div className="flex flex-col items-center pb-20 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Visualization Tree */}
          <div className="relative flex flex-col items-center gap-12 w-full max-w-4xl">
            
            {/* Root Node */}
            <div className="relative z-10">
               <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-eco-green uppercase tracking-widest bg-eco-green/5 px-3 py-1 rounded-full">Selected Item</div>
               <ItemNode item={chain.root} isRoot />
            </div>

            {chain.parents.length > 0 && (
              <div className="flex flex-col items-center w-full relative animate-in fade-in slide-in-from-bottom-4 delay-100">
                {/* Connecting Line */}
                <div className="h-12 w-px bg-gradient-to-b from-eco-green/50 to-gray-300 absolute -top-12 left-1/2"></div>
                <div className="w-2 h-2 rounded-full bg-gray-300 absolute -top-1 left-1/2 -translate-x-1/2"></div>
                
                <div className="w-full bg-gray-50/50 rounded-[3rem] p-8 border border-gray-100/50 relative">
                   <h3 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Composed From</h3>
                   <div className="flex flex-wrap justify-center gap-8">
                     {chain.parents.map((p: TraceableItem) => (
                       <ItemNode key={p.id} item={p} />
                     ))}
                   </div>
                </div>
              </div>
            )}

            {chain.grandParents.length > 0 && (
              <div className="flex flex-col items-center w-full relative animate-in fade-in slide-in-from-bottom-4 delay-200">
                {/* Connecting Line */}
                <div className="h-12 w-px bg-gray-300 absolute -top-12 left-1/2"></div>
                 <div className="w-2 h-2 rounded-full bg-gray-300 absolute -top-1 left-1/2 -translate-x-1/2"></div>

                <div className="w-full bg-gray-50/50 rounded-[3rem] p-8 border border-gray-100/50 relative">
                  <h3 className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Originating From</h3>
                  <div className="flex flex-wrap justify-center gap-8">
                    {chain.grandParents.map((p: TraceableItem) => (
                      <ItemNode key={p.id} item={p} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};