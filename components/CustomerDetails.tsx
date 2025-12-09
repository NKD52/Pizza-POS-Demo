import React from 'react';
import { CustomerDetails as CustomerDetailsType } from '../types';
import { Calendar, Clock, Search } from 'lucide-react';

interface Props {
  details: CustomerDetailsType;
  onChange: (details: CustomerDetailsType) => void;
}

const CustomerDetails: React.FC<Props> = ({ details, onChange }) => {
  const handleChange = (field: keyof CustomerDetailsType, value: string) => {
    onChange({ ...details, [field]: value });
  };

  const inputClasses = "w-full px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm h-9";
  const labelClasses = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <h2 className="text-base font-bold text-gray-900 mb-3">Customer Details</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Row 1 Concept: Search & Identification */}
        <div className="col-span-1">
          <label className={labelClasses}>Phone Search</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search..."
              className={`${inputClasses} pl-3 pr-8`}
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-2.5" />
          </div>
        </div>
        
        <div className="col-span-1">
          <label className={labelClasses}>Store</label>
          <select 
            value={details.store}
            onChange={(e) => handleChange('store', e.target.value)}
            className={`${inputClasses} bg-white`}
          >
            <option value="Downtown">Downtown</option>
            <option value="Westside">Westside</option>
            <option value="North Hills">North Hills</option>
            <option value="Airport">Airport</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className={labelClasses}>Order Type</label>
          <select 
            value={details.orderType}
            onChange={(e) => handleChange('orderType', e.target.value as any)}
            className={`${inputClasses} bg-white`}
          >
            <option value="Delivery">Delivery</option>
            <option value="Pickup">Pickup</option>
            <option value="Dine-in">Dine-in</option>
          </select>
        </div>

        <div className="col-span-1">
           <label className={labelClasses}>Organization</label>
          <input 
            type="text" 
            value={details.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Row 2 Concept: Contact Info */}
        <div className="col-span-1">
          <label className={labelClasses}>Contact Name</label>
          <input 
            type="text" 
            value={details.contactName}
            onChange={(e) => handleChange('contactName', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="col-span-1">
          <label className={labelClasses}>Contact Phone</label>
          <input 
            type="text" 
            value={details.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="col-span-2">
          <label className={labelClasses}>Email</label>
          <input 
            type="email" 
            value={details.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Row 3 Concept: Timing (Optional/Collapsed in future) */}
        <div className="col-span-1">
          <label className={labelClasses}>Date</label>
          <div className="relative">
            <input 
              type="text" 
              value={details.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`${inputClasses} pl-3 pr-8`}
            />
            <Calendar className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5" />
          </div>
        </div>
        <div className="col-span-1">
          <label className={labelClasses}>Time</label>
          <div className="relative">
            <input 
              type="text" 
              value={details.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className={`${inputClasses} pl-3 pr-8`}
            />
            <Clock className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-2.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;