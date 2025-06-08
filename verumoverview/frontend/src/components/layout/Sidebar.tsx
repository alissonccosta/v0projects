import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../hooks/AuthContext';
import { logAction } from '../services/logger';
import {
  Home,
  FolderKanban,
  ListChecks,
  Users,
  Users2,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: JSX.Element;
  roles: string[];
}

const items: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home size={24} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/projetos', label: 'Projetos', icon: <FolderKanban size={24} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/atividades', label: 'Atividades', icon: <ListChecks size={24} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/pessoas', label: 'Pessoas', icon: <Users size={24} />, roles: ['admin','gerente'] },
  { path: '/times', label: 'Times', icon: <Users2 size={24} />, roles: ['admin','gerente','timeleader'] },
  { path: '/controle-acesso', label: 'Controle de Acesso', icon: <Shield size={24} />, roles: ['admin'] },
];

export default function Sidebar({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void; }) {
  const { user } = useContext(AuthContext);

  const allowed = (item: MenuItem) => {
    if (!user) return false;
    return item.roles.some(r => user.permissoes.includes(r));
  };

  const handleClick = (label: string) => {
    logAction('navigate', { label });
  };

  return (
    <aside
      className={`bg-secondary text-white ${open ? 'w-56' : 'w-14'} transition-all duration-200 flex flex-col overflow-hidden`}
      aria-label="Menu lateral"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-label="Alternar menu"
        className="p-2 focus:outline-none focus:ring-2 focus:ring-white"
      >
        {open ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>
      <nav className="flex-1">
        {items.filter(allowed).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => handleClick(item.label)}
            className={({ isActive }) =>
              `flex items-center gap-2 p-3 rounded-md transition-colors ${
                isActive ? 'bg-[#EAE0F5] text-secondary' : 'hover:bg-[#EAE0F5]'
              }`
            }
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
