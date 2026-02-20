
import React from 'react';
import { Employee } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: Employee | null;
  onLogout: () => void;
  onSwitchPortal?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  onSwitchPortal
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold">M</div>
              <span className="text-xl font-bold text-slate-800">Mizgin Oil</span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-2 sm:space-x-4">
                {onSwitchPortal && (
                  <button
                    onClick={onSwitchPortal}
                    className="flex items-center space-x-1 px-3 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all border bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                    </svg>
                    <span>Switch Portal</span>
                  </button>
                )}
                
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                
                <button
                  onClick={onLogout}
                  className="px-3 py-2 text-xs sm:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
