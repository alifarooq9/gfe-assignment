"use server";

import { mock } from "@/config/mock-data";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";

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
  const defaultRowSize =
    params.rowSize && [10, 20, 30, 40, 50].includes(params.rowSize)
      ? params.rowSize
      : 10;

  // Get the default page from the URL params if it exists and is valid can't be greater than the max page
  const defaultPage = params.page && params.page > 0 ? params.page : 1;

  // Calculate the maximum number of pages based on the number of rows and the row size
  const maxPage = Math.ceil(data.length / defaultRowSize);

  const [accessor, direction] = params.sortBy?.split(".") ?? [];

  let processedData = data;

  // Apply sorting if specified
  if (params.sortBy && accessor && direction) {
    processedData = data.sort((a, b) => {
      const aValue = a[accessor as keyof typeof a];
      const bValue = b[accessor as keyof typeof b];

      if (aValue < bValue) {
        return direction === "asc" ? -1 : 1;
      } else if (aValue > bValue) {
        return direction === "asc" ? 1 : -1;
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

  // Apply pagination
  const startIndex = defaultRowSize * (defaultPage - 1);
  const endIndex = defaultRowSize * defaultPage;
  const paginatedData = processedData.slice(startIndex, endIndex);

  return {
    success: true,
    maxPage,
    data: paginatedData,
  };
}
