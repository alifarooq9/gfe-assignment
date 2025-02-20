import { TasksTableClient } from "@/app/dashboard/table/components/tasks-table-client";
import { type RowSize } from "@/components/data-table/data-table";
import type { SearchParam } from "@/components/data-table/data-table-search-filter";
import { getTasksAction } from "@/server/actions/tasks/actions";
import type { Task } from "@/server/actions/tasks/types";

type TableViewProps = {
  searchParams: {
    page: string;
    rowSize: string;
    sortBy: string;
    search: string;
  };
};

export async function TasksTable(params: TableViewProps) {
  const taskRequest = await getTasksAction({
    page: params.searchParams.page
      ? Number(params.searchParams.page)
      : undefined,
    rowSize: params.searchParams.rowSize
      ? (Number(params.searchParams.rowSize) as RowSize)
      : undefined,
    sortBy: params.searchParams.sortBy ? params.searchParams.sortBy : undefined,
    search: params.searchParams.search
      ? (JSON.parse(params.searchParams.search) as SearchParam)
      : undefined,
  });

  if (!taskRequest.success) {
    return <div>Error: {taskRequest.message}</div>;
  }

  return (
    <TasksTableClient
      data={taskRequest.data as Task[]}
      maxPage={taskRequest.maxPage!}
    />
  );
}
