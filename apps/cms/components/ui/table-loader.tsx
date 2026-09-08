import * as React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ColumnSkeletonType =
  | "text"
  | "title-with-image"
  | "avatar"
  | "badge"
  | "number"
  | "checkbox"
  | "actions"
  | "code"
  | "barcode";

export interface TableLoaderProps {
  /**
   * Number of columns in the table (matches TableHead count)
   */
  colSpan: number;
  /**
   * Number of skeleton placeholder rows to render
   * @default 5
   */
  rows?: number;
  /**
   * Style variant: "skeleton" (default) or "spinner"
   * @default "skeleton"
   */
  variant?: "skeleton" | "spinner";
  /**
   * Loading message shown in spinner variant
   */
  text?: string;
  /**
   * Optional custom column types array. If not provided,
   * realistic column types are automatically inferred from colSpan.
   */
  columns?: ColumnSkeletonType[];
  className?: string;
}

/**
 * Derives realistic column types based on standard table colSpan
 */
function getDefaultColumns(colSpan: number): ColumnSkeletonType[] {
  switch (colSpan) {
    case 3: // Quiz (Prompt, Answers, Actions)
      return ["text", "text", "actions"];
    case 4: // Categories / FAQs (Name/Order, Slug/Question, Badge/Answer, Actions)
      return ["title-with-image", "text", "badge", "actions"];
    case 5: // Products (Product, Category, Price, Stock, Actions)
      return ["title-with-image", "badge", "number", "badge", "actions"];
    case 7: // Users / Orders (User/Order, Col1, Col2, Col3, Col4, Col5, Actions)
      return ["avatar", "badge", "badge", "number", "text", "text", "actions"];
    case 8: // Coupons (Code, Discount, Type, Min, Max, Used, Status, Actions)
      return ["code", "badge", "text", "number", "number", "number", "badge", "actions"];
    case 9: // Product Barcodes (Checkbox, Code, Barcode, Product, Order, Used, Printed, Date, Actions)
      return ["checkbox", "code", "barcode", "text", "badge", "badge", "badge", "text", "actions"];
    default: {
      const cols: ColumnSkeletonType[] = [];
      for (let i = 0; i < colSpan; i++) {
        if (i === 0) cols.push("title-with-image");
        else if (i === colSpan - 1) cols.push("actions");
        else if (i % 3 === 1) cols.push("badge");
        else cols.push("text");
      }
      return cols;
    }
  }
}

function renderCellSkeleton(type: ColumnSkeletonType, rowIdx: number, colIdx: number) {
  // Balanced deterministic variance per row
  const widthVariations = ["w-28", "w-36", "w-32", "w-24", "w-32"];
  const shortWidthVariations = ["w-14", "w-18", "w-16", "w-20", "w-16"];
  const w = widthVariations[(rowIdx + colIdx) % widthVariations.length];
  const sw = shortWidthVariations[(rowIdx + colIdx) % shortWidthVariations.length];

  switch (type) {
    case "checkbox":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13 text-center w-12">
          <div className="h-4 w-4 rounded skeleton-shimmer mx-auto" />
        </TableCell>
      );

    case "title-with-image":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md skeleton-shimmer flex-none" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className={cn("h-3.5 rounded skeleton-shimmer", w)} />
              <div className={cn("h-2.5 rounded skeleton-shimmer opacity-70", sw)} />
            </div>
          </div>
        </TableCell>
      );

    case "avatar":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full skeleton-shimmer flex-none" />
            <div className="space-y-1 flex-1 min-w-0">
              <div className={cn("h-3.5 rounded skeleton-shimmer", w)} />
              <div className={cn("h-2.5 rounded skeleton-shimmer opacity-70", sw)} />
            </div>
          </div>
        </TableCell>
      );

    case "code":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13 font-mono">
          <div className={cn("h-3.5 rounded skeleton-shimmer", sw)} />
        </TableCell>
      );

    case "barcode":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className="h-4 w-20 rounded skeleton-shimmer" />
        </TableCell>
      );

    case "badge":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className={cn("h-5 rounded-full skeleton-shimmer", sw)} />
        </TableCell>
      );

    case "number":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className={cn("h-3.5 rounded skeleton-shimmer", sw)} />
        </TableCell>
      );

    case "actions":
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13 text-right w-24">
          <div className="flex items-center justify-end gap-1.5">
            <div className="h-7 w-7 rounded-md skeleton-shimmer flex-none" />
            <div className="h-7 w-7 rounded-md skeleton-shimmer flex-none" />
          </div>
        </TableCell>
      );

    case "text":
    default:
      return (
        <TableCell key={colIdx} className="px-4 sm:px-6 h-13">
          <div className={cn("h-3.5 rounded skeleton-shimmer", w)} />
        </TableCell>
      );
  }
}

export function TableLoader({
  colSpan,
  rows = 5,
  variant = "skeleton",
  text = "Loading data...",
  columns,
  className,
}: TableLoaderProps) {
  if (variant === "spinner") {
    return (
      <TableRow className={cn("hover:bg-transparent", className)}>
        <TableCell colSpan={colSpan} className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <div className="absolute h-10 w-10 rounded-full border-2 border-primary/20 animate-ping opacity-25" />
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">
              {text}
            </p>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  const columnTypes = columns || getDefaultColumns(colSpan);

  // Render authentic rows with distinct TableCell elements aligned to every column
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <TableRow
          key={`table-skeleton-row-${rIdx}`}
          className={cn(
            "border-b border-default-100 dark:border-default-300/30 hover:bg-transparent transition-colors",
            className
          )}
        >
          {columnTypes.slice(0, colSpan).map((type, cIdx) =>
            renderCellSkeleton(type, rIdx, cIdx)
          )}
        </TableRow>
      ))}
    </>
  );
}
