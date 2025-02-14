"use client";

import { TablePagination } from "@/components/data-table/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
};

export const DEFAULTROWSSIZE = [10, 20, 30, 40, 50] as const;
export type RowSize = (typeof DEFAULTROWSSIZE)[number];

export function DataTable<T>({ columns, data }: DataTableProps<T>) {
  const [rowSize, setRowSize] = useState<RowSize>(10);
  const [page, setPage] = useState(1);

  // Calculate the maximum number of pages based on the number of rows and the row size
  const maxPage = Math.ceil(data.length / rowSize);

  // Slice the data based on the current page and row size
  const paginatedData = data.slice(rowSize * (page - 1), rowSize * page);

  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((row, index) => (
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

      <TablePagination
        rowSize={rowSize}
        setRowSize={setRowSize}
        page={page}
        setPage={setPage}
        maxPage={maxPage}
      />
    </div>
  );
}
