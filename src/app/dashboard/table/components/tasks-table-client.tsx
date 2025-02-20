"use client";

import { taskColumns } from "@/app/dashboard/table/components/tasks-columns";
import { DataTable } from "@/components/data-table/data-table";
import type { Task } from "@/server/actions/tasks/types";

type TasksTableClient = {
  data: Task[];
  maxPage: number;
};

export function TasksTableClient({ data, maxPage }: TasksTableClient) {
  return (
    <DataTable
      data={data}
      columns={taskColumns}
      maxPage={maxPage}
      searchFilterAccessor="title"
    />
  );
}
