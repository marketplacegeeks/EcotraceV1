import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Badge, SelectionGrid, ColorSelector } from '../components/UI';
import { createSortedPack, getAllItems } from '../services/api';
import { BatchType, InboundBatch, SortedPack } from '../types';
import { ArrowDown, CheckCircle, Scale, Tag, Palette } from 'lucide-react';

export const SortingView: React.FC = () => {
  const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [formData, setFormData] = useState({ color: 'White', material: 'Cotton', brand: '', weightKg: '' });
  const [loading, setLoading] = useState(false);
  const [lastPack, setLastPack] = useState<SortedPack | null>(null);

  useEffect(() => {
    getAllItems().then(items => {
      setInboundBatches(items.filter(i => i.type === BatchType.INBOUND) as InboundBatch[]);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) return alert("Select an inbound batch first");
    
    setLoading(true);
    try {
      const pack = await createSortedPack({
        parentInboundId: selectedBatchId,
        color: formData.color,
        material: formData.material,
        brand: formData.brand,
        weightKg: Number(formData.weightKg)
      });
      setLastPack(pack);
      // Keep batch selected for rapid entry, reset other fields
      setFormData(prev => ({ ...prev, weightKg: '' })); 
    } catch (err) {
      alert("Error creating sorted pack");
    } finally {
      setLoading(false);
    }
  };

  const MATERIALS = ['Cotton', 'Polyester', 'Denim', 'Blend', 'Wool', 'Linen'];
  const COLORS = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#1a1a1a' },
    { name: 'Grey', hex: '#9CA3AF' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Blue', hex: '#3B82F6' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Mixed', hex: '#E5E7EB' }, // Gradient simulated by icon or handled simply
  ];

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
              <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
              <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">Step 2 of 3</span>
           </div>
           <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight">Sorting Station</h2>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1: Selection */}
        <div className={`transition-all duration-300 ${selectedBatchId ? 'opacity-50 hover:opacity-100' : 'opacity-100'}`}>
          <Card className={`${!selectedBatchId ? 'ring-4 ring-eco-green/10' : ''}`}>
             <div className="mb-4">
               <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">1. Source</h3>
               <h4 className="text-xl font-bold text-eco-charcoal">Select Active Inbound Batch</h4>
             </div>
             
            <Select label="" value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}>
              <option value="">-- Tap to Select --</option>
              {inboundBatches.map(b => (
                <option key={b.id} value={b.id}>{b.id} • {b.supplier} • {b.weightKg}kg</option>
              ))}
            </Select>
          </Card>
        </div>

        {selectedBatchId && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
             
             {/* Form Card */}
             <Card className="relative overflow-hidden ring-4 ring-eco-orange/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-eco-orange"></div>
                
                <div className="mb-6 flex items-center justify-between">
                   <div>
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">2. Classify</h3>
                     <h4 className="text-xl font-bold text-eco-charcoal">Pack Details</h4>
                   </div>
                   <div className="p-2 bg-eco-orange/10 text-eco-orange rounded-xl">
                      <Tag size={24} />
                   </div>
                </div>

               <form onSubmit={handleSubmit}>
                 <SelectionGrid 
                   label="Material Type" 
                   options={MATERIALS} 
                   value={formData.material}
                   onChange={val => setFormData({...formData, material: val})}
                 />
                 
                 <ColorSelector 
                   label="Dominant Color"
                   options={COLORS}
                   value={formData.color}
                   onChange={val => setFormData({...formData, color: val})}
                 />

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-100">
                   <div className="relative">
                      <div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">kg</div>
                       <Input 
                         label="Pack Weight" 
                         type="number" 
                         placeholder="0.0"
                         required
                         value={formData.weightKg}
                         onChange={e => setFormData({...formData, weightKg: e.target.value})}
                         largeText
                       />
                   </div>
                   <Input 
                     label="Brand Label (Optional)" 
                     placeholder="e.g. Nike, Adidas" 
                     value={formData.brand}
                     onChange={e => setFormData({...formData, brand: e.target.value})}
                     className="h-[88px] text-lg font-medium"
                   />
                 </div>

                 <Button type="submit" isLoading={loading} className="mt-6" variant="primary">
                   Generate Sorted Pack QR
                 </Button>
               </form>
             </Card>

             {lastPack && (
               <div className="mt-6 p-6 bg-white rounded-3xl border border-green-100 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-4 relative overflow-hidden group">
                 <div className="absolute left-0 top-0 bottom-0 w-2 bg-green-500"></div>
                 <div className="flex items-center gap-5 relative z-10">
                   <div className="bg-green-50 p-3 rounded-2xl border border-green-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                      <img src={lastPack.qrCodeUrl} className="w-16 h-16 mix-blend-darken" alt="QR"/>
                   </div>
                   <div>
                     <div className="flex items-center gap-2 mb-1">
                       <CheckCircle size={18} className="text-green-600" strokeWidth={3} />
                       <span className="font-bold text-green-900 text-lg">Pack Created</span>
                     </div>
                     <p className="text-sm text-green-700 font-mono tracking-wide">{lastPack.id}</p>
                   </div>
                 </div>
                 <Badge color="bg-green-100 text-green-800 border-green-200 text-lg px-4 py-2">{lastPack.weightKg} kg</Badge>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};