interface BadgeProps {
  variant: 'status' | 'prioridade' | 'indicador';
  value: string;
}

const styles = {
  status: {
    verde: 'bg-status-verde text-white',
    amarelo: 'bg-status-amarelo text-black',
    vermelho: 'bg-status-vermelho text-white'
  },
  prioridade: {
    Emergencial: 'bg-[#D63031] text-white',
    'Muito Alta': 'bg-[#E17055] text-white',
    Alta: 'bg-[#FDCB6E] text-black',
    Média: 'bg-[#00B894] text-white',
    Baixa: 'bg-[#0984E3] text-white'
  },
  indicador: {
    positivo: 'bg-indicador-positivo text-white',
    negativo: 'bg-indicador-negativo text-white',
    neutro: 'bg-indicador-neutro text-white'
  }
} as const;

type StatusColor = keyof typeof styles.status;

function getStatusColor(value: string): StatusColor {
  switch (value) {
    case 'Concluida':
    case 'Ativo':
    case 'Acompanhamento':
    case 'Handoff':
    case 'Sustentação':
      return 'verde';
    case 'Em Risco':
    case 'Bloqueada':
    case 'Desligado':
      return 'vermelho';
    default:
      return 'amarelo';
  }
}

export default function Badge({ variant, value }: BadgeProps) {
  let colorClass = '';
  if (variant === 'status') {
    colorClass = styles.status[getStatusColor(value)];
  } else if (variant === 'prioridade') {
    colorClass = styles.prioridade[value as keyof typeof styles.prioridade];
  } else {
    colorClass = styles.indicador[value as keyof typeof styles.indicador];
  }

  return <span className={`px-2 py-1 rounded text-xs ${colorClass}`}>{value}</span>;
}
