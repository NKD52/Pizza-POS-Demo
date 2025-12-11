
import React, { useState, useEffect } from 'react';
import { PizzaConfig, Topping, PizzaSize, CrustType, SauceType, OrderItem, SauceAmount, CheeseAmount, CrustSeasoning, PizzaTopping } from '../types';
import { ShoppingCart, ChevronDown, Pizza, Layers, DollarSign, MessageSquare, ChevronUp, Clock, RefreshCw } from 'lucide-react';

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

interface Specialty {
    name: string;
    toppings: string[];
    sauce: SauceType;
}

const SPECIALTIES: Specialty[] = [
  { name: 'Meat Lovers', toppings: ['Pepperoni', 'Sausage', 'Bacon', 'Ham', 'Chicken'], sauce: 'Tomato' },
  { name: 'Veggie Supreme', toppings: ['Onions', 'Mushrooms', 'Green Peppers', 'Olives', 'Pineapple'], sauce: 'Tomato' },
  { name: 'Hawaiian', toppings: ['Ham', 'Pineapple'], sauce: 'Tomato' },
  { name: 'BBQ Chicken', toppings: ['Chicken', 'Onions', 'Bacon'], sauce: 'BBQ' }
];

// Using Partial to allow for "unchecked" states (undefined)
const BLANK_CONFIG: Partial<PizzaConfig> = {
  size: undefined,
  crust: undefined,
  crustSeasoning: undefined,
  sauce: undefined,
  sauceAmount: undefined,
  cheese: undefined,
  toppings: []
};

interface Props {
  onAddToOrder: (item: OrderItem) => void;
  isOpen: boolean;
  onToggle: () => void;
  defaultTime: string;
  itemToEdit: OrderItem | null;
}

const PizzaBuilder: React.FC<Props> = ({ onAddToOrder, isOpen, onToggle, defaultTime, itemToEdit }) => {
  const [mode, setMode] = useState<'custom' | 'specialty'>('custom');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  
  // Custom Build State
  const [isHalfAndHalf, setIsHalfAndHalf] = useState(false);

  // Specialty Mode specific state
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemTime, setItemTime] = useState(defaultTime);
  
  // Sync internal time state when defaultTime changes from parent
  useEffect(() => {
    // Only reset time if we aren't editing, or if editing item is null
    if (!itemToEdit) {
        setItemTime(defaultTime);
    }
  }, [defaultTime, itemToEdit]);

  const [config, setConfig] = useState<Partial<PizzaConfig>>(BLANK_CONFIG);

  // Hydrate state when editing an item
  useEffect(() => {
    if (itemToEdit && itemToEdit.config) {
        // 1. Basic Fields
        setQuantity(itemToEdit.quantity);
        setItemTime(itemToEdit.deliveryTime);
        setSpecialInstructions(itemToEdit.specialInstructions || '');
        setConfig(itemToEdit.config);
        
        // 2. Determine Mode (Custom vs Specialty)
        // Heuristic: Check if item name contains a known specialty name
        const foundSpecialty = SPECIALTIES.find(s => itemToEdit.name.includes(s.name));
        if (foundSpecialty) {
            setMode('specialty');
            setSelectedSpecialty(foundSpecialty.name);
        } else {
            setMode('custom');
            setSelectedSpecialty('');
        }

        // 3. Determine Half & Half Status
        const hasSplitToppings = itemToEdit.config.toppings.some(t => t.side !== 'whole');
        setIsHalfAndHalf(hasSplitToppings);

        // 4. Determine Price Override
        // We calculate what the price *should* be based on config
        const calculated = calculatePriceInternal(itemToEdit.config as PizzaConfig, itemToEdit.quantity);
        // If stored price differs significantly from calculated, it was overridden
        if (Math.abs(itemToEdit.price - calculated) > 0.01) {
            setCustomPrice(itemToEdit.price.toFixed(2));
        } else {
            setCustomPrice('');
        }
    } else if (itemToEdit === null) {
        // Reset if we stop editing (optional, depending on UX preference)
        // For now, we keep the previous state unless explicitly cleared by a Save action
        // or we can allow the user to "cancel" edit by closing the toggle, 
        // but typically we wait for the parent to pass null.
    }
  }, [itemToEdit]);

  // side can be 'whole', 'left', 'right'
  const toggleTopping = (topping: Topping, sideToToggle: 'whole' | 'left' | 'right' = 'whole') => {
    setConfig(prev => {
      const currentToppings = prev.toppings || [];
      const existing = currentToppings.find(t => t.id === topping.id);
      let newToppings = [...currentToppings];

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
      // Auto-populate implied fields for specialty, but keep Size/Crust optional if not yet set
      setConfig(prev => ({
        ...prev,
        sauce: specialty.sauce,
        sauceAmount: 'Normal',
        cheese: 'Regular',
        crustSeasoning: 'No Seasoning',
        toppings: mapToppings(specialty.toppings)
      }));
    } else if (specialtyName === '') {
        // Reset if they choose default placeholder
        setConfig(prev => ({
            ...prev,
            toppings: []
        }));
    }
  };

  // Helper for internal calculation (used in useEffect too)
  const calculatePriceInternal = (cfg: Partial<PizzaConfig>, qty: number) => {
    let base = 0;
    if (cfg.size === 'Small') base = 12.00;
    if (cfg.size === 'Medium') base = 16.00;
    if (cfg.size === 'Large') base = 18.00;
    if (cfg.size === 'XL') base = 22.00;

    const toppingsPrice = (cfg.toppings || []).reduce((acc, t) => {
        const multiplier = t.side === 'whole' ? 1 : 0.5;
        return acc + (t.price * multiplier);
    }, 0);
    return (base + toppingsPrice) * qty;
  }

  const calculatePrice = () => {
    return calculatePriceInternal(config, quantity);
  };

  const handleAdd = () => {
    // Validation
    if (!config.size) {
        alert("Please select a pizza size.");
        return;
    }
    if (!config.crust) {
        alert("Please select a crust type.");
        return;
    }
    if (mode === 'custom' && !config.sauce) {
        alert("Please select a sauce.");
        return;
    }
    // Specialty usually auto-sets sauce, but if something went wrong:
    if (mode === 'specialty' && !config.sauce) {
         // Fallback or alert
         alert("Please select a valid specialty.");
         return;
    }

    let finalPrice = calculatePrice();
    // Use custom price if set, regardless of mode
    if (customPrice && !isNaN(parseFloat(customPrice))) {
      finalPrice = parseFloat(customPrice);
    }

    // Cast to PizzaConfig now that we validated required fields
    const safeConfig = {
        size: config.size!,
        crust: config.crust!,
        crustSeasoning: config.crustSeasoning || 'No Seasoning',
        sauce: config.sauce!,
        sauceAmount: config.sauceAmount || 'Normal',
        cheese: config.cheese || 'Regular',
        toppings: config.toppings || []
    } as PizzaConfig;

    const item: OrderItem = {
      // If editing, preserve ID. If new, generate ID.
      id: itemToEdit ? itemToEdit.id : Math.random().toString(36).substr(2, 9),
      name: selectedSpecialty && mode === 'specialty' ? `${quantity}x ${config.size} ${selectedSpecialty}` : `${quantity}x ${config.size} Pizza`,
      description: getDescription(safeConfig),
      price: finalPrice,
      quantity: quantity,
      config: safeConfig,
      specialInstructions: specialInstructions || undefined,
      deliveryTime: itemTime || defaultTime,
    };
    onAddToOrder(item);
    
    // Reset to BLANK State (Uncheck all fields)
    setSpecialInstructions('');
    setCustomPrice('');
    setQuantity(1);
    setConfig(BLANK_CONFIG);
    setMode('custom');
    setSelectedSpecialty('');
    setIsHalfAndHalf(false);
  };

  const getDescription = (cfg: PizzaConfig) => {
    let desc = `${cfg.crust}`;
    if (mode === 'custom') desc += `, ${cfg.sauce}`;
    
    if (cfg.toppings.length > 0) {
      const whole = cfg.toppings.filter(t => t.side === 'whole').map(t => t.name);
      const left = cfg.toppings.filter(t => t.side === 'left').map(t => t.name);
      const right = cfg.toppings.filter(t => t.side === 'right').map(t => t.name);
      
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
            const existing = (config.toppings || []).find(sel => sel.id === t.id);
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

  const renderSizeButtons = () => (
    <div className="flex rounded-md shadow-sm h-8">
      {['XL', 'Large', 'Medium', 'Small'].map((size) => (
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
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-colors overflow-hidden ${itemToEdit ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-200'}`}>
      <div 
        onClick={onToggle}
        className={`w-full flex justify-between items-center p-4 transition-colors cursor-pointer ${itemToEdit ? 'bg-orange-50 hover:bg-orange-100' : 'bg-white hover:bg-gray-50'}`}
      >
        <div className="flex items-center gap-6">
            <h2 className={`text-base font-bold ${itemToEdit ? 'text-orange-800' : 'text-gray-900'}`}>
                {itemToEdit ? 'Edit Pizza' : 'Pizza Builder'}
            </h2>
            {/* Mode Toggle in Header */}
            <div className="flex p-0.5 bg-white/50 rounded-md" onClick={(e) => e.stopPropagation()}>
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
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
            {mode === 'custom' ? (
                <div className="space-y-3">
                    {/* Row 1: Base Configuration */}
                    <div className="grid grid-cols-12 gap-3">
                        {/* Size */}
                        <div className="col-span-12 md:col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">SIZE</label>
                            {renderSizeButtons()}
                        </div>
                        {/* Crust */}
                        <div className="col-span-6 md:col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">CRUST</label>
                            <div className="relative">
                                <select
                                    value={config.crust || ''}
                                    onChange={(e) => setConfig({ ...config, crust: e.target.value as CrustType })}
                                    className="w-full pl-2 pr-6 py-0 h-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                                >
                                    <option value="" disabled>Select Crust</option>
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
                                    value={config.crustSeasoning || ''}
                                    onChange={(e) => setConfig({ ...config, crustSeasoning: e.target.value as CrustSeasoning })}
                                    className="w-full pl-2 pr-6 py-0 h-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                                >
                                    <option value="" disabled>Select Seasoning</option>
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

                    {/* Instructions & Price Override for Custom Mode */}
                    <div className="grid grid-cols-12 gap-3 mt-4 pt-4 border-t border-gray-100">
                        <div className="col-span-8">
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                INSTRUCTIONS
                            </label>
                            <textarea
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                                placeholder="Special requests..."
                                className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 h-9 resize-none overflow-hidden leading-tight"
                            />
                        </div>
                        <div className="col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                OVERRIDE
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
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {/* Specialty Mode Layout */}
                <div className="grid grid-cols-12 gap-3 mb-3">
                    <div className="col-span-12 md:col-span-8">
                        <label className="block text-xs font-medium text-gray-600 mb-1">SPECIALTY SELECTION</label>
                        <div className="relative flex-grow">
                            <select 
                                value={selectedSpecialty}
                                onChange={(e) => handleSpecialtyChange(e.target.value)}
                                className="w-full px-3 py-1.5 h-8 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                            >
                                <option value="">Choose a specialty...</option>
                                {SPECIALTIES.map(s => (
                                <option key={s.name} value={s.name}>{s.name}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-2 pointer-events-none" />
                        </div>
                    </div>
                    {/* Size - Using Buttons in Specialty Too */}
                    <div className="col-span-12 md:col-span-4">
                         <label className="block text-xs font-medium text-gray-600 mb-1">SIZE</label>
                         {renderSizeButtons()}
                    </div>
                </div>

                <div className="grid grid-cols-12 gap-3 mb-3">
                     {/* Crust Seasoning in Specialty */}
                    <div className="col-span-6 md:col-span-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">SEASONING</label>
                        <div className="relative">
                            <select
                                value={config.crustSeasoning || ''}
                                onChange={(e) => setConfig({ ...config, crustSeasoning: e.target.value as CrustSeasoning })}
                                className="w-full pl-2 pr-6 py-0 h-9 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-xs bg-white"
                            >
                                <option value="" disabled>Select Seasoning</option>
                                {['No Seasoning', 'Garlic Herb'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 top-3 pointer-events-none" />
                        </div>
                    </div>

                    <div className="col-span-6 md:col-span-4">
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
                    <div className="col-span-12 md:col-span-4">
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
                        {(config.toppings || []).length > 0 ? config.toppings?.map(t => t.name).join(', ') : 'No toppings'}
                    </span>
                </div>
                </div>
            )}

            {/* Action Bar */}
            <div className={`flex gap-3 mt-4 pt-3 border-t ${itemToEdit ? 'border-orange-200' : 'border-gray-100'}`}>
                <div className="w-32">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={itemTime} 
                            onChange={(e) => setItemTime(e.target.value)}
                            className="w-full h-10 pl-8 pr-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-red-500 bg-white"
                        />
                        <Clock className="w-4 h-4 text-gray-400 absolute left-2.5 top-3" />
                    </div>
                </div>
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
                    className={`flex-1 h-10 rounded-md font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors text-sm ${itemToEdit ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                    {itemToEdit ? <RefreshCw className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    <span>
                        {itemToEdit ? 'Update Order' : 'Add to Order'} 
                        {' - $'}{(calculatePrice() * (customPrice ? 0 : 1) + (customPrice ? parseFloat(customPrice) : 0)).toFixed(2)}
                    </span>
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default PizzaBuilder;
