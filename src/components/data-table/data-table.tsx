"use client";

import { SortableRowHead } from "@/components/data-table/sortable-row-head";
import { TablePagination } from "@/components/data-table/table-pagination";

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  maxPage: number;
  searchFilterAccessor?: keyof T;
};

export const DEFAULTROWSSIZE = [10, 20, 30, 40, 50] as const;
export type RowSize = (typeof DEFAULTROWSSIZE)[number];

export function DataTable<T>({ columns, data, maxPage }: DataTableProps<T>) {
  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <SortableRowHead column={column} key={index} />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column, colIndex) => {
                  const content =
                    typeof column.accessor === "function"
                      ? column.accessor(row)
                      : (row[column.accessor] as React.ReactNode);

                  return <TableCell key={colIndex}>{content}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination maxPage={maxPage} />
    </div>
  );
}
