import { useContext, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { logAction } from '../services/logger';
import {
  Home,
  FolderKanban,
  ListChecks,
  Users,
  Users2,
  Shield
} from 'lucide-react';

interface MenuItem {
  path: string;
  label: string;
  icon: JSX.Element;
  roles: string[];
}

const items: MenuItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home size={20} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/projetos', label: 'Projetos', icon: <FolderKanban size={20} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/atividades', label: 'Atividades', icon: <ListChecks size={20} />, roles: ['admin','gerente','timeleader','colaborador'] },
  { path: '/pessoas', label: 'Pessoas', icon: <Users size={20} />, roles: ['admin','gerente'] },
  { path: '/times', label: 'Times', icon: <Users2 size={20} />, roles: ['admin','gerente','timeleader'] },
  { path: '/controle-acesso', label: 'Controle de Acesso', icon: <Shield size={20} />, roles: ['admin'] },
];

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(true);

  const allowed = (item: MenuItem) => {
    if (!user) return false;
    return item.roles.some(r => user.permissoes.includes(r));
  };

  const handleClick = (label: string) => {
    logAction('navigate', { label });
  };

  return (
    <div className={`bg-secondary text-white ${open ? 'w-56' : 'w-14'} transition-width duration-200 flex flex-col`}>
      <button onClick={() => setOpen(!open)} className="p-2">
        {open ? '<' : '>'}
      </button>
      <nav className="flex-1">
        {items.filter(allowed).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => handleClick(item.label)}
            className={({ isActive }) =>
              `flex items-center gap-2 p-2 hover:bg-purple-700 ${isActive ? 'bg-purple-800' : ''}`
            }
          >
            {item.icon}
            {open && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
