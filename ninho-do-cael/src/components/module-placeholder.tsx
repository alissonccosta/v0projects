import { EmptyState } from "@/components/empty-state";
import { MODULES, type ModuleKey } from "@/lib/navigation";

type ModulePlaceholderProps = {
  moduleKey: ModuleKey;
};

/**
 * Estado honesto dos módulos ainda não implementados: explica o que o módulo
 * fará e em qual fase chega. Sem controles falsos (SDD, seção 0.2).
 */
export function ModulePlaceholder({ moduleKey }: ModulePlaceholderProps) {
  const moduleInfo = MODULES[moduleKey];
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-forest-900">
          {moduleInfo.label}
        </h1>
      </header>
      <EmptyState
        icon={moduleInfo.icon}
        title="Módulo em preparação"
        description={`${moduleInfo.description} Chega na ${moduleInfo.plannedPhase}. Nesta fase, a navegação e o design system já são definitivos.`}
      />
    </div>
  );
}
