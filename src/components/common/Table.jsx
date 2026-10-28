import React from 'react';
import { PackageOpen } from 'lucide-react';

export const Table = ({
  columns = [],
  data = [],
  keyExtractor = (item) => item.id,
  emptyMessage = 'No records found matching your criteria.',
  emptyAction,
  onRowClick,
  className = ''
}) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] uppercase tracking-wider font-semibold text-slate-500 select-none">
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                className={`py-3.5 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-12 px-4 text-center">
                <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                    <PackageOpen className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">{emptyMessage}</p>
                  {emptyAction && <div className="mt-4">{emptyAction}</div>}
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={keyExtractor(row, rowIndex)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-blue-50/40' : 'hover:bg-slate-50/70'
                }`}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.key || colIndex}
                    className={`py-3.5 px-4 text-slate-700 text-xs sm:text-sm ${
                      col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                    } ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
