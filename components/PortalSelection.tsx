
import React from 'react';

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
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-slate-800">Employee Portal</h2>
          <p className="text-slate-400 mt-2 font-medium">Check-in, Check-out & Records</p>
        </button>

        <button
          onClick={() => onSelect('admin')}
          className="flex-1 bg-slate-900 p-12 rounded-3xl shadow-xl border-2 border-transparent hover:border-blue-500 transition-all group text-center"
        >
          <div className="w-20 h-20 bg-slate-800 text-blue-400 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Admin Portal</h2>
          <p className="text-slate-500 mt-2 font-medium">Control Panel & Reports</p>
        </button>
      </div>
    </div>
  );
};
