import { ReactNode, useMemo, useState } from 'react';
import Input from './Input';

export interface Column<T> {
  key: keyof T | string;
  header: ReactNode;
  sortable?: boolean;
  filterType?: 'text' | 'select';
  render?: (row: T) => ReactNode;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowKey?: (row: T) => string | number;
  globalSearch?: boolean;
  rowsPerPage?: number;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  rowKey,
  globalSearch,
  rowsPerPage,
  className = '',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{ key: string; asc: boolean }>({ key: '', asc: true });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let items = [...data];
    if (globalSearch && search) {
      items = items.filter(it =>
        Object.values(it as any)
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase()),
      );
    }
    for (const key of Object.keys(filters)) {
      const value = filters[key];
      if (value) {
        items = items.filter(it =>
          String((it as any)[key] ?? '')
            .toLowerCase()
            .includes(value.toLowerCase()),
        );
      }
    }
    return items;
  }, [data, search, filters, globalSearch]);

  const sorted = useMemo(() => {
    const items = [...filtered];
    if (!sort.key) return items;
    items.sort((a, b) => {
      const va = (a as any)[sort.key] ?? '';
      const vb = (b as any)[sort.key] ?? '';
      if (va < vb) return sort.asc ? -1 : 1;
      if (va > vb) return sort.asc ? 1 : -1;
      return 0;
    });
    return items;
  }, [filtered, sort]);

  const paginated = useMemo(() => {
    if (!rowsPerPage) return sorted;
    const start = (page - 1) * rowsPerPage;
    return sorted.slice(start, start + rowsPerPage);
  }, [sorted, page, rowsPerPage]);

  function toggleSort(key: string) {
    setSort(prev => ({ key, asc: prev.key === key ? !prev.asc : true }));
  }

  const totalPages = rowsPerPage ? Math.ceil(sorted.length / rowsPerPage) : 1;

  function renderFilter(col: Column<T>) {
    if (!col.filterType) return null;
    const value = filters[String(col.key)] || '';
    if (col.filterType === 'select') {
      const options = Array.from(new Set(data.map(it => String((it as any)[col.key] ?? ''))));
      return (
        <select
          className="border p-1 rounded w-full focus:outline-none focus:ring-2 focus:ring-secondary"
          value={value}
          onChange={e => setFilters({ ...filters, [String(col.key)]: e.target.value })}
        >
          <option value="">Todos</option>
          {options.map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    }
    return (
      <Input
        className="p-1"
        value={value}
        onChange={e => setFilters({ ...filters, [String(col.key)]: e.target.value })}
      />
    );
  }

  return (
    <div className="space-y-2">
      {globalSearch && (
        <Input
          placeholder="Buscar..."
          className="max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      )}
      <table className={`min-w-full bg-white dark:bg-dark-background text-sm rounded shadow ${className}`}>
        <thead className="bg-[#EAE0F5] text-secondary">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                className={`p-2 text-left ${col.sortable ? 'cursor-pointer' : ''}`}
                onClick={() => col.sortable && toggleSort(String(col.key))}
              >
                <span className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && <span>{sort.key === col.key ? (sort.asc ? '▲' : '▼') : '↕'}</span>}
                </span>
              </th>
            ))}
          </tr>
          {columns.some(c => c.filterType) && (
            <tr>
              {columns.map(col => (
                <th key={String(col.key)} className="p-1">
                  {renderFilter(col)}
                </th>
              ))}
            </tr>
          )}
        </thead>
        <tbody>
          {paginated.map((row, i) => (
            <tr key={rowKey ? rowKey(row) : i} className="border-t">
              {columns.map(col => (
                <td key={String(col.key)} className="p-2">
                  {col.render ? col.render(row) : String((row as any)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rowsPerPage && totalPages > 1 && (
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">
            Anterior
          </button>
          <span className="px-2 py-1">
            {page}/{totalPages}
          </span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}

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

