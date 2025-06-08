import { useContext, useState } from 'react';
import { Outlet, NavLink, Navigate, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  UserCheck,
  Shield,
  Home,
  Menu,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronRight as Arrow
} from 'lucide-react';
import { AuthContext } from '../../hooks/AuthContext';
import { ThemeContext } from '../../hooks/ThemeContext';
import { logAction } from '../../services/logger';

const items = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/projetos', label: 'Projetos', icon: FolderOpen, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/atividades', label: 'Atividades', icon: CheckSquare, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/pessoas', label: 'Pessoas', icon: Users, roles: ['admin','gerente'] },
  { path: '/times', label: 'Times', icon: UserCheck, roles: ['admin','gerente','timeleader'] },
  { path: '/controle-acesso', label: 'Controle de Acesso', icon: Shield, roles: ['admin'] }
];

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  let path = '';
  return (
    <nav className="flex items-center text-sm text-gray-medium dark:text-gray-light">
      <Link to="/" className="flex items-center text-primary">
        <Home size={16} />
      </Link>
      {parts.map((p, idx) => {
        path += `/${p}`;
        return (
          <span key={idx} className="flex items-center">
            <Arrow size={14} className="mx-1 text-gray-border" />
            <Link to={path} className="capitalize hover:underline">
              {p}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

export default function MainLayout() {
  const { token, user, logout } = useContext(AuthContext);
  const { darkMode, toggleDark } = useContext(ThemeContext);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!token) return <Navigate to="/login" replace />;

  const allowed = (item) => user && item.roles.some(r => user.permissoes.includes(r));

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-white to-gray-light dark:from-dark-background dark:to-dark-card text-gray-900 dark:text-dark-text">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        className={`fixed z-30 inset-y-0 left-0 bg-white dark:bg-dark-card shadow-lg transition-all duration-300 flex flex-col ${collapsed ? 'w-[80px]' : 'w-[280px]'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="px-4 py-6 text-primary font-semibold text-xl">VerumOverview</div>
        <nav className="flex-1 overflow-y-auto mt-4 space-y-1">
          {items.filter(allowed).map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => { logAction('navigate', { label }); setMobileOpen(false); }}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2 rounded-md transition-colors duration-200 ${isActive ? 'bg-primaryLight border-l-4 border-primary text-primary' : 'hover:bg-gray-light'}`
              }
            >
              <Icon size={20} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="m-2 mt-auto flex items-center justify-center p-2 rounded hover:bg-gray-light transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? 80 : 280 }}
      >
        <header className="h-16 flex items-center justify-between px-6 bg-white/60 dark:bg-dark-background/60 backdrop-blur shadow-md">
          <div className="flex items-center gap-4">
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu />
            </button>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => { toggleDark(); logAction('toggle_dark'); }}
              className="p-2 rounded-full hover:bg-gray-light dark:hover:bg-dark-card transition-colors"
              aria-label="Alternar tema"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative group">
              <div className="w-8 h-8 rounded-full border-2 border-primary shadow cursor-pointer overflow-hidden flex items-center justify-center bg-primaryLight">
                <Users className="text-primary" size={20} />
              </div>
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-card border rounded shadow-md opacity-0 group-hover:opacity-100 transform scale-95 group-hover:scale-100 transition-all duration-200 origin-top">
                <Link to="/perfil" className="block px-4 py-2 text-sm hover:bg-gray-light dark:hover:bg-dark-background">Meu Perfil</Link>
                <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-light dark:hover:bg-dark-background">Sair</button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
