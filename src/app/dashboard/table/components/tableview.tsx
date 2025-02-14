import { type Column, DataTable } from "@/components/data-table/data-table";

type Task = {
  id: number;
  title: string;
  priority: string;
  status: string;
};

type TableViewProps = {
  tasks: Task[];
};

/**
 * An array of column definitions for displaying tasks in a table view.
 * Each column is represented by an object with a header and an accessor.
 *
 * @type {Column<Task>[]}
 * @property {string} header - The display name of the column.
 * @property {string} accessor - The key used to access the corresponding value in the task object.
 *
 * Columns:
 * - Task ID: Accesses the "id" property of the task.
 * - Title: Accesses the "title" property of the task.
 * - Priority: Accesses the "priority" property of the task.
 * - Status: Accesses the "status" property of the task.
 */
const taskColumns: Column<Task>[] = [
  { header: "Task ID", accessor: "id" },
  { header: "Title", accessor: "title" },
  { header: "Priority", accessor: "priority" },
  { header: "Status", accessor: "status" },
];

export function TableView({ tasks }: TableViewProps) {
  return (
    <div>
      <DataTable data={tasks} columns={taskColumns} />
    </div>
  );
}
