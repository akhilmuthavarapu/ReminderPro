import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Bell, Calendar, CheckCircle, Clock, Shield } from 'lucide-react';
import api from '../services/api';

export const CustomerPortal = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Note: This is a public route, so we'd need a backend endpoint that doesn't require Auth 
  // if we wanted it to be real. For this simulation, we'll assume it fetchable. 
  // For now, let's just make it a "status" page.

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <div className="inline-flex p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-4">
            <Bell className="w-6 h-6 text-primary-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Reminder Portal</h2>
          <p className="text-xs text-slate-500 font-medium">Auto Reminder System - Client Access</p>
        </div>

        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-900 dark:text-white">Active Subscription</span>
            </div>
            <span className="text-[10px] font-bold uppercase py-1 px-2 bg-slate-100 dark:bg-slate-800 rounded">ID: {id?.slice(0, 8)}</span>
          </div>

          <div className="py-4 border-y border-slate-100 dark:border-slate-800 space-y-4">
             <div className="flex justify-between items-center text-xs">
               <span className="text-slate-500 font-medium">Current Service</span>
               <span className="text-slate-900 dark:text-white font-bold">Standard Maintenance</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-slate-500 font-medium font-medium">Scheduled Expiry</span>
               <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                 <Calendar className="w-3 h-3 text-primary-500" />
                 <span>Dec 15, 2026</span>
               </div>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-slate-500 font-medium font-medium">Next Auto Reminder</span>
               <div className="flex items-center gap-1.5 text-amber-600 font-bold">
                 <Clock className="w-3 h-3" />
                 <span>Dec 01, 2026</span>
               </div>
             </div>
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-lg flex items-start gap-3 border border-primary-200 dark:border-primary-800">
             <Shield className="w-4 h-4 text-primary-600 mt-0.5" />
             <div className="text-[10px] text-primary-700 dark:text-primary-300">
                <p className="font-bold mb-1 uppercase tracking-tight">System Message</p>
                <p>Your service is being automatically monitored. You will receive an SMS reminder 2 weeks prior to expiration.</p>
             </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-400 font-medium">
          Protected by AutoRemind System &copy; 2026
        </p>
      </div>
    </div>
  );
};
