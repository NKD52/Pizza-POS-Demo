import React, { useState } from 'react';
import { ShoppingCart, DollarSign, ChevronDown, UtensilsCrossed, ChevronUp } from 'lucide-react';
import { OrderItem } from '../types';

interface SideItem {
  id: string;
  name: string;
  price: number;
  category: 'Side' | 'Drink' | 'Dessert';
}

const AVAILABLE_SIDES: SideItem[] = [
  { id: 's1', name: 'Garlic Breadsticks', price: 5.99, category: 'Side' },
  { id: 's2', name: 'Cheesy Bread', price: 6.99, category: 'Side' },
  { id: 's3', name: 'Wings (6pc)', price: 8.99, category: 'Side' },
  { id: 's4', name: 'Wings (12pc)', price: 15.99, category: 'Side' },
  { id: 's5', name: 'Caesar Salad', price: 7.99, category: 'Side' },
  { id: 'd1', name: '2L Coke', price: 3.49, category: 'Drink' },
  { id: 'd2', name: '2L Sprite', price: 3.49, category: 'Drink' },
  { id: 'd3', name: '2L Diet Coke', price: 3.49, category: 'Drink' },
  { id: 'ds1', name: 'Cinna-Stix', price: 6.99, category: 'Dessert' },
  { id: 'ds2', name: 'Choco-Lava Cake', price: 7.99, category: 'Dessert' },
];

interface Props {
  onAddToOrder: (item: OrderItem) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const SidesSection: React.FC<Props> = ({ onAddToOrder, isOpen, onToggle }) => {
  const [selectedSideId, setSelectedSideId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customPrice, setCustomPrice] = useState<string>('');

  const selectedSide = AVAILABLE_SIDES.find(s => s.id === selectedSideId);

  const calculatePrice = () => {
    if (!selectedSide) return 0;
    return selectedSide.price * quantity;
  };

  const handleAdd = () => {
    if (!selectedSide) return;

    let finalPrice = calculatePrice();
    if (customPrice && !isNaN(parseFloat(customPrice))) {
      finalPrice = parseFloat(customPrice);
    }

    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${quantity}x ${selectedSide.name}`,
      description: selectedSide.category,
      price: finalPrice,
      quantity: quantity,
      // No config for sides
    };

    onAddToOrder(item);
    
    // Reset fields
    setSelectedSideId('');
    setQuantity(1);
    setCustomPrice('');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button 
        onClick={onToggle}
        className="w-full flex justify-between items-center p-4 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-gray-700" />
            <h2 className="text-base font-bold text-gray-900">Sides & Extras</h2>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col md:flex-row gap-3 items-end">
                {/* Item Selection */}
                <div className="flex-grow w-full">
                <label className="block text-xs font-medium text-gray-600 mb-1">ITEM SELECTION</label>
                <div className="relative">
                    <select
                    value={selectedSideId}
                    onChange={(e) => setSelectedSideId(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white h-10"
                    >
                    <option value="">Select a side...</option>
                    {['Side', 'Drink', 'Dessert'].map(category => (
                        <optgroup key={category} label={category}>
                        {AVAILABLE_SIDES.filter(s => s.category === category).map(side => (
                            <option key={side.id} value={side.id}>
                            {side.name} (${side.price.toFixed(2)})
                            </option>
                        ))}
                        </optgroup>
                    ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                </div>
                </div>

                {/* Quantity */}
                <div className="w-full md:w-24">
                <label className="block text-xs font-medium text-gray-600 mb-1">QTY</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-10 text-center"
                />
                </div>

                {/* Price Override */}
                <div className="w-full md:w-32">
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    OVERRIDE
                </label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500 text-xs">$</span>
                    <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={selectedSide ? calculatePrice().toFixed(2) : '0.00'}
                    className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-10"
                    />
                </div>
                </div>

                {/* Add Button */}
                <button
                onClick={handleAdd}
                disabled={!selectedSide}
                className={`h-10 px-6 rounded-md font-semibold shadow-sm flex items-center gap-2 transition-colors text-sm whitespace-nowrap mb-[1px] ${
                    !selectedSide 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
                >
                <ShoppingCart className="w-4 h-4" />
                Add
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SidesSection;