import { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return <table className="min-w-full bg-white dark:bg-dark-background text-sm rounded shadow">{children}</table>;
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#EAE0F5] text-secondary">{children}</thead>;
}

export function Th({ children }: { children: ReactNode }) {
  return <th className="p-2 text-left">{children}</th>;
}

export function Td({ children }: { children: ReactNode }) {
  return <td className="p-2">{children}</td>;
}
