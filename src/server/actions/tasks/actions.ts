"use server";

import { mock } from "@/config/mock-data";
import { z } from "zod";

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
});

const data = mock;

export async function getTasksAction(params: z.infer<typeof getTasksSchema>) {
  const validedRequestBody = getTasksSchema.safeParse(params);

  if (validedRequestBody.success === false) {
    return {
      success: false,
      message: validedRequestBody.error.message,
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
  const paginatedData = data.slice(
    defaultRowSize * (defaultPage - 1),
    defaultRowSize * defaultPage,
  );

  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    maxPage,
    data: paginatedData,
  };
}
