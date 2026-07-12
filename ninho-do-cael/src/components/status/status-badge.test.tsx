import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "@/components/status/status-badge";
import {
  STATUS_CONFIG,
  getStatusVisual,
  type StatusDomain,
} from "@/components/status/status-config";
import {
  ACQUISITION_STATUSES,
  CRITICALITIES,
  DECISION_STATUSES,
  LOGISTICS_STATUSES,
  NEED_DECISION_STATUSES,
  PRIORITIES,
  READINESS_STATUSES,
  SYNC_STATUSES,
  TASK_STATUSES,
} from "@/types/domain";

const DOMAIN_VALUES = {
  decisaoNecessidade: NEED_DECISION_STATUSES,
  aquisicao: ACQUISITION_STATUSES,
  logistica: LOGISTICS_STATUSES,
  prontidao: READINESS_STATUSES,
  tarefa: TASK_STATUSES,
  decisao: DECISION_STATUSES,
  criticidade: CRITICALITIES,
  prioridade: PRIORITIES,
  sincronizacao: SYNC_STATUSES,
} as const;

describe("STATUS_CONFIG (mapeamento centralizado — SDD, seção 14)", () => {
  it("cobre exatamente todos os valores de cada domínio da seção 9", () => {
    for (const [domain, values] of Object.entries(DOMAIN_VALUES)) {
      const configured = Object.keys(
        STATUS_CONFIG[domain as keyof typeof STATUS_CONFIG],
      ).sort();
      expect(configured, `domínio ${domain}`).toEqual([...values].sort());
    }
  });

  it("todo status renderiza com rótulo pt-BR visível e ícone", () => {
    for (const domain of Object.keys(STATUS_CONFIG) as StatusDomain[]) {
      for (const value of Object.keys(STATUS_CONFIG[domain])) {
        const visual = getStatusVisual(
          domain,
          value as keyof (typeof STATUS_CONFIG)[typeof domain] & string,
        );
        expect(visual.label, `${domain}.${value}`).toMatch(/\S/);

        const { container, unmount } = render(
          <StatusBadge
            domain={domain}
            value={
              value as keyof (typeof STATUS_CONFIG)[typeof domain] & string
            }
          />,
        );
        expect(
          screen.getByText(visual.label),
          `${domain}.${value}`,
        ).toBeInTheDocument();
        expect(
          container.querySelector("svg"),
          `ícone de ${domain}.${value}`,
        ).not.toBeNull();
        unmount();
      }
    }
  });
});
