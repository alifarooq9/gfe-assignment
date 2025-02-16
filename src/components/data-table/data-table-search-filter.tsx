import { Input } from "@/components/ui/input";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";

type DataTableSearchFilterProps = {
  searchFilterAccessor: string;
};

export type SearchParam = {
  searchAccessor: string;
  value: string;
};

export function DataTableSearchFilter({
  searchFilterAccessor,
}: DataTableSearchFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams.toString());

  const defaultSearchValue = params.get("search")
    ? (JSON.parse(params.get("search")!) as { value: string })
    : { value: "" };

  const [searchFilter, setSearchFilter] = useState<string>(
    defaultSearchValue.value ?? "",
  );

  const [debounceSearchFilter] = useDebounce(searchFilter, 200);

  const searchData = {
    searchAccessor: searchFilterAccessor,
    value: debounceSearchFilter,
  };

  useEffect(() => {
    params.set(`search`, JSON.stringify(searchData));
    router.push(`${pathname}?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounceSearchFilter]);

  return (
    <Input
      value={searchFilter}
      onChange={(e) => setSearchFilter(e.target.value)}
      placeholder={`Search from ${searchFilterAccessor}...`}
      className="w-fit"
    />
  );
}
