import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { createInboundBatch, getSuppliers, getCurrentUser } from '../services/api';
import { InboundBatch } from '../types';
import { QrCode, Truck, Package, ScanLine, ArrowLeft, CheckCircle, List } from 'lucide-react';

export const InboundView: React.FC = () => {
  const [step, setStep] = useState(1);
  const [batchDetails, setBatchDetails] = useState({ supplier: '', cartonCount: '' });
  const [scannedCartons, setScannedCartons] = useState<string[]>([]);
  const [manualQrInput, setManualQrInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastBatch, setLastBatch] = useState<InboundBatch | null>(null);
  const [suppliers, setSuppliers] = useState<string[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const supplierList = await getSuppliers();
        setSuppliers(supplierList);
      } catch (error) {
        console.error("Failed to fetch suppliers", error);
      }
    };
    fetchSuppliers();
  }, []);

  const handleProceedToScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (Number(batchDetails.cartonCount) <= 0) {
      alert("Please enter a valid number of cartons.");
      return;
    }
    setStep(2);
  };
  
  const handleAddManualQr = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualQrInput.trim()) return;

    if (scannedCartons.length >= Number(batchDetails.cartonCount)) {
      alert("All cartons have been scanned.");
      return;
    }
    
    if (scannedCartons.includes(manualQrInput.trim())) {
      alert("This carton has already been scanned.");
      return;
    }

    setScannedCartons(prev => [...prev, manualQrInput.trim()]);
    setManualQrInput('');
  };

  const handleCreateBatch = async () => {
    setLoading(true);
    try {
      const batch = await createInboundBatch({
        supplier: batchDetails.supplier,
        cartonCount: Number(batchDetails.cartonCount),
        cartonIds: scannedCartons,
      });
      setLastBatch(batch);
      setStep(3); // Move to confirmation step
    } catch (error) {
      alert("Failed to create batch");
    } finally {
      setLoading(false);
    }
  };
  
  const resetFlow = () => {
    setStep(1);
    setBatchDetails({ supplier: '', cartonCount: '' });
    setScannedCartons([]);
    setManualQrInput('');
    setLastBatch(null);
  }

  const renderStep1_Setup = () => (
    <Card className="animate-slide-up">
      <form onSubmit={handleProceedToScan} className="space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Truck size={20} /></div>
          <h3 className="text-lg font-bold text-gray-800">Delivery Details</h3>
        </div>
        
        <Select
          label="Supplier Name"
          value={batchDetails.supplier}
          onChange={e => setBatchDetails({ ...batchDetails, supplier: e.target.value })}
          required
        >
          <option value="">-- Select a Supplier --</option>
          {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        
        <div className="relative pt-2">
          <div className="absolute right-4 top-[60px] text-gray-400 pointer-events-none font-bold">cartons</div>
          <Input
            label="Number of Cartons"
            type="number"
            placeholder="0"
            value={batchDetails.cartonCount}
            onChange={e => setBatchDetails({ ...batchDetails, cartonCount: e.target.value })}
            required
            largeText
            step="1"
          />
        </div>

        <div className="pt-6">
          <Button type="submit" variant="primary" disabled={!batchDetails.supplier || !batchDetails.cartonCount}>
            Scan Cartons
          </Button>
        </div>
      </form>
    </Card>
  );

  const renderStep2_Scanning = () => {
    const total = Number(batchDetails.cartonCount);
    const scanned = scannedCartons.length;
    const isComplete = scanned === total;

    return (
      <div className="animate-slide-up space-y-6">
        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors">
          <ArrowLeft size={16} /> Back to Batch Details
        </button>
        <Card>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-eco-charcoal">Scan Carton QR Codes</h3>
              <p className="text-sm text-gray-500">Scan each carton to add it to the batch.</p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold ${isComplete ? 'text-eco-green' : 'text-eco-orange'}`}>{scanned}</span>
              <span className="text-lg font-bold text-gray-400"> / {total}</span>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Scanned</p>
            </div>
          </div>

          {/* Simulated Scanner */}
          <div className="my-6 aspect-square bg-eco-charcoal rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
            <ScanLine size={100} className="text-white/10 absolute" />
            <div className="absolute top-0 bottom-0 w-1 bg-red-400 animate-[scan_2s_ease-in-out_infinite]"></div>
            <p className="text-white/60 font-mono text-sm">CAMERA VIEW</p>
            <p className="text-white/40 text-xs mt-1">QR Scanner is simulated</p>
          </div>
          
          {/* Manual Entry for Simulation */}
          <form onSubmit={handleAddManualQr}>
            <Input 
              label="Simulate Scan (Enter QR Code)"
              value={manualQrInput}
              onChange={(e) => setManualQrInput(e.target.value)}
              disabled={isComplete}
              placeholder={isComplete ? 'All cartons scanned' : 'e.g., CTN-XYZ-123'}
            />
          </form>

        </Card>

        {scannedCartons.length > 0 && (
          <Card title="Scanned Cartons">
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
              {scannedCartons.map((id, index) => (
                <div key={id} className="flex items-center justify-between bg-eco-cream p-3 rounded-lg text-sm">
                  <span className="font-mono text-eco-charcoal font-medium">{id}</span>
                  <span className="text-gray-400 text-xs">#{index + 1}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Button onClick={handleCreateBatch} isLoading={loading} disabled={!isComplete}>
          Create Batch
        </Button>
      </div>
    );
  };
  
  const renderStep3_Confirmation = () => (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <Card className="text-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center p-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle size={32} />
          </div>
          
          <h3 className="text-2xl font-bold text-eco-charcoal mb-2">Batch Created Successfully!</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">The batch is now registered. Print the main batch label below.</p>

          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-8">
            <img src={lastBatch.qrCodeUrl} alt="QR Code" className="w-40 h-40" />
            <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
              <div className="font-mono text-xl font-bold text-eco-charcoal tracking-wider">{lastBatch.id}</div>
            </div>
          </div>

          <Card title="Batch Summary" className="w-full text-left mb-8 bg-eco-cream border-transparent">
             <div className="space-y-4 text-sm">
               <div className="flex justify-between"><span className="text-gray-500">Supplier:</span> <span className="font-bold">{lastBatch.supplier}</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Created At:</span> <span className="font-bold">{new Date(lastBatch.createdAt).toLocaleString()}</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Operator:</span> <span className="font-bold">{lastBatch.createdBy}</span></div>
               <div className="flex justify-between"><span className="text-gray-500">Total Cartons:</span> <Badge>{lastBatch.cartonCount}</Badge></div>
             </div>
             <details className="mt-4">
                <summary className="cursor-pointer text-sm font-bold text-eco-green flex items-center gap-2">
                  <List size={14} /> View Carton IDs
                </summary>
                <div className="mt-2 p-3 bg-white rounded-lg max-h-32 overflow-y-auto text-xs font-mono space-y-1">
                  {lastBatch.cartonIds.map(id => <p key={id}>{id}</p>)}
                </div>
             </details>
          </Card>


          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button variant="secondary" onClick={() => window.print()}>
              Print Label
            </Button>
            <Button variant="ghost" onClick={resetFlow}>
              Register Another Batch
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch(step) {
      case 1: return renderStep1_Setup();
      case 2: return renderStep2_Scanning();
      case 3: return renderStep3_Confirmation();
      default: return renderStep1_Setup();
    }
  };

  const currentStepInfo = [
    { number: 1, title: 'Batch Setup' },
    { number: 2, title: 'Scan Cartons' },
    { number: 3, title: 'Confirmation' },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
          <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
          <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">
            Step {step} of 3: {currentStepInfo[step-1].title}
          </span>
        </div>
        <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight mb-2">Inbound Receiving</h2>
        <p className="text-gray-500 text-lg">Log new deliveries to generate a unique tracking ID.</p>
      </div>

      {renderContent()}

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};