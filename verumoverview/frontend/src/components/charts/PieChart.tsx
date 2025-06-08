import { Pie } from 'react-chartjs-2';

const palette = [
  '#4E008E',
  '#00B894',
  '#FDCB6E',
  '#D63031',
  '#E17055',
  '#0984E3',
  '#00CEC9',
  '#636E72'
];

interface Props {
  labels: string[];
  values: number[];
}

export default function PieChart({ labels, values }: Props) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: palette.slice(0, values.length)
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } }
  } as const;

  return <Pie data={data} options={options} />;
}
