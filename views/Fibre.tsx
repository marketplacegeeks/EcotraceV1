import React, { useEffect, useState } from 'react';
import { Card, Button, Input, Select, Badge, MultiSelectionGrid } from '../components/UI';
import { createFibrePack, getItemsByType } from '../services/api';
import { BatchType, SortedPack, FibrePack } from '../types';
import { ArrowLeft, CheckCircle, ScanLine, Tag, Layers, Check } from 'lucide-react';

type FibrePackDetails = {
    id: string;
    weightGrams: string;
};

interface SummaryData extends FibrePack {
    sortingSession: string;
    fromBatches: string;
}

const initialDetailsState = {
    weightGrams: '',
};

export const FibreView: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
    // Data sources
    const [availableSortedPacks, setAvailableSortedPacks] = useState<SortedPack[]>([]);

    // Step 1: Scan Sorted Packs
    const [scannedSortedIds, setScannedSortedIds] = useState<string[]>([]);
    const [sortedPackInput, setSortedPackInput] = useState('');

    // Step 2: Scan & Detail Fibre Packs
    const [detailedFibrePacks, setDetailedFibrePacks] = useState<FibrePackDetails[]>([]);
    const [fibrePackInput, setFibrePackInput] = useState('');
    const [currentFibrePackId, setCurrentFibrePackId] = useState<string | null>(null);
    const [currentDetails, setCurrentDetails] = useState(initialDetailsState);

    // Step 3: Summary
    const [summaryData, setSummaryData] = useState<SummaryData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sortedPacks = await getItemsByType<SortedPack>(BatchType.SORTED);
                setAvailableSortedPacks(sortedPacks);
            } catch (error) {
                alert("Failed to load necessary data.");
            }
        };
        fetchData();
    }, []);

    const resetFlow = () => {
        setStep(1);
        setLoading(false);
        setScannedSortedIds([]);
        setSortedPackInput('');
        setDetailedFibrePacks([]);
        setFibrePackInput('');
        setCurrentFibrePackId(null);
        setCurrentDetails(initialDetailsState);
        setSummaryData([]);
    };

    const handleScanSortedPack = (e: React.FormEvent) => {
        e.preventDefault();
        const id = sortedPackInput.trim();
        if (!id) return;
        if (!availableSortedPacks.some(p => p.id === id)) {
            alert(`Sorted Pack ID "${id}" not found.`);
            return;
        }
        if (scannedSortedIds.includes(id)) {
            alert(`Pack ${id} has already been scanned.`);
            return;
        }
        setScannedSortedIds(prev => [...prev, id]);
        setSortedPackInput('');
    };

    const handleScanFibrePack = (e: React.FormEvent) => {
        e.preventDefault();
        const id = fibrePackInput.trim();
        if (!id) return;
        if (detailedFibrePacks.some(p => p.id === id)) {
            alert(`Fibre pack ${id} already processed in this session.`);
            return;
        }
        setCurrentFibrePackId(id);
        setFibrePackInput('');
    };

    const handleSaveFibrePack = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentFibrePackId || !currentDetails.weightGrams || Number(currentDetails.weightGrams) <= 0) {
            alert("Please enter a valid weight.");
            return;
        }
        setDetailedFibrePacks(prev => [...prev, { id: currentFibrePackId, ...currentDetails }]);
        setCurrentFibrePackId(null);
        setCurrentDetails(initialDetailsState);
    };

    const handleProceedToSummary = () => {
        const parentSortedPacks = availableSortedPacks.filter(p => scannedSortedIds.includes(p.id));
        
        // Derive inherited attributes
        const parentBrands = [...new Set(parentSortedPacks.map(p => p.brand))];
        const parentMaterials = [...new Set(parentSortedPacks.map(p => p.material))];
        const parentColors = [...new Set(parentSortedPacks.map(p => p.color))];
        
        const derivedMaterial = parentMaterials.length === 1 ? parentMaterials[0] : 'Blend';
        const derivedColor = parentColors.length === 1 ? parentColors[0] : 'Mixed';

        const parentInboundIds = [...new Set(parentSortedPacks.map(p => p.parentInboundId))];
        const sortingSessionId = parentInboundIds[0] || 'N/A';

        const finalPacks: SummaryData[] = detailedFibrePacks.map(fp => ({
            id: fp.id,
            type: BatchType.FIBRE,
            createdAt: new Date().toISOString(),
            createdBy: 'pending', // Will be set on save
            qrCodeUrl: 'pending', // Will be set on save
            parentSortedIds: scannedSortedIds,
            weightKg: Number(fp.weightGrams) / 1000,
            brands: parentBrands,
            material: derivedMaterial,
            color: derivedColor,
            sortingSession: sortingSessionId,
            fromBatches: parentInboundIds.join(', '),
        }));
        setSummaryData(finalPacks);
        setStep(3);
    };

    const handleConfirmAndSave = async () => {
        setLoading(true);
        try {
            for (const pack of summaryData) {
                await createFibrePack({
                    id: pack.id,
                    parentSortedIds: pack.parentSortedIds,
                    weightKg: pack.weightKg,
                    brands: pack.brands,
                    material: pack.material,
                    color: pack.color,
                });
            }
            setStep(4);
        } catch (error: any) {
            alert(`Error creating packs: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const renderHeader = (stepInfo: string) => (
        <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
                <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
                <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">{stepInfo}</span>
            </div>
            <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight">Fibre Production</h2>
        </div>
    );

    const renderStep1 = () => (
        <div>
            {renderHeader("Step 1 of 3: Scan Sorted Packs")}
            <Card>
                <div className="mb-6 aspect-square bg-eco-charcoal rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                    <ScanLine size={100} className="text-white/10" />
                    <p className="text-white/60 font-mono text-sm">SCAN SOURCE PACKS</p>
                </div>
                <form onSubmit={handleScanSortedPack}>
                    <Input label="Scan or Enter Sorted Pack ID" placeholder="e.g. PACK-XYZ-123" value={sortedPackInput} onChange={e => setSortedPackInput(e.target.value)} autoFocus />
                    <Button type="submit" variant="secondary">Scan</Button>
                </form>
            </Card>
            {scannedSortedIds.length > 0 && (
                <Card title={`Scanned Source Packs (${scannedSortedIds.length})`} className="mt-6">
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {scannedSortedIds.map(id => (
                            <div key={id} className="flex items-center gap-2 bg-eco-cream p-3 rounded-lg text-sm">
                                <Layers size={14} className="text-gray-500" />
                                <span className="font-mono text-eco-charcoal font-medium">{id}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <Button onClick={() => setStep(2)} disabled={scannedSortedIds.length === 0} className="mt-6">Next</Button>
        </div>
    );
    
    const renderStep2 = () => (
        <div>
            {renderHeader("Step 2 of 3: Create Fibre Packs")}
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors mb-4">
                <ArrowLeft size={16} /> Back to Source Pack Scanning
            </button>
            {currentFibrePackId ? (
                <Card className="animate-fade-in">
                    <h3 className="text-lg font-bold text-eco-charcoal mb-2">Enter Details for:</h3>
                    <p className="font-mono text-xl text-eco-orange bg-eco-orange/10 p-4 rounded-xl inline-block mb-6">{currentFibrePackId}</p>
                    <form onSubmit={handleSaveFibrePack}>
                        <div className="relative"><div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">grams</div>
                          <Input label="Weight" type="number" placeholder="0" largeText value={currentDetails.weightGrams} onChange={e => setCurrentDetails({ weightGrams: e.target.value })} autoFocus />
                        </div>
                        <Button type="submit">Save Pack</Button>
                    </form>
                </Card>
            ) : (
                <Card>
                    <div className="mb-6 aspect-square bg-eco-charcoal rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                        <ScanLine size={100} className="text-white/10" />
                        <p className="text-white/60 font-mono text-sm">SCAN NEW FIBRE PACK</p>
                    </div>
                    <form onSubmit={handleScanFibrePack}>
                        <Input label="Scan or Enter New Fibre Pack ID" placeholder="e.g. FIBRE-XYZ-123" value={fibrePackInput} onChange={e => setFibrePackInput(e.target.value)} autoFocus/>
                        <Button type="submit" variant="secondary">Scan Next Fibre Pack</Button>
                    </form>
                </Card>
            )}
             {detailedFibrePacks.length > 0 && (
                 <Card title={`Created in Session (${detailedFibrePacks.length})`} className="mt-6">
                     <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                         {detailedFibrePacks.map(pack => (
                            <div key={pack.id} className="flex items-center justify-between bg-eco-cream p-3 rounded-lg text-sm">
                                <div className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-green-500" />
                                  <span className="font-mono text-eco-charcoal font-medium">{pack.id}</span>
                                </div>
                                <Badge>{pack.weightGrams} g</Badge>
                            </div>
                        ))}
                     </div>
                 </Card>
            )}
            <Button onClick={handleProceedToSummary} disabled={detailedFibrePacks.length === 0} className="mt-6">Done</Button>
        </div>
    );

    const renderStep3 = () => (
        <div>
            {renderHeader("Step 3 of 3: Summary & Confirmation")}
            <button onClick={() => setStep(2)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors mb-4">
                <ArrowLeft size={16} /> Back to Details
            </button>
            <h3 className="text-2xl font-bold text-eco-charcoal mb-6 text-center">Fibre Packs Linked!</h3>
            <div className="space-y-6">
                {summaryData.map(pack => (
                    <Card key={pack.id} className="p-6">
                        <h4 className="font-mono font-bold text-xl text-eco-orange mb-6">{pack.id}</h4>
                        
                        {/* Main Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mb-6">
                            <div className="flex justify-between items-center"><span className="text-gray-500">Date:</span> <span className="font-medium text-right">{new Date(pack.createdAt).toLocaleDateString()}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500">Time:</span> <span className="font-medium text-right">{new Date(pack.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500">Weight:</span> <Badge color="bg-eco-green/10 text-eco-green">{pack.weightKg} kg</Badge></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500">Brand(s):</span> <span className="font-medium text-right truncate">{pack.brands.join(', ')}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500">Material:</span> <span className="font-medium text-right">{pack.material}</span></div>
                            <div className="flex justify-between items-center"><span className="text-gray-500">Color:</span> <span className="font-medium text-right">{pack.color}</span></div>
                        </div>

                        {/* Traceability Info Block */}
                        <div className="bg-eco-cream p-4 rounded-xl space-y-2">
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold">Sorting Session:</span>
                                <span className="font-mono text-eco-charcoal text-right truncate">{pack.sortingSession}</span>
                             </div>
                             <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold">From Sorted Packs:</span>
                                <span className="font-mono text-eco-charcoal text-right truncate">{pack.parentSortedIds.join(', ')}</span>
                             </div>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500 font-bold">From Batches:</span>
                                <span className="font-mono text-eco-charcoal text-right truncate">{pack.fromBatches}</span>
                             </div>
                        </div>
                    </Card>
                ))}
            </div>
            <Button onClick={handleConfirmAndSave} isLoading={loading} className="mt-8">Confirm & Save</Button>
        </div>
    );
    
    const renderStep4 = () => (
        <div className="animate-in fade-in zoom-in-95 duration-500">
             <Card className="text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold text-eco-charcoal mb-2">Session Complete!</h3>
                <p className="text-gray-500 mb-8">{summaryData.length} Fibre Pack(s) successfully created.</p>
                <Button onClick={resetFlow}>Start New Session</Button>
             </Card>
        </div>
    );

    switch (step) {
        case 1: return renderStep1();
        case 2: return renderStep2();
        case 3: return renderStep3();
        case 4: return renderStep4();
        default: return renderStep1();
    }
};