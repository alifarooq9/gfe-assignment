"use client";

import {
  DEFAULTROWSSIZE,
  type RowSize,
} from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from "lucide-react";
import { type Dispatch, type SetStateAction } from "react";

type TablePaginationProps = {
  rowSize: number;
  setRowSize: Dispatch<SetStateAction<RowSize>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  maxPage: number;
};

export function TablePagination({
  rowSize,
  setRowSize,
  maxPage,
  page,
  setPage,
}: TablePaginationProps) {
  return (
    <div className="flex items-center justify-between">
      {/* Selected rows count */}
      <p className="text-sm text-muted-foreground">0 of 10 row(s) selected</p>

      {/* Pagination buttons */}
      <div className="flex items-center gap-x-2">
        <Button
          size="iconSm"
          variant="outline"
          disabled={page === 1}
          type="button"
          onClick={() => setPage(page > 10 ? page - 10 : page - (page - 1))}
        >
          <ChevronsLeftIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="iconSm"
          variant="outline"
          type="button"
          disabled={page === 1}
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" />
        </Button>
        <p className="whitespace-nowrap text-sm font-medium">
          Page {page} of {maxPage}
        </p>

        <Button
          size="iconSm"
          variant="outline"
          disabled={page === maxPage}
          type="button"
          onClick={() => setPage(page === maxPage ? page : page + 1)}
        >
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="iconSm"
          variant="outline"
          disabled={page === maxPage}
          type="button"
          onClick={() =>
            setPage(maxPage < page + 10 ? page + (maxPage - page) : page + 10)
          }
        >
          <ChevronsRightIcon className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Rows per page dropdown */}
      <div className="flex items-center gap-x-2">
        <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
        <Select
          value={rowSize.toString()}
          onValueChange={(value) => setRowSize(parseInt(value) as RowSize)}
        >
          <SelectTrigger>
            <SelectValue defaultValue={DEFAULTROWSSIZE[0].toString()}>
              {rowSize}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {DEFAULTROWSSIZE.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
