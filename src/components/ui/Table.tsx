import { useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cx } from '../../lib/utils';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: ReactNode;
  className?: string;
}

export function Table<T>({ columns, rows, getRowId, onRowClick, emptyState, className }: TableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedRows = (() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column?.sortValue) return rows;
    const withValues = rows.map((row) => ({ row, value: column.sortValue!(row) }));
    withValues.sort((a, b) => {
      if (a.value < b.value) return sort.direction === 'asc' ? -1 : 1;
      if (a.value > b.value) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return withValues.map((w) => w.row);
  })();

  function toggleSort(column: TableColumn<T>) {
    if (!column.sortValue) return;
    setSort((prev) => {
      if (prev?.key !== column.key) return { key: column.key, direction: 'asc' };
      if (prev.direction === 'asc') return { key: column.key, direction: 'desc' };
      return null;
    });
  }

  if (rows.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={cx('overflow-x-auto', className)}>
      <table className="w-full min-w-full border-collapse text-body">
        <thead>
          <tr className="border-b border-surface-200">
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={cx(
                  'px-4 py-2.5 text-label text-ink-500',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  !column.align && 'text-left',
                )}
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => toggleSort(column)}
                    className="inline-flex items-center gap-1 hover:text-ink-700"
                  >
                    {column.header}
                    {sort?.key === column.key ? (
                      sort.direction === 'asc' ? (
                        <ArrowUp size={14} strokeWidth={1.75} />
                      ) : (
                        <ArrowDown size={14} strokeWidth={1.75} />
                      )
                    ) : (
                      <ChevronsUpDown size={14} strokeWidth={1.75} className="text-ink-300" />
                    )}
                  </button>
                ) : (
                  column.header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr
              key={getRowId(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cx(
                'border-b border-surface-100 last:border-0',
                onRowClick && 'cursor-pointer hover:bg-surface-50',
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cx(
                    'px-4 py-3 text-ink-700',
                    column.align === 'right' && 'text-right',
                    column.align === 'center' && 'text-center',
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
