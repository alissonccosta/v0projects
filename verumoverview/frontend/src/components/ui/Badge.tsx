interface BadgeProps {
  color:
    | 'verde'
    | 'amarelo'
    | 'vermelho'
    | 'alta'
    | 'media'
    | 'baixa'
    | 'positivo'
    | 'negativo'
    | 'neutro';
  text: string;
}

const map: Record<BadgeProps['color'], string> = {
  verde: 'bg-status-verde text-white',
  amarelo: 'bg-status-amarelo text-black',
  vermelho: 'bg-status-vermelho text-white',
  alta: 'bg-prioridade-alta text-white',
  media: 'bg-prioridade-media text-black',
  baixa: 'bg-prioridade-baixa text-white',
  positivo: 'bg-indicador-positivo text-white',
  negativo: 'bg-indicador-negativo text-white',
  neutro: 'bg-indicador-neutro text-white'
};

export default function Badge({ color, text }: BadgeProps) {
  return <span className={`px-2 py-1 rounded text-xs ${map[color]}`}>{text}</span>;
}
