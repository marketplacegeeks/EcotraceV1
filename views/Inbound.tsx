import React, { useState } from 'react';
import { Card, Button, Input } from '../components/UI';
import { createInboundBatch } from '../services/api';
import { InboundBatch } from '../types';
import { QrCode, Truck, Calendar, Scale } from 'lucide-react';

export const InboundView: React.FC = () => {
  const [formData, setFormData] = useState({ supplier: '', weightKg: '', receivedDate: new Date().toISOString().split('T')[0] });
  const [loading, setLoading] = useState(false);
  const [lastBatch, setLastBatch] = useState<InboundBatch | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const batch = await createInboundBatch({
        supplier: formData.supplier,
        weightKg: Number(formData.weightKg),
        receivedDate: formData.receivedDate
      });
      setLastBatch(batch);
      setFormData({ supplier: '', weightKg: '', receivedDate: new Date().toISOString().split('T')[0] });
    } catch (error) {
      alert("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-10">
      {/* Header Section */}
      <div className="mb-8">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
            <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">Step 1 of 3</span>
         </div>
         <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight mb-2">Inbound Receiving</h2>
         <p className="text-gray-500 text-lg">Log new deliveries to generate a unique tracking ID.</p>
      </div>

      {!lastBatch ? (
        <Card className="animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div>
                <h3 className="text-lg font-bold text-gray-800">Delivery Details</h3>
            </div>
            
            <Input
              label="Supplier Name"
              placeholder="e.g. EcoCollect Inc."
              value={formData.supplier}
              onChange={e => setFormData({ ...formData, supplier: e.target.value })}
              required
              className="font-bold text-lg"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="relative">
                <div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">kg</div>
                <Input
                  label="Total Weight"
                  type="number"
                  placeholder="0.0"
                  value={formData.weightKg}
                  onChange={e => setFormData({ ...formData, weightKg: e.target.value })}
                  required
                  largeText
                />
              </div>
              
              <Input
                label="Received Date"
                type="date"
                value={formData.receivedDate}
                onChange={e => setFormData({ ...formData, receivedDate: e.target.value })}
                required
                className="h-[88px] text-lg font-medium"
              />
            </div>

            <div className="pt-6">
                <Button type="submit" isLoading={loading} variant="primary">
                  Generate Batch QR
                </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="animate-in fade-in zoom-in-95 duration-500">
          <Card className="bg-gradient-to-br from-white to-eco-green/5 border-eco-green/20 text-center relative overflow-hidden">
             {/* Success Decorative Elements */}
             <div className="absolute top-0 right-0 p-12 -mr-8 -mt-8 bg-eco-green/5 rounded-full blur-2xl"></div>
             
             <div className="relative z-10 flex flex-col items-center p-4">
               <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <QrCode size={32} />
               </div>
               
               <h3 className="text-2xl font-bold text-eco-charcoal mb-2">Batch Registered</h3>
               <p className="text-gray-500 mb-8 max-w-xs mx-auto">The material has been logged into the system. Print the label below.</p>

               <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-8 transform hover:scale-105 transition-transform duration-300">
                  <img src={lastBatch.qrCodeUrl} alt="QR Code" className="w-48 h-48 mix-blend-multiply opacity-90" />
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                     <div className="font-mono text-xl font-bold text-eco-charcoal tracking-wider">{lastBatch.id}</div>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                 <Button variant="secondary" onClick={() => window.print()}>
                   Print Label
                 </Button>
                 <Button variant="ghost" onClick={() => setLastBatch(null)}>
                   Register Another
                 </Button>
               </div>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};