"use client";

import { type Column, DataTable } from "@/components/data-table/data-table";
import type { getCustomFieldsAction } from "@/server/actions/tasks/actions";
import type { Task } from "@/server/actions/tasks/types";
import { format } from "date-fns";

type TasksTableClient = {
  tasks: Task[];
  maxPage: number;
  customFields: Awaited<ReturnType<typeof getCustomFieldsAction>>["data"];
};

export const taskColumns: Column<Task>[] = [
  { header: "Task ID", accessor: "id", sortable: true },
  { header: "Title", accessor: "title", sortable: true },
  { header: "Priority", accessor: "priority" },
  { header: "Status", accessor: "status" },
  {
    header: "Created At",
    accessor: "createdAt",
    cell: (row) => (
      <span>{format(new Date(new Date(row.createdAt)), "PP")}</span>
    ),
    sortable: true,
  },
];

export function TasksTableClient({
  tasks,
  maxPage,
  customFields,
}: TasksTableClient) {
  const test: Column<Task>[] = customFields?.customFieldsColumns?.map((c) => ({
    header: c.name,
    accessor: c.name,
    cell: (row) => {
      const value = row?.customFields?.find(
        (f) =>
          f.name.toLowerCase() === c.name.toLowerCase() && f.type === c.type,
      )?.value;

      if (!value) return "-";

      if (c.type === "text") {
        return <span>{String(value)}</span>;
      } else if (c.type === "number") {
        return <span>{Number(value)}</span>;
      } else if (c.type === "checkbox") {
        return <span>{Boolean(value) ? "Check" : "No"}</span>;
      } else if (c.type === "dateTime") {
        return <span>{format(new Date(value as string), "PP")}</span>;
      } else {
        return <span>-</span>;
      }
    },
    customSortAccessor: "customFields." + c.name,
    sortable: true,
  })) as Column<Task>[];

  const columns = [...taskColumns, ...test];
  console.log(test, tasks);

  return (
    <DataTable
      data={tasks}
      columns={columns}
      maxPage={maxPage}
      searchFilterAccessor="title"
    />
  );
}
