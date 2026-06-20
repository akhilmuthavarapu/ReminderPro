import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  LayoutTemplate, 
  Calendar, 
  History, 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    title={collapsed ? label : ''}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group ${
        isActive
          ? 'bg-primary-50 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`
    }
  >
    <Icon className="w-5 h-5 flex-shrink-0" />
    {!collapsed && <span className="text-xs truncate">{label}</span>}
  </NavLink>
);

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout } = useAuth();

  const isAdmin = user?.role === 'admin';
  const isOwner = user?.role === 'owner';

  const menuItems = [
    { to: '/', icon: Home, label: 'Overview' },
    { to: '/customers', icon: Users, label: isAdmin ? 'All Clients' : 'Customers' },
  ];
  
  if (isOwner) {
    menuItems.push(
      { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
      { to: '/scheduler', icon: Calendar, label: 'Scheduler' },
      { to: '/reports', icon: History, label: 'Reports' },
      { to: '/billing', icon: Zap, label: 'Subscription' }
    );
  }

  if (isAdmin) {
    menuItems.push({ to: '/admin', icon: ShieldCheck, label: 'Admin Panel' });
  }

  return (
    <aside className={`fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-40 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-bold text-lg overflow-hidden whitespace-nowrap">
          <Bell className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>AutoRemind</span>}
        </div>
        {!collapsed && (
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="w-6 h-6 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md flex items-center justify-center text-slate-400"
          >
             <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {collapsed && (
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="mx-auto my-4 w-10 h-10 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-md flex items-center justify-center"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      <nav className="flex-1 px-2 space-y-1 overflow-y-auto mt-4">
        {menuItems.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/40">
        {!collapsed && (
          <div className="mb-2 p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded bg-primary-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold uppercase">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-slate-900 dark:text-white truncate capitalize">
                  {user?.name}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {collapsed ? (
            <div className="flex flex-col gap-1 items-center py-2">
              <NavLink to="/settings" className="p-2 text-slate-500 hover:text-primary-600"><SettingsIcon className="w-5 h-5" /></NavLink>
              <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"><LogOut className="w-5 h-5" /></button>
            </div>
        ) : (
            <div className="flex items-center justify-between gap-1 px-1">
              <NavLink
                to="/settings"
                className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={logout}
                className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-[10px] font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-100 dark:hover:border-red-900/40 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
        )}
      </div>
    </aside>
  );
};
