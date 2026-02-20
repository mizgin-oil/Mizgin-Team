
import React, { useState, useEffect } from 'react';
import { getStore, saveStore, clearUser } from './store';
import { AppState, Employee } from './types';
import { Layout } from './components/Layout';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { PortalSelection } from './components/PortalSelection';

type AppView = 'landing' | 'login' | 'admin_dash' | 'employee_dash';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(getStore());
  const [view, setView] = useState<AppView>('landing');
  const [targetRole, setTargetRole] = useState<'admin' | 'employee' | null>(null);

  useEffect(() => {
    saveStore(state);
  }, [state]);

  // Handle routing based on auth state and view
  useEffect(() => {
    if (state.currentUser) {
      if (state.currentUser.role === 'employee') {
        setView('employee_dash');
      } else if (state.currentUser.role === 'admin' && view === 'login') {
        // After admin logs in, show them the selection (landing) again
        setView('landing');
      }
    } else {
      // If no user, we either show landing or login
      if (view !== 'login') setView('landing');
    }
  }, [state.currentUser]);

  const handleLogin = (user: Employee) => {
    setState(prev => ({ ...prev, currentUser: user }));
  };

  const handleLogout = () => {
    clearUser();
    setState(prev => ({ ...prev, currentUser: null }));
    setView('landing');
    setTargetRole(null);
  };

  const handleUpdateState = (newState: AppState) => {
    setState(newState);
  };

  const handlePortalSelect = (selectedRole: 'admin' | 'employee') => {
    setTargetRole(selectedRole);
    if (!state.currentUser) {
      setView('login');
    } else {
      // Admin switching between portals
      setView(selectedRole === 'admin' ? 'admin_dash' : 'employee_dash');
    }
  };

  const handleBackToLanding = () => {
    setView('landing');
  };

  const renderContent = () => {
    // Unauthenticated flow
    if (!state.currentUser) {
      if (view === 'landing') {
        return <PortalSelection onSelect={handlePortalSelect} title="Mizgin Oil Systems" subtitle="Please select your access portal" />;
      }
      return (
        <div className="space-y-4">
          <button 
            onClick={handleBackToLanding}
            className="flex items-center text-slate-500 hover:text-blue-600 transition-colors font-semibold"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
            Back to Selection
          </button>
          <Login state={state} onLogin={handleLogin} />
        </div>
      );
    }

    // Authenticated flow
    if (state.currentUser.role === 'admin') {
      switch (view) {
        case 'landing':
          return <PortalSelection onSelect={handlePortalSelect} title="Control Center" subtitle="Choose workspace" />;
        case 'admin_dash':
          return <AdminDashboard state={state} onUpdate={handleUpdateState} />;
        case 'employee_dash':
          return <EmployeeDashboard state={state} user={state.currentUser} onUpdate={handleUpdateState} />;
        default:
          return <PortalSelection onSelect={handlePortalSelect} />;
      }
    }

    // Standard employee only sees dashboard
    return <EmployeeDashboard state={state} user={state.currentUser} onUpdate={handleUpdateState} />;
  };

  return (
    <Layout 
      user={state.currentUser} 
      onLogout={handleLogout}
      onSwitchPortal={state.currentUser?.role === 'admin' && view !== 'landing' ? handleBackToLanding : undefined}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
