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
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type Dispatch, type SetStateAction } from "react";
import { useDebounce } from "use-debounce";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const [debouncePage] = useDebounce(page, 200);
  const [debounceRowSize] = useDebounce(rowSize, 200);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: RowSize) => {
    setRowSize(newRowsPerPage);
  };

  useEffect(() => {
    params.set("page", debouncePage.toString());
    params.set("rowSize", debounceRowSize.toString());
    router.push(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncePage, debounceRowSize]);

  useEffect(() => {
    // Update the page if the row size changes if the page is greater than the max page
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [rowSize, maxPage, page, setPage]);

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
          onClick={() =>
            handlePageChange(page > 10 ? page - 10 : page - (page - 1))
          }
        >
          <ChevronsLeftIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="iconSm"
          variant="outline"
          type="button"
          disabled={page === 1}
          onClick={() => handlePageChange(page > 1 ? page - 1 : 1)}
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
          onClick={() => handlePageChange(page === maxPage ? page : page + 1)}
        >
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="iconSm"
          variant="outline"
          disabled={page === maxPage}
          type="button"
          onClick={() =>
            handlePageChange(
              maxPage < page + 10 ? page + (maxPage - page) : page + 10,
            )
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
          onValueChange={(value) =>
            handleRowsPerPageChange(parseInt(value) as RowSize)
          }
        >
          <SelectTrigger>
            <SelectValue defaultValue={DEFAULTROWSSIZE[0]?.toString()}>
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
