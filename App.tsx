import React, { useState } from 'react';
import CustomerDetails from './components/CustomerDetails';
import PizzaBuilder from './components/PizzaBuilder';
import SidesSection from './components/SidesSection';
import OrderSummary from './components/OrderSummary';
import NotesSection from './components/NotesSection';
import { CustomerDetails as CustomerDetailsType, OrderItem, OrderSummaryState } from './types';

type Section = 'customer' | 'builder' | 'sides';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState<Section>('customer');

  const [customer, setCustomer] = useState<CustomerDetailsType>({
    phone: '(555) 123-4567',
    store: 'Downtown',
    organization: 'Pizza Palace Inc.',
    contactName: 'Jane Doe',
    email: 'jane.doe@pizzapalace.com',
    date: '10/27/2023',
    time: '12:30 PM',
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

  const handleAddToOrder = (item: OrderItem) => {
    setOrderSummary(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setOrderSummary(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
    }));
  };

  const toggleSection = (section: Section) => {
    if (activeSection === section) {
      // Optional: Allow closing the current section if clicked again, 
      // or keep it open. Here we keep it open or toggle. 
      // Let's allow strictly one open, so clicking active does nothing or closes.
      // Usually in accordion, clicking active closes it.
      // But for POS, usually one should be open. Let's keep it open if clicked.
      return; 
    }
    setActiveSection(section);
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
            onAddToOrder={handleAddToOrder}
            isOpen={activeSection === 'builder'}
            onToggle={() => toggleSection('builder')}
          />

          <SidesSection 
            onAddToOrder={handleAddToOrder}
            isOpen={activeSection === 'sides'}
            onToggle={() => toggleSection('sides')}
          />

          <NotesSection />
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-4">
          <OrderSummary 
            summary={orderSummary} 
            onUpdate={setOrderSummary}
            onRemoveItem={handleRemoveItem}
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