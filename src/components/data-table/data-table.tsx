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
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  // Get the default row size from the URL params if it exists and is valid
  const defaultRowSize =
    params.get("rowSize") &&
    DEFAULTROWSSIZE.includes(parseInt(params.get("rowSize")!) as RowSize)
      ? (parseInt(params.get("rowSize")!) as RowSize)
      : 10;

  // Get the default page from the URL params if it exists and is valid can't be greater than the max page
  const defaultPage =
    params.get("page") &&
    parseInt(params.get("page")!) <= data.length / defaultRowSize &&
    parseInt(params.get("page")!) > 0
      ? parseInt(params.get("page")!)
      : 1;

  const [rowSize, setRowSize] = useState<RowSize>(defaultRowSize);
  const [page, setPage] = useState(defaultPage);

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
