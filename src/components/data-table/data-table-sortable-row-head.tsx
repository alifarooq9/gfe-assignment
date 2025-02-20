import { type Column } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ChevronsUpDownIcon,
  Trash2Icon,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { TableHead } from "@/components/ui/table";

type SortableRowHeadProps<T> = {
  column: Column<T>;
};

export function DataTableSortableRowHead<T>({
  column,
}: SortableRowHeadProps<T>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams);

  const sortAccessor = column.customSortAccessor ?? column.accessor;

  // handle sorting
  const handleSort = (column: Column<T>, direction: "asc" | "desc") => {
    params.set(
      "sortBy",
      `${(column.customSortAccessor ?? column.accessor).toString()}.${direction}`,
    );
    router.push(`${pathname}?${params.toString()}`);
  };
  const removeSort = () => {
    params.delete("sortBy");
    router.push(`${pathname}?${params.toString()}`);
  };

  const isSortable = column.sortable ?? false;
  const sortByParams = params.get("sortBy");
  const isSorted = sortByParams
    ? sortByParams.split(".")[0] === sortAccessor.toString()
    : false;
  const isSortedAsc = sortByParams
    ? sortByParams.split(".")[1] === "asc"
    : false;

  // if the column is sortable
  if (isSortable) {
    return (
      <TableHead>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-1 text-sm capitalize"
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
              <span className="flex items-center gap-1">
                <ArrowDownAZIcon className="h-3.5 w-3.5" />
                Asc
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              onClick={() => handleSort(column, "desc")}
              checked={isSorted && !isSortedAsc}
            >
              <span className="flex items-center gap-1">
                <ArrowUpAZIcon className="h-3.5 w-3.5" />
                Desc
              </span>
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem onClick={removeSort}>
              <span className="flex items-center gap-1">
                <Trash2Icon className="h-3.5 w-3.5" />
                Remove
              </span>
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableHead>
    );
  } else {
    return <TableHead className="capitalize">{column.header}</TableHead>;
  }
}
