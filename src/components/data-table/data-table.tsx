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
  maxPage: number;
};

export const DEFAULTROWSSIZE = [10, 20, 30, 40, 50] as const;
export type RowSize = (typeof DEFAULTROWSSIZE)[number];

export function DataTable<T>({ columns, data, maxPage }: DataTableProps<T>) {
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
    parseInt(params.get("page")!) > 0 &&
    parseInt(params.get("page")!) <= maxPage
      ? parseInt(params.get("page")!)
      : 1;

  const [rowSize, setRowSize] = useState<RowSize>(defaultRowSize);
  const [page, setPage] = useState(defaultPage);

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
