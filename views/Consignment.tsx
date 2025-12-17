import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Input, Select, Badge } from '../components/UI';
import { createConsignment, vendorsService, countriesService, getItemsByType } from '../services/api';
import { Consignment, FibrePack, BatchType } from '../types';
import { Ship, ScanLine, ArrowLeft, CheckCircle, PackagePlus, Trash2 } from 'lucide-react';

export const ConsignmentView: React.FC = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Data Sources
    const [vendors, setVendors] = useState<string[]>([]);
    const [countries, setCountries] = useState<string[]>([]);
    const [allFibrePacks, setAllFibrePacks] = useState<FibrePack[]>([]);

    // Step 1 State
    const [details, setDetails] = useState({
        vendor: '',
        country: '',
        totalWeightKg: '',
        consignmentNumber: ''
    });

    // Step 2 State
    const [linkedPacks, setLinkedPacks] = useState<string[]>([]);
    const [packInput, setPackInput] = useState('');

    // Step 3 State
    const [createdConsignment, setCreatedConsignment] = useState<Consignment | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vendorData, countryData, fibrePacks] = await Promise.all([
                    vendorsService.get(),
                    countriesService.get(),
                    getItemsByType<FibrePack>(BatchType.FIBRE)
                ]);
                setVendors(vendorData);
                setCountries(countryData);
                setAllFibrePacks(fibrePacks);
                // Pre-fill dropdowns if possible
                setDetails(d => ({
                    ...d,
                    vendor: vendorData[0] || '',
                    country: countryData[0] || ''
                }));
            } catch (err) {
                setError("Failed to load necessary configuration data.");
            }
        };
        fetchData();
    }, []);

    const isStep1Valid = useMemo(() => {
        return details.vendor && details.country && details.totalWeightKg && details.consignmentNumber;
    }, [details]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isStep1Valid) {
            setError('');
            setStep(2);
        } else {
            setError('All fields are mandatory.');
        }
    };

    const handleAddPack = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const id = packInput.trim();
        if (!id) return;
        if (!allFibrePacks.some(p => p.id === id)) {
            setError(`Fiber Pack ID "${id}" is not valid or does not exist.`);
            return;
        }
        if (linkedPacks.includes(id)) {
            setError(`Fiber Pack ID "${id}" has already been linked.`);
            return;
        }
        setLinkedPacks(prev => [...prev, id]);
        setPackInput('');
    };
    
    const handleRemovePack = (idToRemove: string) => {
      setLinkedPacks(prev => prev.filter(id => id !== idToRemove));
    };

    const handleCreateConsignment = async () => {
        if (linkedPacks.length === 0) {
            setError('You must link at least one Fiber Pack.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const newConsignment = await createConsignment({
                ...details,
                totalWeightKg: Number(details.totalWeightKg),
                linkedFibrePackIds: linkedPacks,
            });
            setCreatedConsignment(newConsignment);
            setStep(3);
        } catch (err: any) {
            setError(err.message || 'Failed to create consignment.');
        } finally {
            setLoading(false);
        }
    };
    
    const resetFlow = () => {
      setStep(1);
      setLoading(false);
      setError('');
      setDetails({
        vendor: vendors[0] || '',
        country: countries[0] || '',
        totalWeightKg: '',
        consignmentNumber: ''
      });
      setLinkedPacks([]);
      setPackInput('');
      setCreatedConsignment(null);
    };

    const renderStep1 = () => (
        <Card className="animate-slide-up">
            <form onSubmit={handleDetailsSubmit}>
                <Select label="Vendor" value={details.vendor} onChange={e => setDetails({...details, vendor: e.target.value})} required>
                    <option value="">-- Select Vendor --</option>
                    {vendors.map(v => <option key={v} value={v}>{v}</option>)}
                </Select>
                <Select label="Country" value={details.country} onChange={e => setDetails({...details, country: e.target.value})} required>
                    <option value="">-- Select Country --</option>
                    {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
                <div className="relative">
                    <div className="absolute right-4 top-[38px] text-gray-400 pointer-events-none font-bold">kg</div>
                    <Input label="Total Weight" type="number" placeholder="0" largeText value={details.totalWeightKg} onChange={e => setDetails({...details, totalWeightKg: e.target.value})} required />
                </div>
                <Input label="Consignment Number" placeholder="e.g. 123456789" value={details.consignmentNumber} onChange={e => setDetails({...details, consignmentNumber: e.target.value})} required />
                <Button type="submit" disabled={!isStep1Valid}>Next: Link Fiber Packs</Button>
            </form>
        </Card>
    );

    const renderStep2 = () => (
        <div className="animate-slide-up space-y-6">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-eco-charcoal transition-colors">
                <ArrowLeft size={16} /> Back to Details
            </button>
            <Card>
                <h3 className="text-lg font-bold text-eco-charcoal mb-4">Link Fiber Packs</h3>
                <div className="mb-6 aspect-square bg-eco-charcoal rounded-3xl flex flex-col items-center justify-center relative overflow-hidden">
                    <ScanLine size={100} className="text-white/10" />
                    <p className="text-white/60 font-mono text-sm">SCAN FIBER PACKS</p>
                </div>
                <form onSubmit={handleAddPack}>
                    <Input label="Scan or Enter Fiber Pack ID" placeholder="e.g. FP-SEED-01" value={packInput} onChange={e => setPackInput(e.target.value)} autoFocus />
                    <Button type="submit" variant="secondary">Add Pack</Button>
                </form>
            </Card>
            {linkedPacks.length > 0 && (
                <Card title={`Linked Packs (${linkedPacks.length})`}>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {linkedPacks.map(id => (
                            <div key={id} className="flex items-center justify-between bg-eco-cream p-3 rounded-lg text-sm group">
                                <span className="font-mono text-eco-charcoal font-medium">{id}</span>
                                <button onClick={() => handleRemovePack(id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
            <Button onClick={handleCreateConsignment} isLoading={loading} disabled={linkedPacks.length === 0}>
                Done
            </Button>
        </div>
    );

    const renderStep3 = () => (
      createdConsignment && <div className="animate-in fade-in zoom-in-95 duration-500">
        <Card className="text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto">
            <CheckCircle size={32} />
          </div>
          <h3 className="text-2xl font-bold text-eco-charcoal mb-2">Consignment Created!</h3>
          <p className="text-gray-500 mb-8">Summary of consignment <span className="font-bold text-eco-charcoal">{createdConsignment.consignmentNumber}</span>.</p>
          <Card className="w-full text-left mb-8 bg-eco-cream border-transparent p-6">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Vendor:</span> <span className="font-bold">{createdConsignment.vendor}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Country:</span> <span className="font-bold">{createdConsignment.country}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total Weight:</span> <Badge>{createdConsignment.totalWeightKg} kg</Badge></div>
              <div className="flex justify-between"><span className="text-gray-500">Consignment #:</span> <span className="font-mono font-bold">{createdConsignment.consignmentNumber}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Linked Packs:</span> <Badge>{createdConsignment.linkedFibrePackIds.length}</Badge></div>
            </div>
          </Card>
          <Button onClick={resetFlow}>Create Another Consignment</Button>
        </Card>
      </div>
    );

    const renderContent = () => {
        switch (step) {
            case 1: return renderStep1();
            case 2: return renderStep2();
            case 3: return renderStep3();
            default: return renderStep1();
        }
    };
    
    const stepInfo = [
        { title: 'Consignment Details' },
        { title: 'Link Fiber Packs' },
        { title: 'Confirmation' },
    ];

    return (
        <div className="max-w-2xl mx-auto pb-10">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-eco-charcoal/5 rounded-full mb-3">
                    <span className="w-2 h-2 rounded-full bg-eco-orange animate-pulse"></span>
                    <span className="text-xs font-bold text-eco-charcoal uppercase tracking-wider">
                        Step {step} of 3: {stepInfo[step - 1].title}
                    </span>
                </div>
                <h2 className="text-4xl font-bold text-eco-charcoal tracking-tight mb-2">New Consignment</h2>
                <p className="text-gray-500 text-lg">Group finished fiber packs for shipment to a vendor.</p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium mb-6 animate-fade-in" role="alert">
                  {error}
              </div>
            )}
            
            {renderContent()}
        </div>
    );
};