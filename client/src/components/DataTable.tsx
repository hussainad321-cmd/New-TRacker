import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  isLoading?: boolean;
}

export function DataTable<T extends { id: number | string }>({ 
  data, 
  columns, 
  isLoading 
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-card rounded-xl border border-border p-8 animate-pulse">
        <div className="h-8 bg-muted rounded mb-4 w-full opacity-50"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-muted/50 rounded w-full opacity-30"></div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full bg-card rounded-xl border border-dashed border-border p-12 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground font-medium">No records found</p>
        <p className="text-sm text-muted-foreground/60 mt-1">Create a new entry to get started.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {columns.map((col, idx) => (
                <th 
                  key={idx} 
                  className={cn(
                    "px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-xs",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {data.map((row) => (
              <tr 
                key={row.id} 
                className="group hover:bg-muted/30 transition-colors duration-200"
              >
                {columns.map((col, idx) => (
                  <td key={idx} className="px-6 py-4 text-foreground">
                    {typeof col.accessor === 'function' 
                      ? col.accessor(row) 
                      : (row[col.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
