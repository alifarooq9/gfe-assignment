import {
  type Column,
  DataTable,
  type RowSize,
} from "@/components/data-table/data-table";
import { getTasksAction } from "@/server/actions/tasks/actions";
import type { Task } from "@/server/actions/tasks/types";

const taskColumns: Column<Task>[] = [
  { header: "Task ID", accessor: "id" },
  { header: "Title", accessor: "title" },
  { header: "Priority", accessor: "priority" },
  { header: "Status", accessor: "status" },
];

type TableViewProps = {
  searchParams: {
    page: string;
    rowSize: string;
  };
};

export async function TableView(params: TableViewProps) {
  const taskRequest = await getTasksAction({
    page: Number(params.searchParams.page),
    rowSize: Number(params.searchParams.rowSize) as RowSize,
  });

  if (!taskRequest.success) {
    return <div>Error: {taskRequest.message}</div>;
  }

  return (
    <DataTable
      data={taskRequest.data as Task[]}
      columns={taskColumns}
      maxPage={taskRequest.maxPage!}
    />
  );
}
