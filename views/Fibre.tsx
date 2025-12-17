import React, { useEffect, useState } from 'react';
import { Card, Button, Input, SelectionGrid, Badge } from '../components/UI';
import { createFibrePack, getItemsByType } from '../services/api';
import { BatchType, SortedPack, FibrePack } from '../types';
import { Plus, Check, Search, PackageOpen } from 'lucide-react';

export const FibreView: React.FC = () => {
  const [sortedPacks, setSortedPacks] = useState<SortedPack[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({ quality: 'Grade A', weightKg: '' });
  const [loading, setLoading] = useState(false);
  const [lastFibre, setLastFibre] = useState<FibrePack | null>(null);

  useEffect(() => {
    getItemsByType<SortedPack>(BatchType.SORTED).then(setSortedPacks);
  }, []);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return alert("Select at least one sorted pack");

    setLoading(true);
    try {
      const fibre = await createFibrePack({
        parentSortedIds: selectedIds,
        qualityGrade: formData.quality,
        weightKg: Number(formData.weightKg)
      });
      setLastFibre(fibre);
      setSelectedIds([]);
      setFormData({ quality: 'Grade A', weightKg: '' });
    } catch (error) {
      alert("Error creating fibre pack");
    } finally {
      setLoading(false);
    }
  };

  const GRADES = ['Grade A', 'Grade B', 'Grade C', 'Mixed Recycled'];

  return (
    <div className="pb-10">
       <div className="mb-8">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
            <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">Step 3 of 3</span>
         </div>
         <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight">Fibre Production</h2>
         <p className="text-gray-500 text-lg">Combine sorted packs into finished fibre inventory.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        {/* Left Col: Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider ml-1">Inventory</h3>
            <span className="text-xs font-bold text-eco-green bg-eco-green/10 px-2 py-1 rounded-md">{sortedPacks.length} Packs Available</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar pb-2">
            {sortedPacks.length > 0 ? (
              sortedPacks.map(pack => {
                const isSelected = selectedIds.includes(pack.id);
                return (
                  <button 
                    key={pack.id}
                    onClick={() => toggleSelection(pack.id)}
                    className={`p-5 rounded-3xl border text-left transition-all duration-200 relative overflow-hidden group shadow-sm ${
                      isSelected 
                        ? 'border-eco-orange bg-white ring-4 ring-eco-orange/10 transform scale-[0.98]' 
                        : 'border-transparent bg-white hover:border-eco-orange/30 hover:shadow-lg'
                    }`}
                  >
                    {/* Visual Tag Effect */}
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-100 border border-gray-200"></div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="font-mono text-xs font-bold text-gray-400 tracking-wider">{pack.id}</div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected ? 'bg-eco-orange text-white scale-110' : 'bg-gray-100 text-gray-300 group-hover:bg-eco-orange/20 group-hover:text-eco-orange'}`}>
                         <Check size={14} strokeWidth={4} className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                       <h4 className="text-lg font-bold text-eco-charcoal">{pack.color} {pack.material}</h4>
                       {pack.brand && <span className="text-xs font-medium text-gray-400">{pack.brand}</span>}
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex justify-between items-center">
                       <Badge color="bg-eco-cream text-eco-charcoal border-transparent">{pack.weightKg} kg</Badge>
                       <span className="text-[10px] text-gray-300 font-bold uppercase">{new Date(pack.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="col-span-2 py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="bg-gray-50 p-4 rounded-full mb-4">
                   <PackageOpen size={32} className="text-gray-300" />
                </div>
                <p className="text-gray-900 font-bold text-lg">No Packs Available</p>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">Process Inbound batches in the Sorting Station to see items here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Creation Form */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <Card title="Production Details" className="shadow-xl shadow-eco-green/5 border-eco-green/10">
            <div className="mb-8 p-4 bg-eco-cream rounded-2xl flex justify-between items-center border border-transparent hover:border-gray-200 transition-colors">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Selected</span>
              <div className="flex items-center gap-2">
                 <span className={`text-2xl font-bold ${selectedIds.length > 0 ? 'text-eco-orange' : 'text-gray-300'}`}>{selectedIds.length}</span>
                 <span className="text-xs font-bold text-gray-400 uppercase">Packs</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <SelectionGrid 
                 label="Quality Output" 
                 options={GRADES}
                 value={formData.quality}
                 onChange={val => setFormData({...formData, quality: val})}
                 className="mb-8"
              />
              
              <div className="relative mb-6">
                <div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">kg</div>
                <Input 
                  label="Final Weight" 
                  type="number"
                  placeholder="0.0"
                  required
                  value={formData.weightKg}
                  onChange={e => setFormData({...formData, weightKg: e.target.value})}
                  largeText
                />
              </div>

              <Button type="submit" isLoading={loading} disabled={selectedIds.length === 0} variant="primary">
                Create Fibre Pack
              </Button>
            </form>
          </Card>

          {lastFibre && (
            <div className="animate-in zoom-in-95 duration-500">
               <div className="bg-eco-green text-white rounded-[2rem] p-8 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  
                  <h3 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-6">Production Complete</h3>
                  <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-lg">
                     <img src={lastFibre.qrCodeUrl} className="w-24 h-24 mix-blend-darken" alt="QR" />
                  </div>
                  <p className="font-mono text-3xl font-bold tracking-widest mb-1">{lastFibre.id}</p>
                  <div className="flex justify-center gap-2 mt-2">
                     <Badge color="bg-white/10 text-white border-white/20 backdrop-blur">{lastFibre.qualityGrade}</Badge>
                     <Badge color="bg-white/10 text-white border-white/20 backdrop-blur">{lastFibre.weightKg} kg</Badge>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};