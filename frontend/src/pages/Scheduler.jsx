import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Plus, 
  Trash2, 
  X,
  Clock,
  Loader2,
  CalendarCheck,
  LayoutTemplate,
  Users,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Scheduler = () => {
  const [schedules, setSchedules] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    customer_id: '', 
    template_id: '', 
    send_date: '', 
    status: 'pending' 
  });

  const fetchData = async () => {
    try {
      const [{ data: scheds }, { data: custs }, { data: temps }] = await Promise.all([
        api.get('/schedules/'),
        api.get('/customers/'),
        api.get('/templates/')
      ]);
      setSchedules(Array.isArray(scheds) ? scheds : []);
      setCustomers(Array.isArray(custs) ? custs : []);
      setTemplates(Array.isArray(temps) ? temps : []);
    } catch (err) {
      console.error('Fetch Scheduler Data Error:', err);
      toast.error('Failed to load scheduler resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/schedules/', formData);
      toast.success('Schedule created');
      setIsModalOpen(false);
      setFormData({ customer_id: '', template_id: '', send_date: '', status: 'pending' });
      fetchData();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      toast.success('Schedule deleted');
      fetchData();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleWhatsApp = (schedule) => {
    const customer = customers.find(c => c.id === schedule.customer_id);
    const template = templates.find(t => t.id === schedule.template_id);
    
    if (!customer || !template) {
      toast.error('Customer or Template data missing');
      return;
    }

    let message = template.message_template
      .replace(/{{name}}/g, customer.name)
      .replace(/{{service}}/g, customer.service || '')
      .replace(/{{expiry_date}}/g, customer.expiry_date || '');

    const phone = String(customer.phone).replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const getCustomerName = (id) => customers.find(c => c.id === id)?.name || 'Unknown';
  const getTemplateText = (id) => templates.find(t => t.id === id)?.message_template || 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Scheduler</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Queue reminders for sending</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setFormData({ customer_id: '', template_id: '', send_date: '', status: 'pending' }); }}
          className="btn btn-primary h-9 font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Schedule
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase font-bold tracking-wider">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Template Preview</th>
                <th className="px-5 py-3">Scheduled Time</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></td></tr>
              ) : schedules.length > 0 ? (
                schedules.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-white truncate max-w-[120px]">{getCustomerName(s.customer_id)}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[150px] italic">{getTemplateText(s.template_id)}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[10px]">
                      {new Date(s.send_date).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        s.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' : 
                        s.status === 'sent' ? 'bg-emerald-100 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' : 
                        'bg-red-100 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/40'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleWhatsApp(s)}
                          className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded text-emerald-600"
                          title="Send via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-slate-400 text-xs font-medium">No schedules queued.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-xl p-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">New Schedule</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Customer</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Users className="w-3.5 h-3.5" /></span>
                  <select required className="input pl-9 h-9 font-medium" value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}>
                    <option value="">Choose...</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Template</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><LayoutTemplate className="w-3.5 h-3.5" /></span>
                  <select required className="input pl-9 h-9 font-medium" value={formData.template_id} onChange={(e) => setFormData({ ...formData, template_id: e.target.value })}>
                    <option value="">Choose...</option>
                    {templates.map(t => <option key={t.id} value={t.id}>{t.message_template.slice(0, 30)}...</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Send Date & Time</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><CalendarCheck className="w-3.5 h-3.5" /></span>
                  <input required type="datetime-local" className="input pl-9 h-9 font-medium" value={formData.send_date} onChange={(e) => setFormData({ ...formData, send_date: e.target.value })} />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1 font-medium">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1 font-medium shadow-primary-500/10 shadow-sm">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
