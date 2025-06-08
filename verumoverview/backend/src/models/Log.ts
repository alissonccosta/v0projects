export interface Log {
  id: number;
  usuario_id?: number;
  acao: string;
  detalhes: any;
  criado_em: Date;
}
