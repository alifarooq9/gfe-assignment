"use client";

import { TablePagination } from "@/components/data-table/table-pagination";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ChevronsUpDownIcon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export type Column<T> = {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  maxPage: number;
};

export const DEFAULTROWSSIZE = [10, 20, 30, 40, 50] as const;
export type RowSize = (typeof DEFAULTROWSSIZE)[number];

export function DataTable<T>({ columns, data, maxPage }: DataTableProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleSort = (column: Column<T>, direction: "asc" | "desc") => {
    params.set("sortBy", `${column.accessor.toString()}.${direction}`);
    router.push(`${pathname}?${params.toString()}`);
  };

  const removeSort = () => {
    params.delete("sortBy");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid gap-4">
      <div className="overflow-hidden rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => {
                const isSortable = column.sortable ?? false;
                const sortByParams = params.get("sortBy");
                const isSorted = sortByParams
                  ? sortByParams.split(".")[0] === column.accessor.toString()
                  : false;
                const isSortedAsc = sortByParams
                  ? sortByParams.split(".")[1] === "asc"
                  : false;

                // if the column is sortable
                if (isSortable) {
                  return (
                    <TableHead key={index}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-sm"
                          >
                            {column.header}{" "}
                            {isSorted ? (
                              isSortedAsc ? (
                                <ArrowDownAZIcon className="h-3 w-3" />
                              ) : (
                                <ArrowUpAZIcon className="h-3 w-3" />
                              )
                            ) : (
                              <ChevronsUpDownIcon className="h-3 w-3" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuCheckboxItem
                            checked={isSorted && isSortedAsc}
                            onClick={() => handleSort(column, "asc")}
                          >
                            Asc
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            onClick={() => handleSort(column, "desc")}
                            checked={isSorted && !isSortedAsc}
                          >
                            Desc
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem onClick={removeSort}>
                            Remove
                          </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  );
                } else {
                  return <TableHead key={index}>{column.header}</TableHead>;
                }
              })}
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
