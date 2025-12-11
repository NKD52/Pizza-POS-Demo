
import React, { useState } from 'react';
import { OrderSummaryState, OrderItem } from '../types';
import { Trash2, Pencil, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  summary: OrderSummaryState;
  onUpdate: (summary: OrderSummaryState) => void;
  onRemoveItem: (id: string) => void;
  onEditItem: (item: OrderItem) => void;
}

const OrderSummary: React.FC<Props> = ({ summary, onUpdate, onRemoveItem, onEditItem }) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const calculateValues = () => {
    let subtotal = summary.items.reduce((acc, item) => acc + item.price, 0);
    
    // Tax (Assuming 8% for demo)
    const taxRate = 0.08;
    const tax = summary.taxExempt ? 0 : subtotal * taxRate;
    
    // Base amount before discount
    const baseTotal = subtotal + tax + summary.tip;

    const isOverridden = summary.totalOverride !== undefined && summary.totalOverride !== '';
    let finalTotal = 0;
    let finalDiscount = 0;

    if (isOverridden) {
        finalTotal = parseFloat(summary.totalOverride!);
        if (isNaN(finalTotal)) finalTotal = 0; // fallback
        
        // Discount is the difference needed to reach the override
        // Base - Discount = Final  =>  Discount = Base - Final
        finalDiscount = baseTotal - finalTotal;
    } else {
        // Normal calculation
        if (summary.discountType === '$') {
            finalDiscount = summary.discountValue;
        } else {
            finalDiscount = subtotal * (summary.discountValue / 100);
        }
        finalTotal = baseTotal - finalDiscount;
    }

    return { subtotal, tax, finalDiscount, finalTotal, isOverridden };
  };

  const { subtotal, tax, finalDiscount, finalTotal, isOverridden } = calculateValues();

  const handleDiscountChange = (val: string) => {
    const num = parseFloat(val);
    onUpdate({ ...summary, discountValue: isNaN(num) ? 0 : num });
  };

  const handleTipChange = (val: string) => {
    const num = parseFloat(val);
    onUpdate({ ...summary, tip: isNaN(num) ? 0 : num });
  };

  const handleTotalOverrideChange = (val: string) => {
    onUpdate({ ...summary, totalOverride: val === '' ? undefined : val });
  };

  // Group items by time
  const groupedItems = summary.items.reduce((groups, item) => {
    const time = item.deliveryTime || 'Unscheduled';
    if (!groups[time]) {
        groups[time] = [];
    }
    groups[time].push(item);
    return groups;
  }, {} as Record<string, OrderItem[]>);

  // Sort times (naive string sort)
  const sortedTimes = Object.keys(groupedItems).sort((a, b) => a.localeCompare(b));

  const toggleGroup = (time: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [time]: !prev[time]
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col sticky top-6 h-fit">
      <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Order Summary ({summary.items.length})</h2>

      <div className="mb-6">
        {summary.items.length === 0 ? (
            <div className="text-center text-gray-400 py-10 italic">
                No items added yet.
            </div>
        ) : (
            <div className="space-y-4">
                {sortedTimes.map((time) => {
                    const items = groupedItems[time];
                    const isExpanded = !!expandedGroups[time];
                    const groupTotal = items.reduce((acc, item) => acc + item.price, 0);

                    return (
                        <div key={time} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden transition-all">
                            <button 
                                onClick={() => toggleGroup(time)}
                                className={`w-full bg-gray-100 px-4 py-3 flex items-center justify-between hover:bg-gray-200 transition-colors ${isExpanded ? 'border-b border-gray-200' : ''}`}
                            >
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm font-bold text-gray-700">{time}</span>
                                    {!isExpanded && <span className="text-xs text-gray-500 font-medium ml-1">({items.length})</span>}
                                </div>
                                <div className="flex items-center gap-3">
                                    {!isExpanded && <span className="text-sm font-bold text-gray-900">${groupTotal.toFixed(2)}</span>}
                                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                                </div>
                            </button>
                            
                            {isExpanded && (
                                <div className="divide-y divide-gray-100 animate-in slide-in-from-top-1 duration-200">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start p-4 bg-white hover:bg-gray-50 transition-colors">
                                            <div className="flex-1 pr-4">
                                                <h3 className="text-sm font-bold text-gray-900">{item.name}</h3>
                                                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                {item.specialInstructions && (
                                                    <p className="text-xs text-red-600 mt-1 italic">Note: {item.specialInstructions}</p>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="text-sm font-bold text-gray-900">${item.price.toFixed(2)}</span>
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => onEditItem(item)}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {/* Group Total in footer when expanded */}
                                    <div className="px-4 py-3 bg-gray-50 flex justify-end items-center gap-2 border-t border-gray-100">
                                        <span className="text-xs font-medium text-gray-500">Group Total:</span>
                                        <span className="text-sm font-bold text-gray-900">${groupTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
            <div className="flex items-center gap-2">
                <label htmlFor="taxExempt" className="cursor-pointer select-none">Tax {summary.taxExempt ? '(Exempt)' : ''}</label>
                <input 
                    id="taxExempt"
                    type="checkbox" 
                    checked={summary.taxExempt}
                    onChange={(e) => onUpdate({...summary, taxExempt: e.target.checked})}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
            </div>
          <span>${tax.toFixed(2)}</span>
        </div>

        {summary.tip > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
                <span>Tip</span>
                <span>+${summary.tip.toFixed(2)}</span>
            </div>
        )}

        {finalDiscount !== 0 && (
            <div className="flex justify-between text-sm text-green-600 font-medium">
                <span>
                    {isOverridden ? 'Discount (Override Adjustment)' : `Discount ${summary.discountType === '%' ? `(${summary.discountValue}%)` : ''}`}
                </span>
                <span>
                    {finalDiscount > 0 ? '-' : '+'}${Math.abs(finalDiscount).toFixed(2)}
                </span>
            </div>
        )}

        {/* Control Panel */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-200 mt-2">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Discount</label>
                {!isOverridden ? (
                    <div className="flex rounded-md shadow-sm">
                        <input 
                            type="number"
                            min="0"
                            value={summary.discountValue === 0 ? '' : summary.discountValue}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            className="flex-1 w-full min-w-0 px-3 py-1.5 text-sm border border-gray-300 rounded-none rounded-l-md focus:ring-1 focus:ring-red-500 focus:border-red-500"
                        />
                        <button
                            type="button"
                            onClick={() => onUpdate({...summary, discountType: '$'})}
                            className={`px-2 py-1.5 text-xs font-medium border-y border-r border-gray-300 ${summary.discountType === '$' ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-600'}`}
                        >
                            $
                        </button>
                        <button
                            type="button"
                            onClick={() => onUpdate({...summary, discountType: '%'})}
                            className={`px-2 py-1.5 text-xs font-medium border-y border-r border-gray-300 rounded-r-md ${summary.discountType === '%' ? 'bg-red-100 text-red-700' : 'bg-gray-50 text-gray-600'}`}
                        >
                            %
                        </button>
                    </div>
                ) : (
                     <div className="px-3 py-1.5 bg-gray-100 text-gray-400 text-sm border border-gray-200 rounded-md italic">
                        Auto-calculated
                    </div>
                )}
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Tip</label>
                <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                        type="number"
                        min="0"
                        value={summary.tip === 0 ? '' : summary.tip}
                        onChange={(e) => handleTipChange(e.target.value)}
                        className="block w-full rounded-md border-0 py-1.5 pl-7 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
                        placeholder="0.00"
                    />
                </div>
            </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <span className="text-xl font-black text-gray-900">Total</span>
          <div className="flex items-center">
            <span className="text-xl font-black text-gray-900 mr-1">$</span>
            <input
                type="number"
                step="0.01"
                className={`w-32 text-right text-xl font-black border-b bg-transparent placeholder-gray-300 transition-colors focus:outline-none ${isOverridden ? 'text-red-600 border-red-200 focus:border-red-600' : 'text-gray-900 border-gray-200 hover:border-gray-300 focus:border-red-600'}`}
                placeholder={isOverridden ? undefined : finalTotal.toFixed(2)}
                value={summary.totalOverride ?? ''}
                onChange={(e) => handleTotalOverrideChange(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
