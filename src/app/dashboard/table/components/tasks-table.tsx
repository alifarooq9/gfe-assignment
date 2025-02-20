import { TasksTableClient } from "@/app/dashboard/table/components/tasks-table-client";
import { type RowSize } from "@/components/data-table/data-table";
import type { SearchParam } from "@/components/data-table/data-table-search-filter";
import { TAGS } from "@/config/tags";
import {
  getCustomFieldsAction,
  getTasksAction,
} from "@/server/actions/tasks/actions";
import type { Task } from "@/server/actions/tasks/types";
import { unstable_cache as cache } from "next/cache";

type TableViewProps = {
  searchParams: {
    page: string;
    rowSize: string;
    sortBy: string;
    search: string;
  };
};

async function getTasks(params: TableViewProps) {
  return await getTasksAction({
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
}

const getCustomFields = cache(
  async () => getCustomFieldsAction(),
  [TAGS.customFields.getCustomFileds],
  { tags: [TAGS.customFields.getCustomFileds] },
);

export async function TasksTable(params: TableViewProps) {
  const tasks = await getTasks(params);
  const customFields = await getCustomFields();

  if (!tasks.success) {
    return <div>Error: {tasks.message}</div>;
  }

  return (
    <TasksTableClient
      tasks={tasks.data as Task[]}
      maxPage={tasks.maxPage!}
      customFields={customFields.data}
    />
  );
}
