import React, { useState } from 'react';
import { PizzaConfig, Topping, PizzaSize, CrustType, SauceType, OrderItem, SauceAmount, CheeseAmount, CrustSeasoning, PizzaTopping } from '../types';
import { ShoppingCart, Wand2, Loader2, ChevronDown, Pizza, Layers, DollarSign, MessageSquare } from 'lucide-react';
import { getCreativePizzaSuggestion } from '../services/geminiService';

const AVAILABLE_MEATS: Topping[] = ([
  { id: 'm5', name: 'Bacon', category: 'meat', price: 1.50 },
  { id: 'm2', name: 'Beef', category: 'meat', price: 1.50 },
  { id: 'm3', name: 'Ham', category: 'meat', price: 1.50 },
  { id: 'm7', name: 'Italian Sausage', category: 'meat', price: 1.50 },
  { id: 'm1', name: 'Pepperoni', category: 'meat', price: 1.50 },
  { id: 'm6', name: 'Philly Steak', category: 'meat', price: 1.50 },
  { id: 'm4', name: 'Premium Chicken', category: 'meat', price: 1.50 },
] as Topping[]).sort((a, b) => a.name.localeCompare(b.name));

const AVAILABLE_VEGGIES: Topping[] = ([
  { id: 'v6', name: 'Banana Peppers', category: 'veggie', price: 1.00 },
  { id: 'v5', name: 'Black Olives', category: 'veggie', price: 1.00 },
  { id: 'v7', name: 'Diced Tomatoes', category: 'veggie', price: 1.00 },
  { id: 'v3', name: 'Green Peppers', category: 'veggie', price: 1.00 },
  { id: 'v10', name: 'Hot Buffalo Sauce', category: 'veggie', price: 1.00 },
  { id: 'v4', name: 'Jalapeno Peppers', category: 'veggie', price: 1.00 },
  { id: 'v1', name: 'Mushrooms', category: 'veggie', price: 1.00 },
  { id: 'v2', name: 'Onions', category: 'veggie', price: 1.00 },
  { id: 'v9', name: 'Pineapple', category: 'veggie', price: 1.00 },
  { id: 'v8', name: 'Spinach', category: 'veggie', price: 1.00 },
] as Topping[]).sort((a, b) => a.name.localeCompare(b.name));

const AVAILABLE_CHEESES: Topping[] = ([
  { id: 'c2', name: 'Cheddar Cheese Blend', category: 'cheese', price: 1.50 },
  { id: 'c3', name: 'Feta Cheese', category: 'cheese', price: 1.50 },
  { id: 'c4', name: 'Shredded Parmesan Asiago', category: 'cheese', price: 1.50 },
  { id: 'c1', name: 'Shredded Provolone Cheese', category: 'cheese', price: 1.50 },
] as Topping[]).sort((a, b) => a.name.localeCompare(b.name));

const CRUST_OPTIONS: CrustType[] = ['Thin', 'Hand-Tossed', 'Deep Dish', 'Gluten-Free', 'Stuffed', 'Brooklyn Style'];
const SAUCE_OPTIONS: SauceType[] = ['Tomato', 'Marinara', 'BBQ', 'Alfredo', 'Garlic Parm', 'Buffalo'];

const SPECIALTIES = [
  { name: 'Meat Lovers', toppings: ['Pepperoni', 'Sausage', 'Bacon', 'Ham', 'Chicken'] },
  { name: 'Veggie Supreme', toppings: ['Onions', 'Mushrooms', 'Green Peppers', 'Olives', 'Pineapple'] },
  { name: 'Hawaiian', toppings: ['Ham', 'Pineapple'] },
  { name: 'BBQ Chicken', toppings: ['Chicken', 'Onions', 'Bacon'] }
];

interface Props {
  onAddToOrder: (item: OrderItem) => void;
}

const PizzaBuilder: React.FC<Props> = ({ onAddToOrder }) => {
  const [mode, setMode] = useState<'custom' | 'specialty'>('custom');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  
  // Custom Build State
  const [isHalfAndHalf, setIsHalfAndHalf] = useState(false);

  // Specialty Mode specific state
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const [config, setConfig] = useState<PizzaConfig>({
    size: 'Large',
    crust: 'Thin',
    crustSeasoning: 'No Seasoning',
    sauce: 'Tomato',
    sauceAmount: 'Normal',
    cheese: 'Regular',
    toppings: []
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // side can be 'whole', 'left', 'right'
  const toggleTopping = (topping: Topping, sideToToggle: 'whole' | 'left' | 'right' = 'whole') => {
    setConfig(prev => {
      const existing = prev.toppings.find(t => t.id === topping.id);
      let newToppings = [...prev.toppings];

      if (existing) {
        // If we are in 'whole' mode (standard)
        if (sideToToggle === 'whole') {
           if (existing.side !== 'whole') {
             // If currently split, convert to whole
             newToppings = newToppings.map(t => t.id === topping.id ? { ...t, side: 'whole' } : t);
           } else {
             // If already whole, remove
             newToppings = newToppings.filter(t => t.id !== topping.id);
           }
        } else {
           // We are in split mode logic
           if (existing.side === 'whole') {
             if (sideToToggle === 'left') {
                 newToppings = newToppings.map(t => t.id === topping.id ? { ...t, side: 'right' } : t);
             } else {
                 newToppings = newToppings.map(t => t.id === topping.id ? { ...t, side: 'left' } : t);
             }
           } else if (existing.side === sideToToggle) {
             // Was just this side, remove it completely
             newToppings = newToppings.filter(t => t.id !== topping.id);
           } else {
             // Was the other side, now adding this side -> become Whole
             newToppings = newToppings.map(t => t.id === topping.id ? { ...t, side: 'whole' } : t);
           }
        }
      } else {
        // Doesn't exist, add it
        newToppings.push({ ...topping, side: sideToToggle });
      }

      return { ...prev, toppings: newToppings };
    });
  };

  const mapToppings = (names: string[]): PizzaTopping[] => {
    const newToppings: PizzaTopping[] = [];
    names.forEach(name => {
      const match = (t: Topping) => t.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.name.toLowerCase());
      
      const meat = AVAILABLE_MEATS.find(m => match(m));
      const veggie = AVAILABLE_VEGGIES.find(v => match(v));
      const cheese = AVAILABLE_CHEESES.find(c => match(c));
      
      const found = meat || veggie || cheese;
      if (found) newToppings.push({ ...found, side: 'whole' });
    });
    return Array.from(new Set(newToppings.map(t => t.id))).map(id => newToppings.find(t => t.id === id)!);
  };

  const handleSpecialtyChange = (specialtyName: string) => {
    setSelectedSpecialty(specialtyName);
    const specialty = SPECIALTIES.find(s => s.name === specialtyName);
    if (specialty) {
      setConfig(prev => ({
        ...prev,
        toppings: mapToppings(specialty.toppings)
      }));
    }
  };

  const handleSuggestPizza = async () => {
    setIsLoadingAI(true);
    const suggestion = await getCreativePizzaSuggestion();
    setIsLoadingAI(false);

    if (suggestion) {
      setConfig({
        size: suggestion.size,
        crust: suggestion.crust,
        crustSeasoning: 'No Seasoning',
        sauce: suggestion.sauce,
        sauceAmount: 'Normal',
        cheese: 'Regular',
        toppings: mapToppings(suggestion.toppings)
      });
      setSelectedSpecialty('');
    }
  };

  const calculatePrice = () => {
    let base = 0;
    if (config.size === 'Small') base = 12.00;
    if (config.size === 'Medium') base = 16.00;
    if (config.size === 'Large') base = 18.00;

    const toppingsPrice = config.toppings.reduce((acc, t) => {
        const multiplier = t.side === 'whole' ? 1 : 0.5;
        return acc + (t.price * multiplier);
    }, 0);
    return (base + toppingsPrice) * quantity;
  };

  const handleAdd = () => {
    let finalPrice = calculatePrice();
    if (mode === 'specialty' && customPrice && !isNaN(parseFloat(customPrice))) {
      finalPrice = parseFloat(customPrice);
    }

    const item: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: selectedSpecialty && mode === 'specialty' ? `${quantity}x ${config.size} ${selectedSpecialty}` : `${quantity}x ${config.size} Pizza`,
      description: getDescription(),
      price: finalPrice,
      quantity: quantity,
      config: { ...config },
      specialInstructions: (mode === 'specialty' && specialInstructions) ? specialInstructions : undefined
    };
    onAddToOrder(item);
    setSpecialInstructions('');
    setCustomPrice('');
    setQuantity(1);
  };

  const getDescription = () => {
    let desc = `${config.crust}`;
    if (mode === 'custom') desc += `, ${config.sauce}`;
    
    if (config.toppings.length > 0) {
      const whole = config.toppings.filter(t => t.side === 'whole').map(t => t.name);
      const left = config.toppings.filter(t => t.side === 'left').map(t => t.name);
      const right = config.toppings.filter(t => t.side === 'right').map(t => t.name);
      
      const parts = [];
      if (whole.length) parts.push(whole.join(', '));
      if (left.length) parts.push(`Left: ${left.join(', ')}`);
      if (right.length) parts.push(`Right: ${right.join(', ')}`);
      
      desc += ', ' + parts.join(' | ');
    }
    return desc;
  }

  const renderToppingGroup = (title: string, toppings: Topping[], side: 'whole' | 'left' | 'right', colorStyles: { bg: string, border: string, text: string, hover: string }) => {
    return (
      <div className="mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{title}</span>
        <div className="flex flex-wrap gap-1.5">
          {toppings.map((t) => {
            const existing = config.toppings.find(sel => sel.id === t.id);
            const isSelected = existing ? (existing.side === 'whole' || existing.side === side) : false;
            
            // Adjust price display for half portions
            const displayPrice = side === 'whole' ? t.price : t.price / 2;
            
            return (
              <button
                key={`${t.id}-${side}`}
                onClick={() => toggleTopping(t, side)}
                className={`px-2 py-1 rounded text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                  isSelected
                    ? `${colorStyles.bg} ${colorStyles.text} ${colorStyles.border}`
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span>{t.name}</span>
                <span className={`text-[9px] opacity-70 ml-0.5 ${isSelected ? 'text-current' : 'text-gray-400'}`}>
                    (+${displayPrice.toFixed(2)})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-bold text-gray-900">Pizza Builder</h2>
        {/* Toggle Mode */}
        <div className="flex p-0.5 bg-gray-100 rounded-md">
          <button
            onClick={() => setMode('custom')}
            className={`flex items-center gap-1.5 py-1 px-3 text-xs font-medium rounded transition-all ${
              mode === 'custom' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Layers className="w-3 h-3" />
            Custom
          </button>
          <button
            onClick={() => setMode('specialty')}
            className={`flex items-center gap-1.5 py-1 px-3 text-xs font-medium rounded transition-all ${
              mode === 'specialty' 
                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Pizza className="w-3 h-3" />
            Specialty
          </button>
        </div>
      </div>

      {mode === 'custom' ? (
        <div className="animate-in fade-in duration-300 space-y-3">
            {/* Row 1: Base Configuration */}
            <div className="grid grid-cols-12 gap-3">
                {/* Size */}
                <div className="col-span-12 md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">SIZE</label>
                    <div className="flex rounded-md shadow-sm h-8">
                        {['Large', 'Medium', 'Small'].map((size) => (
                        <button
                            key={size}
                            onClick={() => setConfig({ ...config, size: size as PizzaSize })}
                            className={`flex-1 text-xs font-medium border first:rounded-l-md last:rounded-r-md transition-colors ${
                            config.size === size
                                ? 'bg-red-600 text-white border-red-600 z-10'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            {size}
                        </button>
                        ))}
                    </div>
                </div>
                {/* Crust */}
                <div className="col-span-6 md:col-span-4">
                    <label className="block text-xs font-medium text-gray-600 mb-1">CRUST</label>
                    <div className="relative">
                        <select
                            value={config.crust}
                            onChange={(e) => setConfig({ ...config, crust: e.target.value as CrustType })}
                            className="w-full pl-2 pr-6 py-0 h-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                        >
                            {CRUST_OPTIONS.map(crust => (
                                <option key={crust} value={crust}>{crust}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                </div>
                {/* Seasoning */}
                <div className="col-span-6 md:col-span-4">
                     <label className="block text-xs font-medium text-gray-600 mb-1">SEASONING</label>
                     <div className="relative">
                        <select
                            value={config.crustSeasoning}
                            onChange={(e) => setConfig({ ...config, crustSeasoning: e.target.value as CrustSeasoning })}
                            className="w-full pl-2 pr-6 py-0 h-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                        >
                            {['No Seasoning', 'Garlic Herb'].map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Row 2: Sauce & Cheese */}
            <div className="grid grid-cols-12 gap-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                {/* Sauce Type - Dense Buttons */}
                <div className="col-span-12 md:col-span-6">
                    <label className="block text-xs font-medium text-gray-600 mb-1">SAUCE TYPE</label>
                    <div className="flex flex-wrap gap-1.5">
                        {SAUCE_OPTIONS.map((sauce) => (
                            <button
                                key={sauce}
                                onClick={() => setConfig({...config, sauce})}
                                className={`px-2 py-1 text-xs rounded border transition-all ${
                                    config.sauce === sauce
                                    ? 'bg-red-50 border-red-200 text-red-700 font-medium ring-1 ring-red-200'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-white hover:border-gray-300'
                                }`}
                            >
                                {sauce}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Sauce Amount */}
                <div className="col-span-6 md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">SAUCE AMT</label>
                    <div className="flex rounded-md shadow-sm h-7">
                        {(['Light', 'Normal', 'Extra'] as SauceAmount[]).map((amt) => (
                            <button
                                key={amt}
                                onClick={() => setConfig({...config, sauceAmount: amt})}
                                className={`flex-1 text-[10px] font-medium border first:rounded-l-md last:rounded-r-md transition-colors ${
                                    config.sauceAmount === amt
                                    ? 'bg-red-500 text-white border-red-500 z-10'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {amt}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Cheese Level */}
                <div className="col-span-6 md:col-span-3">
                     <label className="block text-xs font-medium text-gray-600 mb-1">CHEESE</label>
                     <div className="flex rounded-md shadow-sm h-7">
                        {(['No', 'Light', 'Reg', 'Xtra'] as const).map((label, idx) => {
                            const value = ['No', 'Light', 'Regular', 'Extra'][idx] as CheeseAmount;
                            return (
                                <button
                                    key={value}
                                    onClick={() => setConfig({...config, cheese: value})}
                                    className={`flex-1 text-[10px] font-medium border first:rounded-l-md last:rounded-r-md transition-colors ${
                                        config.cheese === value
                                        ? 'bg-yellow-400 text-yellow-900 border-yellow-400 z-10'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Toppings Header with Half & Half Toggle */}
            <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">Toppings</span>
                        <span className="text-[10px] text-gray-500">Customize your pizza</span>
                    </div>
                    
                    <button
                        onClick={() => setIsHalfAndHalf(!isHalfAndHalf)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isHalfAndHalf ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <span className="sr-only">Enable Half & Half</span>
                        <span
                            className={`${
                                isHalfAndHalf ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ease-in-out shadow-sm`}
                        />
                    </button>
                </div>
                
                {isHalfAndHalf && <p className="text-xs text-blue-600 mb-3 font-medium bg-blue-50 px-2 py-1 rounded">Half & Half Mode: Select left and right toppings.</p>}

                {isHalfAndHalf ? (
                     <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-300">
                         {/* Left Column */}
                         <div className="border-r border-gray-100 pr-2">
                             <h3 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Left Half</h3>
                             {renderToppingGroup("Meats", AVAILABLE_MEATS, 'left', { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-50' })}
                             {renderToppingGroup("Veggies & More", AVAILABLE_VEGGIES, 'left', { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-50' })}
                             {renderToppingGroup("Cheeses", AVAILABLE_CHEESES, 'left', { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-50' })}
                         </div>

                         {/* Right Column */}
                         <div className="pl-2">
                             <h3 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">Right Half</h3>
                             {renderToppingGroup("Meats", AVAILABLE_MEATS, 'right', { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-50' })}
                             {renderToppingGroup("Veggies & More", AVAILABLE_VEGGIES, 'right', { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-50' })}
                             {renderToppingGroup("Cheeses", AVAILABLE_CHEESES, 'right', { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-50' })}
                         </div>
                     </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {renderToppingGroup("Meats", AVAILABLE_MEATS, 'whole', { bg: 'bg-red-100', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-50' })}
                        {renderToppingGroup("Veggies & More", AVAILABLE_VEGGIES, 'whole', { bg: 'bg-green-100', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-50' })}
                        {renderToppingGroup("Add-On Cheeses", AVAILABLE_CHEESES, 'whole', { bg: 'bg-yellow-100', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-50' })}
                    </div>
                )}
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
           {/* Specialty Mode Layout */}
           <div className="grid grid-cols-12 gap-3 mb-3">
             <div className="col-span-12 md:col-span-9">
                <label className="block text-xs font-medium text-gray-600 mb-1">SPECIALTY SELECTION</label>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <select 
                            value={selectedSpecialty}
                            onChange={(e) => handleSpecialtyChange(e.target.value)}
                            className="w-full px-3 py-1.5 h-9 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                        >
                            <option value="">Choose a specialty...</option>
                            {SPECIALTIES.map(s => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={handleSuggestPizza}
                        disabled={isLoadingAI}
                        className="flex items-center justify-center px-3 py-1.5 h-9 bg-purple-50 text-purple-600 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors whitespace-nowrap gap-1.5 text-xs font-medium"
                    >
                        {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wand2 className="w-3.5 h-3.5" />}
                        <span>Ask AI</span>
                    </button>
                </div>
             </div>
              <div className="col-span-6 md:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">SIZE</label>
                   <select
                        value={config.size}
                        onChange={(e) => setConfig({ ...config, size: e.target.value as PizzaSize })}
                        className="w-full px-2 py-1.5 h-9 border border-gray-300 rounded-md text-sm bg-white"
                    >
                        {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
              </div>
           </div>

           <div className="grid grid-cols-12 gap-3 mb-3">
             <div className="col-span-12 md:col-span-6">
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  INSTRUCTIONS
                </label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Notes..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-9 resize-none overflow-hidden leading-tight"
                />
             </div>
             <div className="col-span-12 md:col-span-6">
                <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  OVERRIDE PRICE
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder={calculatePrice().toFixed(2)}
                    className="w-full pl-6 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-9"
                  />
                </div>
             </div>
           </div>

           {/* Preview */}
           <div className="bg-gray-50 rounded px-3 py-2 border border-gray-100 text-xs">
              <span className="font-semibold text-gray-500 uppercase tracking-wider mr-2">Included:</span>
              <span className="text-gray-700">
                {config.toppings.length > 0 ? config.toppings.map(t => t.name).join(', ') : 'No toppings'}
              </span>
           </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
         <div className="w-16">
             <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full h-10 text-center border border-gray-300 rounded-md font-bold text-base focus:outline-none focus:ring-1 focus:ring-red-500 bg-gray-50"
             />
         </div>
         <button
            onClick={handleAdd}
            className="flex-1 bg-red-600 text-white h-10 rounded-md font-semibold shadow-sm hover:bg-red-700 flex items-center justify-center gap-2 transition-colors text-sm"
        >
            <ShoppingCart className="w-4 h-4" />
            <span>Add to Order - ${(calculatePrice() * (mode === 'specialty' && customPrice ? 0 : 1) + (mode === 'specialty' && customPrice ? parseFloat(customPrice) : 0)).toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
};

export default PizzaBuilder;