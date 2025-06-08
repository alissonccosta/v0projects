import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import {
  FolderOpen,
  CheckCircle,
  Users,
  Gauge,
  RefreshCw,
  Bell
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import { Table, THead, Th, Td } from '../components/ui/Table';

interface MetricData {
  totalProjects: number;
  projectChange: number;
  completedPercent: number;
  activePeople: number;
  performance: number;
}

interface ActivityRow {
  project: string;
  person: string;
  status: string;
  date: string;
}

interface Notification {
  text: string;
  priority: 'high' | 'medium' | 'low';
}

const avatarUrls = [
  'https://i.pravatar.cc/40?img=1',
  'https://i.pravatar.cc/40?img=2',
  'https://i.pravatar.cc/40?img=3',
  'https://i.pravatar.cc/40?img=4',
  'https://i.pravatar.cc/40?img=5'
];

const activities: ActivityRow[] = [
  { project: 'Sistema Phoenix', person: 'Ana Silva', status: 'Concluída', date: '2024-04-28' },
  { project: 'Portal Orion', person: 'Bruno Oliveira', status: 'Em Andamento', date: '2024-04-28' },
  { project: 'Plataforma Atlas', person: 'Carla Souza', status: 'Concluída', date: '2024-04-27' },
  { project: 'Iniciativa Apolo', person: 'Diego Lima', status: 'Em Risco', date: '2024-04-26' },
  { project: 'Projeto Vega', person: 'Eduarda Martins', status: 'Concluída', date: '2024-04-26' },
  { project: 'Suite Hermes', person: 'Fábio Gonçalves', status: 'Em Andamento', date: '2024-04-25' },
  { project: 'Dashboard Helius', person: 'Gabriela Alves', status: 'Concluída', date: '2024-04-24' },
  { project: 'API Cronos', person: 'Henrique Costa', status: 'Concluída', date: '2024-04-24' },
  { project: 'App Pegasus', person: 'Isabela Ribeiro', status: 'Em Risco', date: '2024-04-23' },
  { project: 'Sistema Phoenix', person: 'João Pereira', status: 'Concluída', date: '2024-04-22' }
];

const notifications: Notification[] = [
  { text: 'Prazo do Projeto Vega termina em 3 dias', priority: 'high' },
  { text: 'Reunião geral agendada para sexta-feira', priority: 'medium' },
  { text: 'Atualização de segurança disponível', priority: 'low' }
];

const lineData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  value: 60 + Math.round(Math.random() * 20)
}));

const barData = [
  { name: 'Ana', value: 12 },
  { name: 'Bruno', value: 10 },
  { name: 'Carla', value: 8 },
  { name: 'Diego', value: 7 },
  { name: 'Eduarda', value: 7 },
  { name: 'Fábio', value: 6 },
  { name: 'Gabriela', value: 5 },
  { name: 'Henrique', value: 5 },
  { name: 'Isabela', value: 4 },
  { name: 'João', value: 3 }
];

export default function Dashboard() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [metrics] = useState<MetricData>({
    totalProjects: 12,
    projectChange: 8,
    completedPercent: 72,
    activePeople: 9,
    performance: 84
  });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  function refresh() {
    setLoading(true);
    setTimeout(() => {
      setLastUpdate(new Date());
      setLoading(false);
    }, 800);
  }

  const spark = lineData.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* HEADER EXECUTIVO */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-semibold text-secondary">Visão Geral Executiva</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex gap-1 bg-gray-light rounded p-1">
            {['7d','30d','90d','1y'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p as any)}
                className={`px-2 py-1 rounded text-sm transition-colors ${period===p ? 'bg-primary text-white' : 'hover:bg-primaryLight'}`}
              >
                {p}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-medium">Última atualização: {lastUpdate.toLocaleDateString()} {lastUpdate.toLocaleTimeString()}</span>
          <Button onClick={refresh} className="flex items-center gap-1">
            <RefreshCw size={16} /> Atualizar Dados
          </Button>
        </div>
      </header>

      {/* CARDS DE MÉTRICAS */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between">
                <FolderOpen className="text-secondary" />
                <span className={`text-sm ${metrics.projectChange >= 0 ? 'text-indicators-positive' : 'text-indicators-negative'}`}>{metrics.projectChange}%</span>
              </div>
              <div className="flex-1 flex items-center justify-center text-4xl font-semibold">
                {metrics.totalProjects}
              </div>
              <div className="h-8 -mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={spark}>
                    <Line type="monotone" dataKey="value" stroke="#4E008E" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </Card>

        <Card>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 gap-2">
              <CheckCircle className="text-green-600" />
              <CircularProgress value={metrics.completedPercent} />
              <span className="text-sm">{metrics.completedPercent}% concluído</span>
            </div>
          )}
        </Card>

        <Card>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <Users className="text-blue-600 mb-2" />
              <AvatarStack urls={avatarUrls} />
              <span className="text-sm mt-2">{metrics.activePeople} ativos hoje</span>
            </div>
          )}
        </Card>

        <Card>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4">
              <Gauge value={metrics.performance} className="text-secondary" />
              <span className="text-sm mt-2">Performance {metrics.performance}%</span>
            </div>
          )}
        </Card>
      </div>

      {/* GRÁFICOS */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Progresso dos Projetos">
          {loading ? (
            <Skeleton className="h-72" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ReTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#4E008E" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
        <Card title="Atividades por Pessoa">
          {loading ? (
            <Skeleton className="h-72" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <ReTooltip />
                <Bar dataKey="value">
                  {barData.map((_, i) => (
                    <Cell key={i} fill="#4E008E" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* TABELA DE ATIVIDADES RECENTES E SIDEBAR */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Atividades Recentes">
          {loading ? (
            <Skeleton className="h-80" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>Projeto</Th>
                  <Th>Pessoa</Th>
                  <Th>Status</Th>
                  <Th>Data</Th>
                </tr>
              </THead>
              <tbody>
                {activities.map((a, i) => (
                  <tr key={i} className="border-t">
                    <Td>{a.project}</Td>
                    <Td className="flex items-center gap-2">
                      <img src={`https://i.pravatar.cc/24?img=${i+1}`} className="w-6 h-6 rounded-full" />
                      {a.person}
                    </Td>
                    <Td>
                      <Badge variant={a.status === 'Concluída' ? 'success' : a.status === 'Em Risco' ? 'error' : 'warning'}>
                        {a.status}
                      </Badge>
                    </Td>
                    <Td>{a.date}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          {!loading && (
            <div className="text-right mt-2">
              <a href="#" className="text-secondary hover:underline">Ver todas as atividades</a>
            </div>
          )}
        </Card>
        <Card title="Alertas Importantes">
          {loading ? (
            <Skeleton className="h-80" />
          ) : (
            <ul className="space-y-2 p-2">
              {notifications.map((n, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Bell size={16} />
                  <Badge variant={n.priority === 'high' ? 'error' : n.priority === 'medium' ? 'warning' : 'default'}>
                    {n.text}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {!loading && (
            <div className="text-right mt-2">
              <a href="#" className="text-secondary hover:underline">Central de Notificações</a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg className="w-16 h-16" viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="#e5e7eb"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="40"
        cy="40"
        r={radius}
        stroke="#00B894"
        strokeWidth="8"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-700"
      />
    </svg>
  );
}

function AvatarStack({ urls }: { urls: string[] }) {
  return (
    <div className="flex -space-x-2">
      {urls.map((u, i) => (
        <img
          key={i}
          src={u}
          className="w-8 h-8 rounded-full border-2 border-white"
          style={{ zIndex: urls.length - i }}
        />
      ))}
    </div>
  );
}

