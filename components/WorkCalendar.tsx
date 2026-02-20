
import React from 'react';
import { WorkLog } from '../types';

interface WorkCalendarProps {
  logs: WorkLog[];
  month?: Date;
}

export const WorkCalendar: React.FC<WorkCalendarProps> = ({ logs, month = new Date() }) => {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  const daysInMonth = endOfMonth.getDate();
  const startDay = startOfMonth.getDay();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: startDay }, () => null);

  const getLogsForDay = (day: number) => {
    return logs.filter(log => {
      const logDate = new Date(log.checkIn);
      return logDate.getDate() === day && 
             logDate.getMonth() === month.getMonth() && 
             logDate.getFullYear() === month.getFullYear();
    });
  };

  const calculateTotalHours = (dayLogs: WorkLog[]) => {
    return dayLogs.reduce((acc, log) => {
      if (log.checkIn && log.checkOut) {
        return acc + (new Date(log.checkOut).getTime() - new Date(log.checkIn).getTime()) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
        <h3 className="font-bold text-slate-800">
          {month.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h3>
      </div>
      <div className="grid grid-cols-7 text-center border-b border-slate-100 bg-slate-50/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {[...padding, ...days].map((day, i) => {
          if (day === null) return <div key={`pad-${i}`} className="h-20 border-r border-b border-slate-50 bg-slate-50/30"></div>;
          
          const dayLogs = getLogsForDay(day);
          const hours = calculateTotalHours(dayLogs);
          const isToday = new Date().getDate() === day && new Date().getMonth() === month.getMonth();

          return (
            <div key={day} className={`h-20 border-r border-b border-slate-100 p-1 relative hover:bg-slate-50 transition-colors ${isToday ? 'bg-blue-50/30' : ''}`}>
              <span className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{day}</span>
              {hours > 0 && (
                <div className="mt-1 flex flex-col space-y-1">
                  <div className="bg-blue-600 h-1.5 w-full rounded-full opacity-20"></div>
                  <span className="text-[10px] font-black text-blue-700 block text-center">
                    {hours.toFixed(1)}h
                  </span>
                </div>
              )}
              {dayLogs.some(l => !l.checkOut) && (
                <div className="absolute bottom-1 right-1">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
