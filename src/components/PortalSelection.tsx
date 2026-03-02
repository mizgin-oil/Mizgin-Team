import React from 'react';
import { User, Settings } from 'lucide-react';

interface PortalSelectionProps {
  onSelect: (view: 'admin' | 'employee') => void;
  title?: string;
  subtitle?: string;
}

export const PortalSelection: React.FC<PortalSelectionProps> = ({ 
  onSelect, 
  title = "Mizgin Oil Systems", 
  subtitle = "Select a portal to continue" 
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="text-center mb-16">
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{title}</h1>
        <p className="text-slate-500 text-lg font-medium">{subtitle}</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-3xl">
        <button
          onClick={() => onSelect('employee')}
          className="flex-1 bg-white p-12 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-600 transition-all group text-center"
        >
          <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <User className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Employee Portal</h2>
          <p className="text-slate-400 mt-2 font-medium">Check-in, Check-out & Records</p>
        </button>

        <button
          onClick={() => onSelect('admin')}
          className="flex-1 bg-slate-900 p-12 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all group text-center"
        >
          <div className="w-20 h-20 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <Settings className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white">Admin Portal</h2>
          <p className="text-slate-500 mt-2 font-medium">Control Panel & Reports</p>
        </button>
      </div>
    </div>
  );
};
