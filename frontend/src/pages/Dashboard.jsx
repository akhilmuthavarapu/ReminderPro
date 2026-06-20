import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Users, 
  LayoutTemplate, 
  CalendarCheck, 
  Send, 
  TrendingUp,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="card p-4 flex items-start justify-between">
    <div>
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <h4 className="text-2xl font-semibold text-slate-900 dark:text-white leading-none mb-1">{value}</h4>
      {trend && (
        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit">
          <TrendingUp className="w-2.5 h-2.5" />
          <span>{trend}% incr</span>
        </div>
      )}
    </div>
    <div className={`p-2 rounded-lg ${color} shadow-sm flex-shrink-0`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  </div>
);

export const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState(null);
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, schedulesRes] = await Promise.all([
          api.get('/analytics'),
          api.get('/schedules/')
        ]);
        setStats(statsRes.data || {});
        const schedulesArr = Array.isArray(schedulesRes.data) ? schedulesRes.data : [];
        setRecentSchedules(schedulesArr.slice(0, 5));
      } catch (err) {
        console.error('Fetch Dashboard Error:', err);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Clock className="w-8 h-8 animate-spin text-primary-500" /></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <StatCard 
              title="Business Accounts" 
              value={stats?.total_business_customers || 0} 
              icon={Users} 
              color="bg-primary-500"
              trend={10}
            />
            <StatCard 
              title="System Revenue" 
              value={`$${stats?.total_revenue?.toLocaleString() || 0}`} 
              icon={Zap} 
              color="bg-amber-500"
              trend={15}
            />
            <StatCard 
              title="All Clients" 
              value={stats?.total_customers || 0} 
              icon={TrendingUp} 
              color="bg-blue-500"
            />
            <StatCard 
              title="Total Templates" 
              value={stats?.total_templates || 0} 
              icon={LayoutTemplate} 
              color="bg-purple-500"
            />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Customers" 
              value={stats?.total_customers || 0} 
              icon={Users} 
              color="bg-blue-500"
              trend={12}
            />
            <StatCard 
              title="Templates" 
              value={stats?.total_templates || 0} 
              icon={LayoutTemplate} 
              color="bg-purple-500"
            />
            <StatCard 
              title="Pending" 
              value={stats?.pending_schedules || 0} 
              icon={Clock} 
              color="bg-amber-500"
            />
            <StatCard 
              title="Successfully Sent" 
              value={stats?.sent_schedules || 0} 
              icon={Send} 
              color="bg-emerald-500"
              trend={8}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Upcoming Reminders</h3>
            <button className="text-xs font-medium text-primary-600 hover:text-primary-500 flex items-center gap-1">
              View all <ExternalLink className="w-3 h-3" />
            </button>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Customer ID</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Send Date</th>
                    <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentSchedules.length > 0 ? (
                    recentSchedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-slate-900 dark:text-white">
                          #{schedule.customer_id.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(schedule.send_date).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                            schedule.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 
                            schedule.status === 'sent' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {schedule.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                        No upcoming reminders
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!isAdmin && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Add Customer', sub: 'Register new client', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' },
                { icon: LayoutTemplate, label: 'Create Template', sub: 'Design message', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600' },
                { icon: CalendarCheck, label: 'Schedule Now', sub: 'Queue messages', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' }
              ].map((action, i) => (
                <div key={i} className="card p-3 hover:border-primary-500/50 cursor-pointer group transition-all flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${action.color} group-hover:scale-105 transition-transform`}>
                    <action.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{action.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{action.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
