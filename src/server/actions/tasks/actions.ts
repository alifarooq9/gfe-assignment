"use server";

import { mock } from "@/config/mock-data";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { createTaskSchema, customFields, tasks } from "@/server/db/schema";
import { db } from "@/server/db";

const getTasksSchema = z.object({
  rowSize: z
    .union([
      z.literal(10),
      z.literal(20),
      z.literal(30),
      z.literal(40),
      z.literal(50),
    ])
    .optional(),
  page: z.number().optional(),
  sortBy: z.string().optional(),
  search: z
    .object({ searchAccessor: z.string(), value: z.string() })
    .optional(),
});

const data = mock;

export async function getTasksAction(params: z.infer<typeof getTasksSchema>) {
  noStore();
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const validedRequestBody = getTasksSchema.safeParse(params);

  if (validedRequestBody.success === false) {
    return {
      success: false,
      message: `${validedRequestBody.error.issues[0]?.path[0]} - ${validedRequestBody.error.issues[0]?.message}`,
    };
  }

  // Get the default row size from the URL params if it exists and is valid
  const rowSize =
    params.rowSize && [10, 20, 30, 40, 50].includes(params.rowSize)
      ? params.rowSize
      : 10;

  // Get the default page from the URL params if it exists and is valid can't be greater than the max page
  const page = params.page && params.page > 0 ? params.page : 1;

  const [accessor, direction] = params.sortBy?.split(".") ?? [];

  let processedData = data;

  // Apply sorting if specified, it should not keep the first on uppercase, it should consider all the words in lowercase
  if (params.sortBy && accessor && direction) {
    processedData = data.sort((a, b) => {
      const aValue = a[accessor as keyof typeof a];
      const bValue = b[accessor as keyof typeof b];

      const aValueStr = String(aValue).toLowerCase();
      const bValueStr = String(bValue).toLowerCase();

      if (typeof aValue === "string" && typeof bValue === "string") {
        if (aValueStr < bValueStr) {
          return direction === "asc" ? -1 : 1;
        } else if (aValueStr > bValueStr) {
          return direction === "asc" ? 1 : -1;
        } else {
          return 0;
        }
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return direction === "asc" ? aValue - bValue : bValue - aValue;
      } else if (typeof aValue === "boolean" && typeof bValue === "boolean") {
        return direction === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      } else {
        return 0;
      }
    });
  } else {
    // default to sorting by id in ascending order
    processedData = data.sort((a, b) => {
      return a.id - b.id;
    });
  }

  // Apply search
  if (params.search) {
    processedData = processedData.filter((item: Record<string, unknown>) => {
      const value = item[params.search!.searchAccessor];
      return (
        typeof value === "string" &&
        value.toLowerCase().includes(params.search!.value.toLowerCase())
      );
    });
  }

  // Apply pagination
  const startIndex = rowSize * (page - 1);
  const endIndex = rowSize * page;
  const paginatedData = processedData.slice(startIndex, endIndex);

  // Calculate the maximum number of pages based on the number of rows and the row size
  const maxPage = Math.ceil(processedData.length / rowSize);

  return {
    success: true,
    maxPage,
    data: paginatedData,
  };
}

// create task action
export async function createTaskAction(
  params: z.infer<typeof createTaskSchema>,
) {
  noStore();

  try {
    const validedRequestBody = createTaskSchema.safeParse(params);

    if (validedRequestBody.success === false) {
      return {
        success: false,
        message: `${validedRequestBody.error.issues[0]?.path[0]} - ${validedRequestBody.error.issues[0]?.message}`,
      };
    }

    const task = await db
      .insert(tasks)
      .values({
        title: validedRequestBody.data.title,
        priority: validedRequestBody.data.priority,
        status: validedRequestBody.data.status,
      })
      .returning({ insertedId: tasks.id })
      .execute();

    if (!task[0]?.insertedId) {
      return {
        success: false,
        message: "Failed to create task",
      };
    }

    if (validedRequestBody.data.customFields) {
      for (const field of validedRequestBody.data.customFields) {
        await db
          .insert(customFields)
          .values({
            name: field.name,
            type: field.type,
            value: String(field.value),
            taskId: task[0].insertedId,
          })
          .execute();
      }
    }

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message ?? "Failed to create task",
    };
  }
}
