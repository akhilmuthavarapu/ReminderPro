import React from 'react';
import { Check, Zap, CreditCard, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PricingCard = ({ title, price, features, recommended, current }) => (
  <div className={`card p-5 relative overflow-hidden flex flex-col transition-all duration-300 group hover:shadow-md cursor-pointer ${recommended ? 'border-primary-500 ring-1 ring-primary-500 shadow-lg' : ''}`} onClick={() => !current && toast.success(`Selected Plan: ${title}`)}>
    {recommended && (
      <div className="absolute top-0 right-0 py-1 px-3 bg-primary-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-bl-md">
        Recommended
      </div>
    )}
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1.5 capitalize">{title}</h3>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-900 dark:text-white">${price}</span>
        <span className="text-xs text-slate-500 dark:text-slate-400">/year</span>
      </div>
    </div>
    <ul className="space-y-2 mb-6 flex-1">
      {features.map((feat, i) => (
        <li key={i} className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-tight">
          <Check className="w-3 h-3 text-emerald-500" />
          {feat}
        </li>
      ))}
    </ul>
    <button 
      onClick={(e) => { e.stopPropagation(); !current && toast.success('Redirecting to checkout...'); }}
      className={`btn transition-all text-[11px] font-bold h-9 ${current ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border-none' : (recommended ? 'btn-primary shadow-lg shadow-primary-500/20' : 'btn-secondary')}`}
      disabled={current}
    >
      {current ? 'Active Now' : 'Upgrade Plan'}
    </button>
  </div>
);

export const Subscription = () => {
  const { user } = useAuth();

  const plans = [
    {
      title: 'Basic Yearly',
      price: '1000',
      features: ['Up to 100 Customers', '2 Active Templates', 'Basic Analytics', 'Email Support'],
      current: true
    },
    {
      title: 'Professional Expansion',
      price: '2000',
      features: ['Up to 500 Customers', 'Unlimited Templates', 'Priority Worker Polling', 'Phone Support'],
      recommended: true
    },
    {
      title: 'Corporate Suite',
      price: '3000',
      features: ['Unlimited Scale', 'Custom Templates', 'Dedicated Server Resource', 'SLA Guarantee']
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Billing & Subscription
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Choose your annual growth plan</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-md shadow-sm ring-1 ring-slate-100 dark:ring-slate-800/10">
          <CreditCard className="w-5 h-5 text-emerald-600" />
          <div className="text-[10px]">
            <p className="font-bold text-slate-900 dark:text-white uppercase leading-none mb-0.5">Billing Status</p>
            <p className="text-slate-500 font-bold">Standard Account</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {plans.map((p, i) => (
          <PricingCard key={i} {...p} />
        ))}
      </div>

      <div className="card p-5 border-dashed border-2 flex items-center justify-between gap-6 bg-slate-50/50 dark:bg-slate-800/20">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-white dark:bg-slate-800 text-blue-600 rounded-md border border-slate-200 dark:border-slate-700 shadow-sm">
             <Shield className="w-5 h-5 text-primary-500" />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">Advanced Corporate Invoicing</p>
              <p className="text-[10px] text-slate-500 font-medium">Contact our finance team for monthly invoicing or volume licensing.</p>
           </div>
        </div>
        <button className="btn btn-secondary h-9 text-[11px] font-bold px-5">Contact Sales</button>
      </div>
    </div>
  );
};
