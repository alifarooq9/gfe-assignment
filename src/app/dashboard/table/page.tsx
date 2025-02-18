import AddTasksSheet from "@/app/dashboard/table/components/add-tasks-sheet";
import { TableView } from "@/app/dashboard/table/components/tableview";
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

        <AddTasksSheet />
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
