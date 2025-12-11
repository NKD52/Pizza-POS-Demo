
import React, { useState } from 'react';
import CustomerDetails from './components/CustomerDetails';
import PizzaBuilder from './components/PizzaBuilder';
import SidesSection from './components/SidesSection';
import OrderSummary from './components/OrderSummary';
import NotesSection from './components/NotesSection';
import { CustomerDetails as CustomerDetailsType, OrderItem, OrderSummaryState } from './types';

type Section = 'customer' | 'builder' | 'sides';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section | null>('customer');
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null);

  const [customer, setCustomer] = useState<CustomerDetailsType>({
    eventName: 'Birthday Party',
    store: 'Downtown',
    organization: 'Pizza Palace Inc.',
    contactName: 'Jane Doe',
    email: 'jane.doe@pizzapalace.com',
    orderType: 'Delivery'
  });

  const [orderSummary, setOrderSummary] = useState<OrderSummaryState>({
    items: [
        {
            id: '1',
            name: '1x Large Pizza',
            description: 'Pepperoni, Mushrooms',
            price: 22.50,
            quantity: 1,
            deliveryTime: '12:30 PM',
            config: { 
              size: 'Large', 
              crust: 'Thin', 
              crustSeasoning: 'No Seasoning',
              sauce: 'Tomato', 
              sauceAmount: 'Normal',
              cheese: 'Regular',
              toppings: []
            }
        },
        {
            id: '2',
            name: '1x Medium Pizza',
            description: 'Pepperoni, Onions',
            price: 18.00,
            quantity: 1,
            deliveryTime: '1:00 PM',
            config: { 
              size: 'Medium', 
              crust: 'Thin', 
              crustSeasoning: 'No Seasoning',
              sauce: 'Tomato', 
              sauceAmount: 'Normal',
              cheese: 'Regular',
              toppings: []
            }
        }
    ],
    subtotal: 40.50,
    taxExempt: false,
    discountValue: 5,
    discountType: '$',
    tip: 5.00
  });

  // Unified Save Function (Add or Update)
  const handleSaveOrder = (item: OrderItem) => {
    setOrderSummary(prev => {
      const existingIndex = prev.items.findIndex(i => i.id === item.id);
      let newItems;
      
      if (existingIndex >= 0) {
        // Update existing
        newItems = [...prev.items];
        newItems[existingIndex] = item;
      } else {
        // Add new
        newItems = [...prev.items, item];
      }

      return {
        ...prev,
        items: newItems
      };
    });

    // Clear editing state after save
    setEditingItem(null);
  };

  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item);
    
    // Determine which section to open based on content
    if (item.config) {
        setActiveSection('builder');
    } else {
        setActiveSection('sides');
    }
  };

  const handleRemoveItem = (id: string) => {
    setOrderSummary(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
    }));
    // If we are editing the item that was just deleted, clear edit mode
    if (editingItem?.id === id) {
        setEditingItem(null);
    }
  };

  const toggleSection = (section: Section) => {
    if (activeSection === section) {
      setActiveSection(null);
      // Optional: Clear edit mode if closing the section? 
      // For now, let's keep it so they can close and re-open to continue editing.
    } else {
      setActiveSection(section);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-8 py-6 mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Order</h1>
      </header>

      <main className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-8 space-y-4">
          <CustomerDetails 
            details={customer} 
            onChange={setCustomer}
            isOpen={activeSection === 'customer'}
            onToggle={() => toggleSection('customer')}
          />
          
          <PizzaBuilder 
            defaultTime="12:30 PM"
            onAddToOrder={handleSaveOrder}
            isOpen={activeSection === 'builder'}
            onToggle={() => toggleSection('builder')}
            itemToEdit={activeSection === 'builder' ? editingItem : null} // Only pass if active to prevent state confusion
          />

          <SidesSection 
            defaultTime="12:30 PM"
            onAddToOrder={handleSaveOrder}
            isOpen={activeSection === 'sides'}
            onToggle={() => toggleSection('sides')}
            itemToEdit={activeSection === 'sides' ? editingItem : null}
          />

          <NotesSection />
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4">
          <OrderSummary 
            summary={orderSummary} 
            onUpdate={setOrderSummary}
            onRemoveItem={handleRemoveItem}
            onEditItem={handleEditItem}
          />
        </div>
      </main>

      {/* Footer Sticky Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4 px-8 flex justify-end gap-4 z-50">
        <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors">
          Save Draft
        </button>
        <button className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 shadow-sm transition-colors">
          Create Order
        </button>
      </footer>
    </div>
  );
};

export default App;
