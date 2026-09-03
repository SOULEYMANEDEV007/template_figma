"use client";
// components/ui/data-table.tsx — Table de données réutilisable
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import React, { useState } from "react";

// ─── Types ────────────────────────────────────────────────
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (q: string) => void;
  toolbar?: React.ReactNode;
  className?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
}

// ─── Skeleton row ─────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
        </td>
      ))}
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────
export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  emptyMessage = "Aucun élément trouvé",
  emptyIcon,
  pageSize = 10,
  searchable,
  searchPlaceholder = "Rechercher...",
  onSearch,
  toolbar,
  className,
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const [searchQ, setSearchQ] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSearch = (q: string) => {
    setSearchQ(q);
    setPage(1);
    onSearch?.(q);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // Sort
  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const va = (a as any)[sortKey];
        const vb = (b as any)[sortKey];
        const cmp = String(va).localeCompare(String(vb), "fr");
        return sortDir === "asc" ? cmp : -cmp;
      })
    : data;

  const total = sorted.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pages);
  const paginated = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className={cn("section-card", className)}>
      {/* ── Toolbar ── */}
      {(searchable || toolbar) && (
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3">
          {searchable && (
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQ}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
              />
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2 ml-auto">{toolbar}</div>}
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="ldf-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={cn(col.sortable && "cursor-pointer select-none hover:bg-gray-100 transition-colors")}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <div className="flex items-center gap-1">
                    {col.header}
                    {col.sortable && sortKey === col.key && (
                      <span className="text-amber-500">{sortDir === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={columns.length} />)
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    {emptyIcon && <div className="text-gray-300 mb-1">{emptyIcon}</div>}
                    <p className="text-sm font-medium">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "border-b border-gray-50 hover:bg-amber-50/30 transition-colors duration-100",
                    onRowClick && "cursor-pointer",
                    rowClassName?.(row),
                  )}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-gray-700">
                      {col.render ? col.render((row as any)[col.key], row) : String((row as any)[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {!loading && total > pageSize && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, total)} sur {total}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pg = Math.max(1, Math.min(safePage - 2, pages - 4)) + i;
              return (
                <button
                  key={pg}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-medium transition-colors",
                    pg === safePage
                      ? "gradient-yellow text-amber-900 shadow-sm"
                      : "hover:bg-gray-100",
                  )}
                  onClick={() => setPage(pg)}
                >
                  {pg}
                </button>
              );
            })}
            <button
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={safePage === pages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
