import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

interface Props {
  labels: string[];
  values: number[];
}

export default function RadarChart({ labels, values }: Props) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: 'rgba(78, 0, 142, 0.5)',
        borderColor: '#4E008E',
        pointBackgroundColor: '#4E008E'
      }
    ]
  };

  const options = {
    responsive: true,
    scales: { r: { beginAtZero: true } },
    plugins: { legend: { display: false } }
  } as const;

  return <Radar data={data} options={options} />;
}
