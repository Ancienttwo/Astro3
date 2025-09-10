import React, { useState } from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';

interface SciencePopupProps {
  title: string;
  content: React.ReactNode;
  className?: string;
  iconColor?: string;
}

const SciencePopup: React.FC<SciencePopupProps> = ({ 
  title, 
  content, 
  className = '',
  iconColor = 'text-purple-500'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={className}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 w-full p-3 rounded-lg transition-colors
          bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800
          border border-gray-200 dark:border-slate-700
          text-left
        `}
      >
        <Lightbulb className={`w-4 h-4 ${iconColor}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-slate-300 flex-1">
          {title}
        </span>
        <ChevronDown 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default SciencePopup; 