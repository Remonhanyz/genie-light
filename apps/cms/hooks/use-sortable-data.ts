import { useState, useMemo } from "react";

export function useSortableData<T>(items: T[], config: { field: string; asc: boolean } | null = null) {
  const [sortConfig, setSortConfig] = useState<{ field: string; asc: boolean } | null>(config);

  const sortedItems = useMemo(() => {
    if (!sortConfig) return items;
    
    return [...items].sort((a: any, b: any) => {
      let aVal = a[sortConfig.field];
      let bVal = b[sortConfig.field];

      // Support nested fields resolving (e.g. "category.name")
      if (sortConfig.field.includes(".")) {
        const parts = sortConfig.field.split(".");
        aVal = parts.reduce((obj, key) => obj?.[key], a);
        bVal = parts.reduce((obj, key) => obj?.[key], b);
      }

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortConfig.asc ? aVal - bVal : bVal - aVal;
      }
      
      return sortConfig.asc
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: "base" })
        : String(bVal).localeCompare(String(aVal), undefined, { numeric: true, sensitivity: "base" });
    });
  }, [items, sortConfig]);

  const requestSort = (field: string) => {
    let asc = true;
    if (sortConfig && sortConfig.field === field && sortConfig.asc) {
      asc = false;
    }
    setSortConfig({ field, asc });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
