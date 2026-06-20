import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useLocation } from 'react-router-dom';

export const Layout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem('sidebar-collapsed') === 'true'
  );

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', collapsed);
  }, [collapsed]);

  const location = useLocation();
  const getTitle = () => {
    const path = location.pathname.substring(1);
    const segment = path.split('/')[0];
    if (!segment) return 'Dashboard';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`transition-all duration-300 ${collapsed ? 'pl-16' : 'pl-64'} min-h-screen flex flex-col`}>
        <Navbar title={getTitle()} />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
