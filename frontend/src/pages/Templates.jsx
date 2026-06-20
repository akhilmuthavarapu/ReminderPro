import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  LayoutTemplate, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Templates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({ message_template: '' });

  const fetchTemplates = async () => {
    try {
      const { data } = await api.get('/templates/');
      setTemplates(data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await api.put(`/templates/${editingTemplate.id}`, formData);
        toast.success('Template updated');
      } else {
        await api.post('/templates/', formData);
        toast.success('Template added');
      }
      setIsModalOpen(false);
      setEditingTemplate(null);
      setFormData({ message_template: '' });
      fetchTemplates();
    } catch (err) {
      toast.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/templates/${id}`);
      toast.success('Template deleted');
      fetchTemplates();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Message Templates</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Design automated reminder messages</p>
        </div>
        <button 
          onClick={() => { setIsModalOpen(true); setEditingTemplate(null); setFormData({ message_template: '' }); }}
          className="btn btn-primary h-9 font-medium"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary-500" /></div>
        ) : templates.length > 0 ? (
          templates.map((t) => (
            <div key={t.id} className="card group relative flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-1.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400">
                  <LayoutTemplate className="w-4 h-4" />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingTemplate(t); setFormData({ message_template: t.message_template }); setIsModalOpen(true); }}
                    className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 flex-1">
                <div className="bg-slate-100 dark:bg-slate-800/40 rounded p-3 border border-slate-200/50 dark:border-slate-700/50">
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-normal italic line-clamp-4">
                    "{t.message_template}"
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['name', 'service', 'expiry_date'].map(v => (
                    <span key={v} className="px-1.5 py-0.5 bg-slate-200/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-10 text-center text-slate-500 text-xs">No templates found.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-lg shadow-xl p-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{editingTemplate ? 'Edit Template' : 'New Template'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-primary-500 mt-0.5" />
                <div className="text-[10px] text-primary-700 dark:text-primary-300">
                  <p className="font-semibold mb-1 uppercase tracking-wider">Dynamic Variables</p>
                  <p>Use {'{{name}}'}, {'{{service}}'}, and {'{{expiry_date}}'} to personalize messages.</p>
                </div>
              </div>
              <div>
                <label className="label">Template Content</label>
                <textarea 
                  required 
                  className="input min-h-[100px] resize-none py-2 text-xs" 
                  placeholder="Hello {{name}}, your..." 
                  value={formData.message_template} 
                  onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary flex-1 font-medium">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1 font-medium">Save Template</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
