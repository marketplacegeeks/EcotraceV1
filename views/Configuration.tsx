import React, { useEffect, useState, useCallback } from 'react';
import { Card, Button, Input, Badge } from '../components/UI';
import { suppliersService, brandsService, materialsService, colorsService, vendorsService, countriesService } from '../services/api';
import { Trash2, PlusCircle, Tag, Palette, Puzzle, Building, X, ChevronRight, Building2, Globe } from 'lucide-react';


const AddItemModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => Promise<void>;
    noun: string;
}> = ({ isOpen, onClose, onSave, noun }) => {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName('');
            setLoading(false);
        }
    }, [isOpen]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            await onSave(name.trim());
            onClose();
        } catch (err) {
            // Error is handled by parent, but we should stop loading here
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
            <Card className="w-full max-w-md animate-slide-up" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSave}>
                    <h3 className="text-xl font-bold text-eco-charcoal tracking-tight mb-2">Add New {noun}</h3>
                    <p className="text-gray-500 mb-6">Enter the name for the new {noun}.</p>
                    <Input
                        label={`Name`}
                        value={name}
                        onChange={e => setName(e.target.value)}
                        autoFocus
                        required
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" isLoading={loading}>Save {noun}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const TABS = [
    { id: 'suppliers', label: 'Suppliers', icon: Building, noun: 'Supplier' },
    { id: 'vendors', label: 'Vendors', icon: Building2, noun: 'Vendor' },
    { id: 'countries', label: 'Countries', icon: Globe, noun: 'Country' },
    { id: 'brands', label: 'Brands', icon: Tag, noun: 'Brand' },
    { id: 'materials', label: 'Materials', icon: Puzzle, noun: 'Material' },
    { id: 'colors', label: 'Colors', icon: Palette, noun: 'Color' }
];

export const ConfigurationView: React.FC = () => {
    const [configData, setConfigData] = useState({
        suppliers: [] as string[],
        brands: [] as string[],
        materials: [] as string[],
        colors: [] as string[],
        vendors: [] as string[],
        countries: [] as string[],
    });
    const [activeTab, setActiveTab] = useState<keyof typeof configData>('suppliers');
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAllConfigs = useCallback(async () => {
        setError('');
        try {
            const [suppliers, brands, materials, colors, vendors, countries] = await Promise.all([
                suppliersService.get(),
                brandsService.get(),
                materialsService.get(),
                colorsService.get(),
                vendorsService.get(),
                countriesService.get(),
            ]);
            setConfigData({ suppliers, brands, materials, colors, vendors, countries });
        } catch (err) {
            setError('Failed to load configuration data.');
        }
    }, []);

    useEffect(() => {
        fetchAllConfigs();
    }, [fetchAllConfigs]);

    const handleAddItem = async (name: string) => {
        setError('');
        try {
            const service = {
                suppliers: suppliersService,
                brands: brandsService,
                materials: materialsService,
                colors: colorsService,
                vendors: vendorsService,
                countries: countriesService,
            }[activeTab];
            await service.add(name);
            await fetchAllConfigs();
        } catch (err: any) {
            setError(err.message || `Could not add item.`);
            throw err;
        }
    };

    const handleDeleteItem = async (name: string) => {
        if (window.confirm(`Are you sure you want to delete "${name}"? This could affect existing records.`)) {
            setError('');
            try {
                const service = {
                    suppliers: suppliersService,
                    brands: brandsService,
                    materials: materialsService,
                    colors: colorsService,
                    vendors: vendorsService,
                    countries: countriesService,
                }[activeTab];
                await service.remove(name);
                await fetchAllConfigs();
            } catch (err: any) {
                setError(err.message || `Could not delete item.`);
            }
        }
    };
    
    const activeTabData = TABS.find(t => t.id === activeTab)!;
    const activeItems = configData[activeTab];

    return (
        <div className="space-y-8 pb-10">
            <div>
              <h2 className="text-3xl font-bold text-eco-charcoal tracking-tight">System Configurations</h2>
              <p className="text-gray-500 mt-1">Manage dropdown values used across the application.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in" role="alert">
                    {error}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                {/* Left Sidebar Navigation */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-2 space-y-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as keyof typeof configData)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors text-left ${
                                    activeTab === tab.id ? 'bg-eco-green/5 text-eco-green' : 'text-eco-charcoal/70 hover:bg-gray-50'
                                }`}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="md:col-span-3">
                    <Card>
                        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
                           <div>
                             <h3 className="text-xl font-bold text-eco-charcoal tracking-tight">Manage {activeTabData.label}</h3>
                             <p className="text-sm text-gray-500 mt-1">Total: {activeItems.length} items</p>
                           </div>
                           <Button onClick={() => setIsModalOpen(true)} className="!w-auto">
                               <PlusCircle size={16} className="mr-2"/>
                               Add New {activeTabData.noun}
                           </Button>
                        </div>
                        
                        <div className="space-y-2">
                           {activeItems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="text-left">
                                        <tr className="border-b border-gray-100 text-gray-500">
                                            <th className="p-3 font-semibold">Name</th>
                                            <th className="p-3 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeItems.map(item => (
                                            <tr key={item} className="hover:bg-gray-50 transition-colors group">
                                                <td className="p-3 font-medium text-eco-charcoal">{item}</td>
                                                <td className="p-3 text-right">
                                                    <button
                                                        onClick={() => handleDeleteItem(item)}
                                                        className="p-2 text-gray-400 rounded-md hover:bg-red-100 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        title={`Delete ${activeTabData.noun}`}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                           ) : (
                             <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                                 <h4 className="text-lg font-bold text-gray-500">No {activeTabData.label} Found</h4>
                                 <p className="text-sm text-gray-400 mt-1">Click "Add New" to get started.</p>
                             </div>
                           )}
                        </div>
                    </Card>
                </div>
            </div>
            
            <AddItemModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddItem}
                noun={activeTabData.noun}
            />

        </div>
    );
};