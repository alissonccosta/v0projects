import { useContext } from 'react';
import { Sun, Moon, Bell, BarChart2, Briefcase, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';
import { ThemeContext } from '../hooks/ThemeContext';

const metrics = [
  { title: 'Receita Mensal', value: 'R$ 120k', icon: BarChart2, change: 12 },
  { title: 'Projetos Ativos', value: '8', icon: Briefcase, change: 4 },
  { title: 'Novos Clientes', value: '25', icon: Users, change: 18 },
];

const chartData = [
  { name: 'Jan', vendas: 40 },
  { name: 'Fev', vendas: 55 },
  { name: 'Mar', vendas: 65 },
  { name: 'Abr', vendas: 80 },
  { name: 'Mai', vendas: 75 },
  { name: 'Jun', vendas: 90 },
];

const projects = [
  { name: 'ERP Corporativo', lead: 'Ana Paula', status: 'Em andamento', date: '2024-02-12', avatar: 'https://i.pravatar.cc/40?img=1' },
  { name: 'Mobile Banking', lead: 'Bruno Silva', status: 'Concluído', date: '2024-03-05', avatar: 'https://i.pravatar.cc/40?img=2' },
  { name: 'Portal Cliente', lead: 'Carlos Lima', status: 'Em testes', date: '2024-04-18', avatar: 'https://i.pravatar.cc/40?img=3' },
];

export default function DashboardPremium() {
  const { darkMode, toggleDark } = useContext(ThemeContext);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Executivo</h1>
          <p className="text-gray-500">Visão geral das operações</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleDark}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label="Alternar tema"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full" />
          </button>
          <img src="https://i.pravatar.cc/40" alt="User" className="w-10 h-10 rounded-full" />
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((m) => (
          <div
            key={m.title}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex items-center space-x-4"
            style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)' }}
          >
            <m.icon size={48} className="text-[#6B46C1]" />
            <div className="flex-1">
              <p className="text-sm text-gray-500">{m.title}</p>
              <p className="text-3xl font-bold">{m.value}</p>
            </div>
            <span className="text-sm text-green-600">+{m.change}%</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Vendas</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4E008E" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6B46C1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8 }} />
              <Line type="monotone" dataKey="vendas" stroke="#6B46C1" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Projetos por Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={projects}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" className="text-sm" />
              <YAxis className="text-sm" />
              <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: 8 }} />
              <Bar dataKey="change" fill="#4E008E" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="bg-gradient-to-r from-[#4E008E] to-[#6B46C1] text-white rounded-t-xl px-6 py-3">
          Projetos Recentes
        </div>
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left">Projeto</th>
              <th className="px-6 py-3 text-left">Líder</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <td className="px-6 py-4 flex items-center space-x-2">
                  <img src={p.avatar} alt="avatar" className="w-6 h-6 rounded-full" />
                  <span>{p.name}</span>
                </td>
                <td className="px-6 py-4">{p.lead}</td>
                <td className="px-6 py-4">
                  <span
                    className="px-2 py-1 rounded-full text-white text-xs"
                    style={{ backgroundColor: p.status === 'Concluído' ? '#10B981' : p.status === 'Em andamento' ? '#F59E0B' : '#6B46C1' }}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4">{p.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
