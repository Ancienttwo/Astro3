import React from 'react';

interface ChartGridProps {
  children: React.ReactNode;
  className?: string;
}

const ChartGrid: React.FC<ChartGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full h-full rounded-md ${className}`}>
      <div className="w-full h-full
        grid grid-cols-[repeat(4,1fr)] grid-rows-[repeat(4,1fr)] gap-0.5 
        min-h-[400px] sm:min-h-[500px] md:min-h-[600px]">
        {children}
      </div>
    </div>
  );
};

export default ChartGrid; 