import React from 'react';
import { OrderSummaryState } from '../types';
import { Trash2, Pencil } from 'lucide-react';

interface Props {
  summary: OrderSummaryState;
  onUpdate: (summary: OrderSummaryState) => void;
  onRemoveItem: (id: string) => void;
}

const OrderSummary: React.FC<Props> = ({ summary, onUpdate, onRemoveItem }) => {

  const calculateTotal = () => {
    let subtotal = summary.items.reduce((acc, item) => acc + item.price, 0);
    
    // Tax (Assuming 8% for demo)
    const taxRate = 0.08;
    const tax = summary.taxExempt ? 0 : subtotal * taxRate;

    // Discount
    let discountAmount = 0;
    if (summary.discountType === '$') {
        discountAmount = summary.discountValue;
    } else {
        discountAmount = subtotal * (summary.discountValue / 100);
    }

    const total = subtotal + tax - discountAmount + summary.tip;
    return { subtotal, tax, discountAmount, total };
  };

  const { subtotal, tax, total } = calculateTotal();

  const handleDiscountChange = (val: string) => {
    const num = parseFloat(val);
    onUpdate({ ...summary, discountValue: isNaN(num) ? 0 : num });
  };

  const handleTipChange = (val: string) => {
    const num = parseFloat(val);
    onUpdate({ ...summary, tip: isNaN(num) ? 0 : num });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Order Summary ({summary.items.length})</h2>

      <div className="flex-grow overflow-y-auto mb-6 pr-2">
        {summary.items.length === 0 ? (
            <div className="text-center text-gray-400 py-10 italic">
                No items added yet.
            </div>
        ) : (
            <div className="space-y-4">
            {summary.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start pb-4 border-b border-dashed border-gray-200 last:border-0">
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
                    <button className="text-gray-400 hover:text-gray-600">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => onRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                </div>
                </div>
            ))}
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
                <label htmlFor="taxExempt" className="cursor-pointer">Tax Exempt</label>
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

        <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount</label>
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
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tip</label>
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

        <div className="flex justify-between items-center text-xl font-black text-gray-900 pt-4 border-t mt-4">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;