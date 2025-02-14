import { TableView } from "@/app/dashboard/table/components/tableview";
import { Button } from "@/components/ui/button";
import { mock } from "@/config/mock-data";
import { PlusCircleIcon } from "lucide-react";

export default function TableViewPage() {
  const data = mock;

  return (
    <main className="grid gap-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-lg font-bold">Table View</h1>

        <Button size="sm">
          <PlusCircleIcon className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </div>
      <TableView tasks={data} />
    </main>
  );
}
