import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { createSortedPack, getItemsByType, brandsService, materialsService, colorsService, getCurrentUser } from '../services/api';
import { BatchType, InboundBatch, SortedPack } from '../types';
import { ArrowLeft, CheckCircle, QrCode, Package, List, ChevronDown, Check, Tag, ScanLine } from 'lucide-react';

type PackDetails = {
    weightKg: string;
    color: string;
    brand: string;
    material: string;
};

export const SortingView: React.FC = () => {
    const [step, setStep] = useState(1);
    const [scannedPackIds, setScannedPackIds] = useState<string[]>([]);
    const [manualPackId, setManualPackId] = useState('');
    const [selectedBatchId, setSelectedBatchId] = useState('');
    const [packDetails, setPackDetails] = useState<Map<string, PackDetails>>(new Map());
    const [createdPacks, setCreatedPacks] = useState<SortedPack[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Data for forms
    const [inboundBatches, setInboundBatches] = useState<InboundBatch[]>([]);
    const [configOptions, setConfigOptions] = useState({ brands: [] as string[], materials: [] as string[], colors: [] as string[] });

    useEffect(() => {
        // Fetch all necessary data on mount
        const fetchData = async () => {
            try {
                const [batches, brands, materials, colors] = await Promise.all([
                    getItemsByType<InboundBatch>(BatchType.INBOUND),
                    brandsService.get(),
                    materialsService.get(),
                    colorsService.get(),
                ]);
                setInboundBatches(batches);
                setConfigOptions({ brands, materials, colors });
            } catch (error) {
                console.error("Failed to load initial sorting data", error);
                alert("Could not load necessary data. Check configurations.");
            }
        };
        fetchData();
    }, []);

    const resetFlow = () => {
        setStep(1);
        setScannedPackIds([]);
        setManualPackId('');
        setSelectedBatchId('');
        setPackDetails(new Map());
        setCreatedPacks([]);
        setLoading(false);
    };

    const handleAddPackId = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualPackId.trim()) return;
        if (scannedPackIds.includes(manualPackId.trim())) {
            alert("This Pack ID has already been added.");
            return;
        }
        const newId = manualPackId.trim();
        setScannedPackIds(prev => [...prev, newId]);
        // Pre-populate details map
        setPackDetails(prev => new Map(prev).set(newId, {
            weightKg: '',
            color: configOptions.colors[0] || '',
            brand: configOptions.brands[0] || '',
            material: configOptions.materials[0] || '',
        }));
        setManualPackId('');
    };

    const handleUpdatePackDetail = (packId: string, field: keyof PackDetails, value: string) => {
        const newDetails = new Map(packDetails);
        const currentDetails = newDetails.get(packId);
        if (currentDetails) {
            newDetails.set(packId, { ...currentDetails, [field]: value });
        }
        setPackDetails(newDetails);
    };

    const handleCreateAllPacks = async () => {
        setLoading(true);
        const packsToCreate = Array.from(packDetails.entries());
        const results: SortedPack[] = [];

        try {
            for (const [id, details] of packsToCreate) {
                if(!details.weightKg) throw new Error(`Weight is missing for pack ${id}`);
                const created = await createSortedPack({
                    id,
                    parentInboundId: selectedBatchId,
                    weightKg: Number(details.weightKg) / 1000, // Convert grams to kg
                    color: details.color,
                    brand: details.brand,
                    material: details.material,
                });
                results.push(created);
            }
            setCreatedPacks(results);
            setStep(4);
        } catch (error: any) {
            alert(`Error creating packs: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const isStep3Complete = () => {
      if (packDetails.size === 0) return false;
      return Array.from(packDetails.values()).every(d => d.weightKg && Number(d.weightKg) > 0);
    }

    const renderHeader = (stepInfo: string) => (
        <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
                <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">{stepInfo}</span>
            </div>
            <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight">Sorting Station</h2>
        </div>
    );

    const renderStep1_ScanPacks = () => (
        <div>
            {renderHeader("Step 1 of 4: Scan Packs")}
            <Card>
                {/* Simulated Scanner */}
                <div className="mb-6 aspect-square bg-eco-charcoal rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                    <ScanLine size={100} className="text-white/10 absolute" />
                    <div className="absolute top-0 bottom-0 w-1 bg-red-400 animate-[scan_2s_ease-in-out_infinite]"></div>
                    <p className="text-white/60 font-mono text-sm">CAMERA VIEW</p>
                    <p className="text-white/40 text-xs mt-1">QR Scanner is simulated</p>
                </div>
                
                <form onSubmit={handleAddPackId} className="flex gap-2 items-end">
                    <div className="flex-grow">
                        <Input 
                            label="Simulate Scan (Enter Pack ID)" 
                            placeholder="e.g. PACK-XYZ-123" 
                            value={manualPackId} 
                            onChange={e => setManualPackId(e.target.value)} 
                        />
                    </div>
                    <Button type="submit" variant="secondary" className="w-auto h-[56px] px-5 mb-6">Add</Button>
                </form>

                {scannedPackIds.length > 0 && (
                    <div className="mt-4">
                        <h3 className="text-sm font-bold text-gray-500 mb-2">Scanned Packs ({scannedPackIds.length})</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                            {scannedPackIds.map(id => (
                                <div key={id} className="flex items-center justify-between bg-eco-cream p-3 rounded-lg text-sm">
                                    <span className="font-mono text-eco-charcoal font-medium">{id}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card>
            <Button onClick={() => setStep(2)} disabled={scannedPackIds.length === 0} className="mt-6">
                Next: Select Source Batch
            </Button>
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>
        </div>
    );

    const renderStep2_SelectBatch = () => (
        <div>
            {renderHeader("Step 2 of 4: Select Source")}
             <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors mb-4">
                <ArrowLeft size={16} /> Back to Pack Scanning
            </button>
            <Card>
                <Select label="Source Inbound Batch" value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}>
                    <option value="">-- Select a Batch --</option>
                    {inboundBatches.map(b => (
                        <option key={b.id} value={b.id}>{b.id} • {b.supplier} • {b.cartonCount} cartons</option>
                    ))}
                </Select>
            </Card>
            <Button onClick={() => setStep(3)} disabled={!selectedBatchId} className="mt-6">
                Next: Add Pack Details
            </Button>
        </div>
    );
    
    const renderStep3_AddDetails = () => (
      <div>
        {renderHeader("Step 3 of 4: Add Details")}
        <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors mb-4">
            <ArrowLeft size={16} /> Back to Source Selection
        </button>
        <div className="space-y-4">
          {scannedPackIds.map(id => {
            const details = packDetails.get(id);
            const isComplete = details && details.weightKg;
            return (
              <details key={id} className="group" open>
                <summary className="p-4 bg-white rounded-2xl border flex justify-between items-center cursor-pointer list-none hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                        {isComplete ? <Check size={16}/> : <Tag size={16}/>}
                    </div>
                    <span className="font-mono font-bold text-eco-charcoal">{id}</span>
                  </div>
                  <ChevronDown size={20} className="text-gray-400 group-open:rotate-180 transition-transform"/>
                </summary>
                <div className="p-6 bg-white rounded-b-2xl border-x border-b -mt-2">
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="relative">
                       <div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">grams</div>
                       <Input label="Weight" type="number" placeholder="0" largeText value={details?.weightKg} onChange={e => handleUpdatePackDetail(id, 'weightKg', e.target.value)}/>
                     </div>
                     <Select label="Brand" value={details?.brand} onChange={e => handleUpdatePackDetail(id, 'brand', e.target.value)}>
                         {configOptions.brands.map(b => <option key={b} value={b}>{b}</option>)}
                     </Select>
                     <Select label="Material" value={details?.material} onChange={e => handleUpdatePackDetail(id, 'material', e.target.value)}>
                         {configOptions.materials.map(m => <option key={m} value={m}>{m}</option>)}
                     </Select>
                     <Select label="Color" value={details?.color} onChange={e => handleUpdatePackDetail(id, 'color', e.target.value)}>
                         {configOptions.colors.map(c => <option key={c} value={c}>{c}</option>)}
                     </Select>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
        <Button onClick={handleCreateAllPacks} isLoading={loading} disabled={!isStep3Complete()} className="mt-6">
          Done: Create {scannedPackIds.length} Packs
        </Button>
      </div>
    );

    const renderStep4_Summary = () => (
      <div>
        {renderHeader("Step 4 of 4: Summary")}
        <div className="text-center mb-8">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-eco-charcoal">{createdPacks.length} Packs Created Successfully</h3>
        </div>
        <div className="space-y-4">
            {createdPacks.map(pack => (
                <Card key={pack.id} className="p-4">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="font-bold text-lg col-span-2 pb-2 mb-2 border-b">
                          <span className="font-mono text-eco-orange">{pack.id}</span>
                        </div>
                        <div><span className="text-gray-500">Date:</span> <span className="font-medium">{new Date(pack.createdAt).toLocaleDateString()}</span></div>
                        <div><span className="text-gray-500">Time:</span> <span className="font-medium">{new Date(pack.createdAt).toLocaleTimeString()}</span></div>
                        <div><span className="text-gray-500">Brand:</span> <span className="font-medium">{pack.brand}</span></div>
                        <div><span className="text-gray-500">Material:</span> <span className="font-medium">{pack.material}</span></div>
                        <div><span className="text-gray-500">Color:</span> <span className="font-medium">{pack.color}</span></div>
                        <div><span className="text-gray-500">Weight:</span> <span className="font-medium">{pack.weightKg * 1000} g</span></div>
                        <div className="col-span-2"><span className="text-gray-500">Source Batch:</span> <span className="font-mono font-medium">{pack.parentInboundId}</span></div>
                    </div>
                </Card>
            ))}
        </div>
        <Button onClick={resetFlow} className="mt-6">
          Start New Sorting Session
        </Button>
      </div>
    );

    switch (step) {
        case 1: return renderStep1_ScanPacks();
        case 2: return renderStep2_SelectBatch();
        case 3: return renderStep3_AddDetails();
        case 4: return renderStep4_Summary();
        default: return renderStep1_ScanPacks();
    }
};