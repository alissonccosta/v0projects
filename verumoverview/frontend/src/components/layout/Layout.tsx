import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import { AuthContext } from '../../hooks/AuthContext';
import { logAction } from '../../services/logger';

export default function Layout() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    logAction('navigate', { path: location.pathname });
  }, [location.pathname]);

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-dark-background text-gray-900 dark:text-dark-text">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
