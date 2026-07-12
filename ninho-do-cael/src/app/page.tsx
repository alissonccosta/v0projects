export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-xl rounded-[18px] border border-sand bg-surface p-8 sm:p-10">
        <p className="text-sm text-text-secondary">Fase 0 — Preparação</p>
        <h1 className="mt-2 text-3xl font-semibold text-forest-900">
          Ninho do Cael
        </h1>
        <p className="mt-4 leading-relaxed">
          Sistema de gestão do enxoval e da preparação para a chegada do Cael.
        </p>
        <p className="mt-3 leading-relaxed text-text-secondary">
          O projeto está em preparação: estrutura, qualidade de código e
          integração contínua já estão configuradas. As funcionalidades chegam
          nas próximas fases, começando pelo design system, banco de dados e
          autenticação.
        </p>
      </section>
    </main>
  );
}
