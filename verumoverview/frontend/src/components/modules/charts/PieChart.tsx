import {
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

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
  const data = labels.map((label, i) => ({ name: label, value: values[i] }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RePieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Pie>
        <Tooltip />
      </RePieChart>
    </ResponsiveContainer>
  );
}
