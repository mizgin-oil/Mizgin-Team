
import React, { useState, useEffect } from 'react';
import { AppState, WorkLog } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkCalendar } from './WorkCalendar';
import { supabase } from '../services/supabase';

interface Props {
  state: AppState;
  onUpdate: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ state, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'categories' | 'reports'>('employees');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Forms
  const [newCat, setNewCat] = useState('');
  const [empForm, setEmpForm] = useState({ name: '', jobTitle: '', categoryId: '', email: '', password: '' });

  const addCategory = async () => {
    if (!newCat) return;
    setIsProcessing(true);
    const { error } = await supabase.from('categories').insert([{ name: newCat }]);
    if (error) alert(error.message);
    else {
      setNewCat('');
      onUpdate();
    }
    setIsProcessing(false);
  };

  const removeCategory = async (id: string) => {
    if (!confirm('Remove this category? Employees in this category will become uncategorized.')) return;
    
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        console.error('Delete error:', error);
        alert(`Could not delete category: ${error.message}`);
      } else {
        await onUpdate();
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while deleting.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addEmployee = async () => {
    if (!empForm.name || !empForm.email || !empForm.password || !empForm.categoryId) {
      alert("Please fill all fields");
      return;
    }
    setIsProcessing(true);
    const { error } = await supabase.from('employees').insert([{ ...empForm, role: 'employee' }]);
    if (error) alert(error.message);
    else {
      setEmpForm({ name: '', jobTitle: '', categoryId: '', email: '', password: '' });
      onUpdate();
    }
    setIsProcessing(false);
  };

  const removeEmployee = async (id: string) => {
    if (!confirm('Permanently remove this employee?')) return;
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) alert(error.message);
    else onUpdate();
  };

  const calculateHours = (logs: WorkLog[]) => {
    return logs.reduce((acc, log) => {
      if (log.checkIn && log.checkOut) {
        return acc + (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
  };

  const reportData = state.employees.map(emp => ({
    name: emp.name,
    hours: parseFloat(calculateHours(state.workLogs.filter(l => l.employeeId === emp.id)).toFixed(2))
  }));

  const getLiveDuration = (checkIn: string) => {
    const diff = now.getTime() - new Date(checkIn).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const selectedEmployee = state.employees.find(e => e.id === selectedEmployeeId);
  const employeeLogs = state.workLogs.filter(l => l.employeeId === selectedEmployeeId);

  const onlineEmployees = state.employees.filter(emp => 
    state.workLogs.some(l => l.employeeId === emp.id && !l.checkOut)
  );

  return (
    <div className="space-y-8">
      {/* Live Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Online Now</p>
            <h3 className="text-2xl font-black text-slate-800">{onlineEmployees.length}</h3>
            {onlineEmployees.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {onlineEmployees.map(e => {
                  const log = state.workLogs.find(l => l.employeeId === e.id && !l.checkOut);
                  return (
                    <span key={e.id} className="text-[9px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-md font-bold border border-green-100">
                      {e.name} ({log ? getLiveDuration(log.checkIn) : '...'})
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Staff</p>
            <h3 className="text-2xl font-black text-slate-800">{state.employees.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Categories</p>
            <h3 className="text-2xl font-black text-slate-800">{state.categories.length}</h3>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {(['employees', 'categories', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedEmployeeId(null); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all flex items-center space-x-2 ${
                activeTab === tab ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab === 'employees' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
              {tab === 'categories' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>}
              {tab === 'reports' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
              <span>{tab}</span>
            </button>
          ))}
        </div>
        
        {selectedEmployeeId && (
          <button 
            onClick={() => setSelectedEmployeeId(null)}
            className="flex items-center text-blue-600 font-bold text-sm hover:underline"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to List
          </button>
        )}
      </div>

      {activeTab === 'categories' && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-2xl">
          <h2 className="text-xl font-black text-slate-800 mb-6">Job Classifications</h2>
          <div className="flex space-x-3 mb-8">
            <input
              type="text"
              placeholder="e.g. Field Engineering, Logistics"
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={newCat}
              onChange={e => setNewCat(e.target.value)}
              disabled={isProcessing}
            />
            <button 
              onClick={addCategory} 
              disabled={isProcessing}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {isProcessing ? 'Adding...' : 'Add Category'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {state.categories.map(c => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100 group">
                <span className="font-bold text-slate-700">{c.name}</span>
                <button 
                  onClick={() => removeCategory(c.id)}
                  disabled={isProcessing}
                  className="flex items-center space-x-1 text-slate-300 hover:text-red-500 transition-all px-2 py-1 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  title="Delete Category"
                >
                  <span className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    {isProcessing ? '...' : 'Delete'}
                  </span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'employees' && !selectedEmployeeId && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-200 h-fit">
            <h2 className="text-xl font-black text-slate-800 mb-6">Onboard New Talent</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={empForm.name} onChange={e => setEmpForm({...empForm, name: e.target.value})} disabled={isProcessing} />
              <input type="text" placeholder="Job Title" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={empForm.jobTitle} onChange={e => setEmpForm({...empForm, jobTitle: e.target.value})} disabled={isProcessing} />
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={empForm.categoryId} onChange={e => setEmpForm({...empForm, categoryId: e.target.value})} disabled={isProcessing}>
                <option value="">Select Category</option>
                {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input type="email" placeholder="Email Address" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={empForm.email} onChange={e => setEmpForm({...empForm, email: e.target.value})} disabled={isProcessing} />
              <input type="password" placeholder="Password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={empForm.password} onChange={e => setEmpForm({...empForm, password: e.target.value})} disabled={isProcessing} />
              <button onClick={addEmployee} disabled={isProcessing} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-sm hover:bg-slate-800 transition shadow-lg disabled:opacity-50">
                {isProcessing ? 'Registering...' : 'Register Employee'}
              </button>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-slate-800">Team Directory</h2>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{state.employees.length} Staff members</span>
              </div>

              <div className="space-y-10">
                {state.categories.map(category => {
                  const categoryEmployees = state.employees.filter(e => e.categoryId === category.id);
                  if (categoryEmployees.length === 0) return null;

                  return (
                    <div key={category.id} className="space-y-4">
                      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">{category.name}</h3>
                        <span className="text-[10px] font-bold text-slate-300">({categoryEmployees.length})</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50/50 text-slate-400 font-black uppercase text-[9px] tracking-widest">
                            <tr>
                              <th className="px-4 py-3">Employee</th>
                              <th className="px-4 py-3">Status</th>
                              <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            {categoryEmployees.map(emp => {
                              const isOnline = state.workLogs.some(l => l.employeeId === emp.id && !l.checkOut);
                              return (
                                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-4 py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">{emp.name.charAt(0)}</div>
                                      <div>
                                        <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                                        <p className="text-[10px] text-slate-400">{emp.jobTitle}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    {isOnline ? (
                                      <div className="flex flex-col">
                                        <span className="flex items-center text-green-600 font-black text-[9px] uppercase">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                          On Duty
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 ml-3.5">
                                          {getLiveDuration(state.workLogs.find(l => l.employeeId === emp.id && !l.checkOut)!.checkIn)}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-slate-300 font-bold text-[9px] uppercase">Away</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4 text-right space-x-2">
                                    <button onClick={() => setSelectedEmployeeId(emp.id)} className="text-blue-600 font-black text-[10px] uppercase hover:underline">Logs</button>
                                    <button onClick={() => removeEmployee(emp.id)} className="text-red-300 hover:text-red-500 transition-colors">
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}

                {state.employees.filter(e => !e.categoryId || !state.categories.find(c => c.id === e.categoryId)).length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Uncategorized</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <tbody className="divide-y divide-slate-50">
                          {state.employees.filter(e => !e.categoryId || !state.categories.find(c => c.id === e.categoryId)).map(emp => {
                            const isOnline = state.workLogs.some(l => l.employeeId === emp.id && !l.checkOut);
                            return (
                              <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-black text-slate-400 text-xs">{emp.name.charAt(0)}</div>
                                    <div>
                                      <p className="font-bold text-slate-800 text-xs">{emp.name}</p>
                                      <p className="text-[10px] text-slate-400">{emp.jobTitle}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  {isOnline ? (
                                    <div className="flex flex-col">
                                      <span className="flex items-center text-green-600 font-black text-[9px] uppercase">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                                        On Duty
                                      </span>
                                      <span className="text-[10px] font-bold text-slate-500 ml-3.5">
                                        {getLiveDuration(state.workLogs.find(l => l.employeeId === emp.id && !l.checkOut)!.checkIn)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-300 font-bold text-[9px] uppercase">Away</span>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-right space-x-2">
                                  <button onClick={() => setSelectedEmployeeId(emp.id)} className="text-blue-600 font-black text-[10px] uppercase hover:underline">Logs</button>
                                  <button onClick={() => removeEmployee(emp.id)} className="text-red-300 hover:text-red-500 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {state.employees.length === 0 && (
                  <div className="p-16 text-center text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    No active personnel records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedEmployeeId && selectedEmployee && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center font-black text-3xl mx-auto mb-4">{selectedEmployee.name.charAt(0)}</div>
                <h2 className="text-2xl font-black text-slate-800">{selectedEmployee.name}</h2>
                <p className="text-slate-500 font-medium">{selectedEmployee.jobTitle}</p>
                <p className="text-xs text-slate-400 mt-1 uppercase font-black tracking-widest">{selectedEmployee.email}</p>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Hours</span>
                  <span className="text-xl font-black text-blue-600">{calculateHours(employeeLogs).toFixed(1)}h</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase">Total Sessions</span>
                  <span className="text-xl font-black text-slate-800">{employeeLogs.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                Attendance Calendar
              </h3>
              <WorkCalendar logs={employeeLogs} />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-800">Complete History</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Check In</th>
                      <th className="px-6 py-4">Check Out</th>
                      <th className="px-6 py-4 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {employeeLogs.slice().reverse().map(log => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 font-bold text-slate-700">{new Date(log.checkIn).toLocaleString()}</td>
                        <td className="px-6 py-4 text-slate-500">{log.checkOut ? new Date(log.checkOut).toLocaleString() : <span className="text-green-600 font-black uppercase text-[10px]">Active</span>}</td>
                        <td className="px-6 py-4 text-right font-black text-blue-600">
                          {log.checkOut ? ((new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60)).toFixed(1) + 'h' : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-8">Productivity Matrix</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl font-black text-slate-800 mb-6">Real-time Activity Log</h2>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                {state.workLogs.slice(-10).reverse().map(log => {
                  const emp = state.employees.find(e => e.id === log.employeeId);
                  return (
                    <div key={log.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{emp?.name || 'Unknown'}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{new Date(log.checkIn).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {!log.checkOut && (
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {getLiveDuration(log.checkIn)}
                          </span>
                        )}
                        <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${!log.checkOut ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                          {!log.checkOut ? 'In' : 'Out'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
