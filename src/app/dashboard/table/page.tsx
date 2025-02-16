import { TableView } from "@/app/dashboard/table/components/tableview";
import { Button } from "@/components/ui/button";
import { PlusCircleIcon } from "lucide-react";
import { Suspense } from "react";

type TableViewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TableViewPage({
  searchParams,
}: TableViewPageProps) {
  const params = await searchParams;

  return (
    <main className="grid gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-bold">
          Table View{" "}
          <span className="text-sm font-normal text-muted-foreground">
            (Server Side Rendering)
          </span>
        </h1>

        <Button size="sm">
          <PlusCircleIcon className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <TableView
          searchParams={{
            page: params.page as string,
            rowSize: params.rowSize as string,
            sortBy: params.sortBy as string,
            search: params.search as string,
          }}
        />
      </Suspense>
    </main>
  );
}
