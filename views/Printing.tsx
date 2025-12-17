import React, { useState } from 'react';
import { Card, Button, Input, SelectionGrid } from '../components/UI';
import { generateQrLabels } from '../services/api';
import { Printer, QrCode } from 'lucide-react';

type LabelType = 'BOX' | 'SP' | 'FP';
const LABEL_TYPES: { id: LabelType, label: string }[] = [
    { id: 'BOX', label: 'Box Label' },
    { id: 'SP', label: 'Sorting Pack Label' },
    { id: 'FP', label: 'Fiber Pack Label' },
];

interface GeneratedLabel {
    id: string;
    qrCodeUrl: string;
}

export const PrintingView: React.FC = () => {
    const [labelType, setLabelType] = useState<LabelType>('BOX');
    const [quantity, setQuantity] = useState('10');
    const [generatedLabels, setGeneratedLabels] = useState<GeneratedLabel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        const numQuantity = parseInt(quantity, 10);
        if (isNaN(numQuantity) || numQuantity <= 0) {
            setError('Please enter a valid positive number for the quantity.');
            return;
        }
        setLoading(true);
        setError('');
        setGeneratedLabels([]);
        try {
            const labels = await generateQrLabels(labelType, numQuantity);
            setGeneratedLabels(labels);
        } catch (err: any) {
            setError(err.message || 'Failed to generate labels.');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 pb-10">
            <div id="print-header">
                <h2 className="text-3xl font-bold text-eco-charcoal tracking-tight">QR Code Printing</h2>
                <p className="text-gray-500 mt-1">Generate and print unique labels for operational use.</p>
            </div>
            
            {error && (
                <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-medium animate-fade-in" role="alert">
                    {error}
                </div>
            )}

            <Card id="print-form">
                <form onSubmit={handleGenerate}>
                    <SelectionGrid 
                        label="Select Label Type"
                        options={LABEL_TYPES}
                        value={labelType}
                        onChange={(val) => setLabelType(val as LabelType)}
                    />
                    <Input 
                        label="Number of Labels"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={e => setQuantity(e.target.value)}
                        largeText
                        required
                    />
                    <Button type="submit" isLoading={loading}>Generate Labels</Button>
                </form>
            </Card>

            {generatedLabels.length > 0 && (
                <div id="print-area" className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6" id="print-controls">
                        <h3 className="text-xl font-bold text-eco-charcoal tracking-tight">Generated Labels ({generatedLabels.length})</h3>
                        <Button onClick={handlePrint} className="!w-auto">
                            <Printer size={16} className="mr-2" />
                            Print Labels
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {generatedLabels.map(label => (
                            <div key={label.id} className="bg-white border border-gray-200 rounded-lg p-3 flex flex-col items-center text-center space-y-2 break-all">
                                <img src={label.qrCodeUrl} alt={`QR code for ${label.id}`} className="w-full h-auto aspect-square" />
                                <p className="font-mono font-bold text-sm text-eco-charcoal tracking-tighter">{label.id}</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                    {LABEL_TYPES.find(t => t.id === labelType)?.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    #print-controls {
                        display: none;
                    }
                    .grid {
                        display: grid !important;
                    }
                }
            `}</style>
        </div>
    );
};
