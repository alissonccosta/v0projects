import Card from '../components/ui/Card';
import BarChart from '../components/modules/charts/BarChart';
import PieChart from '../components/modules/charts/PieChart';
import RadarChart from '../components/modules/charts/RadarChart';

export default function Dashboard() {
  const barLabels = ['Jan', 'Fev', 'Mar', 'Abr'];
  const barValues = [12, 19, 3, 5];

  const pieLabels = ['Concluídas', 'Em Andamento', 'Em Risco'];
  const pieValues = [10, 5, 2];

  const radarLabels = ['Planejamento', 'Execução', 'Qualidade', 'Entrega', 'Satisfação'];
  const radarValues = [4, 3, 5, 2, 4];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card title="Progresso Mensal">
        <BarChart labels={barLabels} values={barValues} />
      </Card>
      <Card title="Status de Atividades">
        <PieChart labels={pieLabels} values={pieValues} />
      </Card>
      <Card title="Indicadores de Qualidade">
        <RadarChart labels={radarLabels} values={radarValues} />
      </Card>
    </div>
  );
}
