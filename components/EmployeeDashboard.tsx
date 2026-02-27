
import React, { useState, useEffect } from 'react';
import { AppState, Employee, WorkLog } from '../types';
import { analyzeWorkEfficiency } from '../services/geminiService';
import { WorkCalendar } from './WorkCalendar';
import { supabase } from '../services/supabase';

interface Props {
  state: AppState;
  user: Employee;
  onUpdate: () => void;
}

export const EmployeeDashboard: React.FC<Props> = ({ state, user, onUpdate }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [analysis, setAnalysis] = useState<{summary: string, totalHours: number, insight: string} | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mizgin Oil Facility Coordinates (Approximate center from provided map link)
  const TARGET_LAT = 36.866444;
  const TARGET_LNG = 42.949639;
  const ALLOWED_RADIUS_METERS = 100; // ~100m radius to cover the 15,505 m² area

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const myLogs = state.workLogs.filter(l => l.employeeId === user.id);
  const currentSession = myLogs.find(l => !l.checkOut);

  const calculateHours = (logs: WorkLog[]) => {
    return logs.reduce((acc, log) => {
      if (log.checkIn && log.checkOut) {
        return acc + (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
  };

  const getWeeklyHours = () => {
    const now = new Date();
    const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
    firstDay.setHours(0,0,0,0);
    const weekLogs = myLogs.filter(l => new Date(l.checkIn) >= firstDay);
    return calculateHours(weekLogs);
  };

  const getMonthlyHours = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthLogs = myLogs.filter(l => new Date(l.checkIn) >= firstDay);
    return calculateHours(monthLogs);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  const handleCheckInOut = async () => {
    setIsProcessing(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsProcessing(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const distance = calculateDistance(latitude, longitude, TARGET_LAT, TARGET_LNG);

        if (distance > ALLOWED_RADIUS_METERS) {
          setLocationError(`Access Denied: You are ${Math.round(distance)}m away from the facility. Please move closer to check in/out.`);
          setIsProcessing(false);
          return;
        }

        if (currentSession) {
          const { error } = await supabase
            .from('work_logs')
            .update({ checkOut: new Date().toISOString() })
            .eq('id', currentSession.id);
          if (error) alert(error.message);
        } else {
          const { error } = await supabase
            .from('work_logs')
            .insert([{ employeeId: user.id, checkIn: new Date().toISOString() }]);
          if (error) alert(error.message);
        }
        onUpdate();
        setIsProcessing(false);
      },
      (error) => {
        let msg = "Could not verify your location.";
        if (error.code === error.PERMISSION_DENIED) msg = "Location permission denied. Please allow location access to check in/out.";
        setLocationError(msg);
        setIsProcessing(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const getAnalysis = async () => {
    setLoadingAnalysis(true);
    const result = await analyzeWorkEfficiency(myLogs, user);
    setAnalysis(result);
    setLoadingAnalysis(false);
  };

  const formatTime = (isoString: string) => new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatDuration = (start: string, end: string) => {
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  const formatDayDuration = (totalHours: number) => {
    const h = Math.floor(totalHours);
    const m = Math.round((totalHours - h) * 60);
    return `${h}h ${m}m`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Clock & Action Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
          <div className="space-y-1">
            <p className="text-slate-500 font-medium">{currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h1 className="text-6xl font-black text-slate-800 tracking-tight">{currentTime.toLocaleTimeString()}</h1>
          </div>

          <div className="flex flex-col items-center">
            <button
              onClick={handleCheckInOut}
              disabled={isProcessing}
              className={`w-44 h-44 rounded-full border-8 transition-all flex flex-col items-center justify-center space-y-1 shadow-lg active:scale-95 disabled:opacity-50 ${
                currentSession 
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' 
                : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <span className="text-2xl font-black uppercase tracking-widest">
                {isProcessing ? 'Wait...' : (currentSession ? 'Check Out' : 'Check In')}
              </span>
              <span className="text-[10px] font-bold opacity-60">Session Control</span>
            </button>
            
            {currentSession && (
              <div className="mt-6 flex items-center space-x-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-sm">Active since {formatTime(currentSession.checkIn)}</span>
              </div>
            )}

            {locationError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-left max-w-sm">
                <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <p className="text-xs font-bold text-red-600 leading-relaxed">{locationError}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">Work Statistics</p>
            <div className="space-y-6">
              <div>
                <p className="text-slate-500 text-xs font-bold mb-1">THIS WEEK</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-slate-800">{formatDayDuration(getWeeklyHours())}</span>
                </div>
              </div>
              <div className="h-px bg-slate-100"></div>
              <div>
                <p className="text-slate-500 text-xs font-bold mb-1">THIS MONTH</p>
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-black text-blue-600">{formatDayDuration(getMonthlyHours())}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-sm font-bold mb-3 flex items-center uppercase tracking-wider text-blue-400">
               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
               AI Performance
            </h3>
            {!analysis && !loadingAnalysis && (
              <button onClick={getAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-sm font-bold transition">
                Analyze My Productivity
              </button>
            )}
            {loadingAnalysis && <p className="text-xs text-slate-400 animate-pulse">Processing work patterns...</p>}
            {analysis && (
              <div className="space-y-3">
                <p className="text-xs font-medium leading-relaxed italic text-slate-300">"{analysis.insight}"</p>
                <div className="h-px bg-white/10"></div>
                <p className="text-[10px] text-blue-300 font-bold">{analysis.summary}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
            Work Calendar
          </h2>
          <WorkCalendar logs={myLogs} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            Session History
          </h2>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              {myLogs.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-slate-400 font-medium">No work records found yet.</p>
                </div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Check In</th>
                      <th className="px-6 py-4">Check Out</th>
                      <th className="px-6 py-4 text-right">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {myLogs.slice().reverse().map(log => (
                      <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {new Date(log.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-slate-500">{formatTime(log.checkIn)}</td>
                        <td className="px-6 py-4 text-slate-500">
                          {log.checkOut ? formatTime(log.checkOut) : <span className="text-green-600 font-black animate-pulse">ON DUTY</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={`font-black ${log.checkOut ? 'text-blue-600' : 'text-slate-300 italic'}`}>
                            {log.checkOut 
                              ? formatDuration(log.checkIn, log.checkOut)
                              : '--'
                            }
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
