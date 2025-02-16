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

  // handle sorting
  const handleSort = (column: Column<T>, direction: "asc" | "desc") => {
    params.set("sortBy", `${column.accessor.toString()}.${direction}`);
    router.push(`${pathname}?${params.toString()}`);
  };
  const removeSort = () => {
    params.delete("sortBy");
    router.push(`${pathname}?${params.toString()}`);
  };

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
      <TableHead>
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
    return <TableHead>{column.header}</TableHead>;
  }
}
