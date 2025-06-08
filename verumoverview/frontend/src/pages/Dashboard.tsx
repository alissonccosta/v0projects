import Card from '../components/ui/Card';

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-secondary mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Dashboard">
          <p className="text-sm text-gray-600 dark:text-gray-300">Bem-vindo ao VerumOverview.</p>
        </Card>
      </div>
    </div>
  );
}
