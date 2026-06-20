import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  History, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Download,
  Loader2,
  Table
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Reports = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    try {
      const { data } = await api.get('/logs/');
      setLogs(data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Activity logs and message history</p>
        </div>
        <button className="btn btn-secondary h-9 font-medium"><Download className="w-3.5 h-3.5 mr-1.5" /> Export</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: CheckCircle, label: 'Success', val: logs.filter(l => l.status === 'success').length, color: 'border-emerald-500', bg: 'emerald' },
          { icon: AlertCircle, label: 'Failed', val: logs.filter(l => l.status === 'failed').length, color: 'border-red-500', bg: 'red' },
          { icon: History, label: 'Rate', val: logs.length > 0 ? ((logs.filter(l => l.status === 'success').length / logs.length) * 100).toFixed(1) + '%' : '0%', color: 'border-primary-500', bg: 'primary' }
        ].map((stat, i) => (
          <div key={i} className={`card p-3 border-l-4 ${stat.color} flex items-center gap-3`}>
            <div className={`p-1.5 bg-${stat.bg}-50 dark:bg-${stat.bg}-900/10 text-${stat.bg}-600 dark:text-${stat.bg}-400 rounded`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/50">
          <div className="relative flex-1 max-w-xs transition-all focus-within:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search logs..." 
              className="input pl-9 h-9 text-xs font-medium" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchLogs} className="btn btn-secondary h-8 w-8 p-0"><Table className="w-3.5 h-3.5" /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Details</th>
                <th className="px-5 py-3 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan="3" className="px-5 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span className={`text-[10px] font-bold uppercase ${log.status === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>{log.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 truncate max-w-xs">{log.message}</p>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="3" className="px-5 py-8 text-center text-slate-400 font-medium">No activity logs.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
