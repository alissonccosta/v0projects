import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/** Gráfico com título e resumo textual obrigatório (SDD, seção 31). */
export function ChartCard({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {children}
        <p className="text-xs text-text-secondary">{summary}</p>
      </CardContent>
    </Card>
  );
}
