export interface Activity {
  id_atividade?: string;
  id_projeto?: string;
  titulo: string;
  descricao?: string;
  responsavel?: number;
  time?: number;
  status?: string;
  data_meta?: string;
  data_limite?: string;
  /**
   * Valores em minutos para padronizar o armazenamento de durações
   */
  horas_estimadas?: number;
  horas_gastas?: number;
  prioridade?: string;
  dependencias?: any;
  anexos?: any;
  historico_atualizacoes?: any;
  comentarios?: any;
}
