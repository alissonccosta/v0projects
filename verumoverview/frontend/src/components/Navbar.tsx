import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { logAction } from '../services/logger';
import { Sun, Moon, Bell, UserCircle, Menu } from 'lucide-react';

function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  let path = '';
  return (
    <nav className="text-sm">
      <ol className="flex gap-2">
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        {parts.map((p, idx) => {
          path += `/${p}`;
          return (
            <li key={idx} className="before:content-['/'] before:mr-2">
              <Link to={path}>{p}</Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { darkMode, toggleDark } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logAction('logout');
    logout();
  };

  return (
    <header className="flex items-center justify-between bg-primary dark:bg-dark-background px-4 h-14 shadow">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          aria-label="Menu"
          className="md:hidden p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded"
        >
          <Menu size={24} />
        </button>
        <span className="font-bold text-secondary">VerumOverview</span>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            toggleDark();
            logAction('toggle_dark');
          }}
          aria-label="Alternar tema"
          className="p-2 text-secondary focus:outline-none focus:ring-2 focus:ring-secondary rounded"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <Bell aria-hidden="true" className="opacity-50" />
        <div className="relative group">
          <div className="rounded-full border-2 border-secondary p-0.5 cursor-pointer">
            <UserCircle aria-hidden="true" className="text-secondary" />
          </div>
          <div className="absolute right-0 mt-2 hidden group-hover:block bg-white dark:bg-gray-800 border rounded shadow">
            <Link to="/perfil" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Meu Perfil</Link>
            <span className="block px-4 py-2 text-sm text-gray-400">Configurações Futuras</span>
            <button onClick={handleLogout} className="block px-4 py-2 text-sm w-full text-left hover:bg-gray-100 dark:hover:bg-gray-700">Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}
