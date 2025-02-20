import type { Column } from "@/components/data-table/data-table";
import type { Task } from "@/server/actions/tasks/types";
import { format } from "date-fns";

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
