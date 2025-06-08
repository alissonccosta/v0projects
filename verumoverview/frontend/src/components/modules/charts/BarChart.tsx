import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
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

export default function BarChart({ labels, values }: Props) {
  const data = labels.map((label, i) => ({ label, value: values[i] }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReBarChart data={data}>
        <XAxis dataKey="label" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="value">
          {data.map((_, i) => (
            <Cell key={i} fill={palette[i % palette.length]} />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
