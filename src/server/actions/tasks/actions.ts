"use server";

import { mock } from "@/config/mock-data";
import { z } from "zod";
import { unstable_noStore as noStore } from "next/cache";
import { createTaskSchema, customFields, tasks } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, asc, desc, like, sql } from "drizzle-orm";

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

export async function getTasksAction(params: z.infer<typeof getTasksSchema>) {
  noStore();

  const validated = getTasksSchema.safeParse(params);
  if (!validated.success) {
    return {
      success: false,
      message: `${validated.error.issues[0]?.path[0]} - ${validated.error.issues[0]?.message}`,
    };
  }

  const { rowSize = 10, page = 1, sortBy, search } = validated.data;
  const offset = (page - 1) * rowSize;
  const [field, direction] = sortBy?.split(".") ?? [];

  // Build conditions for partial search
  const conditions = [];
  if (search) {
    conditions.push(
      like(
        // @ts-expect-error - Type 'string' is not assignable to type 'Column<Task>'
        tasks[search.searchAccessor as keyof typeof tasks],
        `%${search.value.toLowerCase()}%`,
      ),
    );
  }

  // Build orderBy
  let orderBy = asc(tasks.id);
  if (field && direction === "asc") {
    // @ts-expect-error - Type 'string' is not assignable to type 'Column<Task>'
    orderBy = asc(tasks[field as keyof typeof tasks]);
  } else if (field && direction === "desc") {
    // @ts-expect-error - Type 'string' is not assignable to type 'Column<Task>'
    orderBy = desc(tasks[field as keyof typeof tasks]);
  }

  // Main query
  const dbData = await db.query.tasks.findMany({
    with: { customFields: true },
    where: conditions.length ? and(...conditions) : undefined,
    offset,
    limit: rowSize,
    orderBy,
  });

  // Count total for pagination
  const totalRes = await db
    .select({ count: sql<number>`COUNT(*)`.mapWith(Number) })
    .from(tasks)
    .where(conditions.length ? and(...conditions) : undefined);

  return {
    success: true,
    maxPage: Math.ceil((totalRes[0]?.count ?? 0) / rowSize),
    data: dbData,
  };
}

// get all custom fields created by user
export async function getCustomFieldsAction() {
  noStore();

  try {
    const customFields = await db.query.customFields.findMany();

    //custom fields keys
    const customFieldsKeys = customFields.map((field) => field.name);

    return {
      success: true,
      data: { customFields, customFieldsKeys },
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
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
