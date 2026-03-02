
import React, { useState, useEffect, useCallback } from 'react';
import { clearUser } from './store';
import { AppState, Employee } from './types';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { PortalSelection } from './components/PortalSelection';
import { supabase } from './services/supabase';

type AppView = 'landing' | 'login' | 'admin_dash' | 'employee_dash';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    currentUser: JSON.parse(localStorage.getItem('mizgin_user') || 'null'),
    employees: [],
    categories: [],
    workLogs: []
  });
  const [view, setView] = useState<AppView>('landing');
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [empRes, catRes, logRes] = await Promise.all([
        supabase.from('employees').select('*'),
        supabase.from('categories').select('*'),
        supabase.from('work_logs').select('*')
      ]);

      setState(prev => ({
        ...prev,
        employees: empRes.data || [],
        categories: catRes.data || [],
        workLogs: logRes.data || []
      }));
      setIsDataLoaded(true);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // View state management based on Auth
  useEffect(() => {
    if (state.currentUser) {
      localStorage.setItem('mizgin_user', JSON.stringify(state.currentUser));
      if (state.currentUser.role === 'employee') {
        setView('employee_dash');
      } else if (state.currentUser.role === 'admin') {
        // Admins start at landing to choose where to go
        if (view === 'login') setView('landing');
      }
    } else {
      localStorage.removeItem('mizgin_user');
      if (view !== 'login') setView('landing');
    }
  }, [state.currentUser, view]);

  const handleLogin = (user: Employee) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    clearUser();
    setState(prev => ({ ...prev, currentUser: null }));
    setView('landing');
  };

  const handlePortalSelect = (selectedRole: 'admin' | 'employee') => {
    if (!state.currentUser) {
      setView('login');
    } else {
      // Logic for logged in users (specifically Admin)
      if (state.currentUser.role === 'admin') {
        setView(selectedRole === 'admin' ? 'admin_dash' : 'employee_dash');
      } else {
        // Employees always go to dash
        setView('employee_dash');
      }
    }
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const renderContent = () => {
    // Unauthenticated Flow
    if (!state.currentUser) {
      if (view === 'landing') {
        return <PortalSelection onSelect={handlePortalSelect} />;
      }
      return (
        <div className="max-w-md mx-auto space-y-4">
          <button 
            onClick={handleBackToLanding}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-bold text-sm"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Portal Selection
          </button>
          <Login state={state} onLogin={handleLogin} />
        </div>
      );
    }

    // Authenticated Flow (Admin or Employee)
    if (state.currentUser.role === 'admin') {
      switch (view) {
        case 'landing':
          return <PortalSelection onSelect={handlePortalSelect} title="Control Center" subtitle="Manage Mizgin Oil resources" />;
        case 'admin_dash':
          return <AdminDashboard state={state} onUpdate={fetchData} />;
        case 'employee_dash':
          return <EmployeeDashboard state={state} user={state.currentUser} onUpdate={fetchData} />;
        default:
          return <PortalSelection onSelect={handlePortalSelect} />;
      }
    }

    // Normal Employee view
    return <EmployeeDashboard state={state} user={state.currentUser} onUpdate={fetchData} />;
  };

  return (
    <Layout 
      user={state.currentUser} 
      onLogout={handleLogout}
    >
      {!isDataLoaded && view !== 'landing' && view !== 'login' ? (
         <div className="flex flex-col items-center justify-center py-20">
           <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400 font-bold">Synchronizing...</p>
         </div>
      ) : renderContent()}
    </Layout>
  );
};

export default App;
