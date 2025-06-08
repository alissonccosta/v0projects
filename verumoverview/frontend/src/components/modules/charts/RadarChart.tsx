import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface Props {
  labels: string[];
  values: number[];
}

export default function RadarChart({ labels, values }: Props) {
  const data = labels.map((label, i) => ({ label, value: values[i] }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ReRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="label" />
        <Radar dataKey="value" fill="rgba(78, 0, 142, 0.5)" stroke="#4E008E" />
        <Tooltip />
      </ReRadarChart>
    </ResponsiveContainer>
  );
}
