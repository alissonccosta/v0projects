import Card from '../components/ui/Card';

export default function Dashboard() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card title="Dashboard">
        <p className="text-sm text-gray-600 dark:text-gray-300">Bem-vindo ao VerumOverview.</p>
      </Card>
    </div>
  );
}
