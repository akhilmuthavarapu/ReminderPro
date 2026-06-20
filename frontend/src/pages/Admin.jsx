import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  ShieldCheck, 
  Trash2, 
  Mail, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (id === currentUser.id) {
      toast.error('Cannot delete own account');
      return;
    }
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-600" />
            Admin Panel
          </h2>
          <p className="text-xs text-slate-500 font-medium">Manage system access roles</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
           <AlertTriangle className="w-3 h-3" />
           {users.length} Active Users
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Access Details</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan="4" className="px-5 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex-shrink-0 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-tighter">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900 dark:text-white capitalize truncate max-w-[150px]">{u.name}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 overflow-hidden max-w-[180px]">
                        <Mail className="w-3 h-3 opacity-50 flex-shrink-0" />
                        <span className="truncate text-[10px]">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                       <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                          u.role === 'admin' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/40' : 
                          u.role === 'owner' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-900/40' : 
                          'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                       }`}>
                         {u.role}
                       </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {u.id !== currentUser.id && (
                        <button 
                          onClick={() => handleDelete(u.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="4" className="px-5 py-10 text-center text-slate-400">No users.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
