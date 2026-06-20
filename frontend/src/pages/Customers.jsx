import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Phone,
  Settings2,
  X,
  MessageCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export const Customers = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', service: '', expiry_date: '' });

  const handleWhatsApp = (customer) => {
    const message = `Hello ${customer.name}, we are contacting you regarding your ${customer.service} service.`;
    const phone = customer.phone.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get('/customers/');
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch Customers Error:', err);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, formData);
        toast.success('Customer updated');
      } else {
        await api.post('/customers/', formData);
        toast.success('Customer added');
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      setFormData({ name: '', phone: '', service: '', expiry_date: '' });
      fetchCustomers();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/customers/${id}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-400">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {isAdmin ? 'Global Client Directory' : 'Customers'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total: {customers.length} clients registered</p>
        </div>
        {!isAdmin && (
          <button 
            onClick={() => { setIsModalOpen(true); setEditingCustomer(null); setFormData({ name: '', phone: '', service: '', expiry_date: '' }); }}
            className="btn btn-primary h-9 px-4 font-medium"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>New Customer</span>
          </button>
        )}
      </div>

      <div className="card">
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full max-w-xs transition-all">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input type="text" placeholder="Search..." className="input pl-9 h-9 text-xs" />
          </div>
          <button className="btn btn-secondary h-9 w-9 p-0"><Settings2 className="w-3.5 h-3.5" /></button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-5 py-3">{isAdmin ? 'Company Name' : 'Customer'}</th>
                <th className="px-5 py-3">{isAdmin ? 'Email Address' : 'Phone'}</th>
                <th className="px-5 py-3">{isAdmin ? 'Account Type' : 'Service'}</th>
                {!isAdmin && <th className="px-5 py-3">Expiry</th>}
                {!isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-600 dark:text-slate-300">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : customers.length > 0 ? (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-all">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white truncate max-w-[150px]">{c.name}</td>
                    <td className="px-5 py-3 italic text-[10px] leading-tight text-slate-500">{isAdmin ? c.email : c.phone}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                        isAdmin ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      }`}>
                        {isAdmin ? 'Business Owner' : c.service}
                      </span>
                    </td>
                    {!isAdmin && <td className="px-5 py-3 font-medium text-[10px]">{new Date(c.expiry_date).toLocaleDateString()}</td>}
                    {!isAdmin && (
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleWhatsApp(c)}
                            className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded text-emerald-600"
                            title="Send WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => { setEditingCustomer(c); setFormData({ name: c.name, phone: c.phone, service: c.service, expiry_date: c.expiry_date }); setIsModalOpen(true); }}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-400"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{editingCustomer ? 'Update Client' : 'New Client'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="label">Full Name</label>
                <input required type="text" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input required type="text" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="label">Service</label>
                <input required type="text" className="input" value={formData.service} onChange={(e) => setFormData({ ...formData, service: e.target.value })} />
              </div>
              <div>
                <label className="label">Expiry Date</label>
                <input required type="date" className="input" value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} />
              </div>
              <div className="pt-3 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1 font-medium">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1 font-medium">{editingCustomer ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
