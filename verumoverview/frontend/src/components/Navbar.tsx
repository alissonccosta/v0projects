import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { logAction } from '../services/logger';
import { Sun, Moon, Bell, UserCircle } from 'lucide-react';

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

export default function Navbar() {
  const { darkMode, toggleDark } = useContext(ThemeContext);
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logAction('logout');
    logout();
  };

  return (
    <header className="flex items-center justify-between bg-white dark:bg-dark-background p-2 shadow">
      <div className="flex items-center gap-4">
        <span className="font-bold text-secondary">VerumOverview</span>
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => { toggleDark(); logAction('toggle_dark'); }}>
          {darkMode ? <Sun /> : <Moon />}
        </button>
        <Bell className="opacity-50" />
        <div className="relative group">
          <UserCircle />
          <div className="absolute right-0 mt-2 hidden group-hover:block bg-white dark:bg-gray-800 border rounded shadow">
            <button onClick={handleLogout} className="block px-4 py-2 text-sm">Sair</button>
          </div>
        </div>
      </div>
    </header>
  );
}
