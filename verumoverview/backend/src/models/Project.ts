export interface Project {
  id_projeto?: string;
  nome: string;
  codigo_projeto?: string;
  objetivo?: string;
  justificativa?: string;
  stakeholders?: any;
  status?: string;
  data_inicio_prevista?: string;
  data_fim_prevista?: string;
  data_inicio_real?: string;
  data_fim_real?: string;
  prioridade?: string;
  criticidade?: string;
  orcamento_planejado?: number;
  orcamento_realizado?: number;
  kpis?: any;
  time_responsavel?: any;
  anexos?: any;
  links?: any;
  historico_atualizacoes?: any;
  comentarios?: any;
  percentual_concluido?: number;
}
