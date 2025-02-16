import {
  type Column,
  DataTable,
  type RowSize,
} from "@/components/data-table/data-table";
import { getTasksAction } from "@/server/actions/tasks/actions";
import type { Task } from "@/server/actions/tasks/types";

const taskColumns: Column<Task>[] = [
  { header: "Task ID", accessor: "id", sortable: true },
  { header: "Title", accessor: "title", sortable: true },
  { header: "Priority", accessor: "priority" },
  { header: "Status", accessor: "status" },
];

type TableViewProps = {
  searchParams: {
    page: string;
    rowSize: string;
    sortBy: string;
  };
};

export async function TableView(params: TableViewProps) {
  const taskRequest = await getTasksAction({
    page: params.searchParams.page
      ? Number(params.searchParams.page)
      : undefined,
    rowSize: params.searchParams.rowSize
      ? (Number(params.searchParams.rowSize) as RowSize)
      : undefined,
    sortBy: params.searchParams.sortBy ? params.searchParams.sortBy : undefined,
  });

  if (!taskRequest.success) {
    return <div>Error: {taskRequest.message}</div>;
  }

  return (
    <DataTable
      data={taskRequest.data as Task[]}
      columns={taskColumns}
      maxPage={taskRequest.maxPage!}
      searchFilterAccessor="title"
    />
  );
}
