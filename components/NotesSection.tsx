import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const NotesSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-6 bg-white hover:bg-gray-50 transition-colors"
      >
        <h2 className="text-lg font-bold text-gray-900">Notes</h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-100">
          <textarea 
            className="w-full mt-4 p-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-red-500 focus:border-red-500 text-sm h-24"
            placeholder="Add delivery instructions or kitchen notes here..."
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default NotesSection;
