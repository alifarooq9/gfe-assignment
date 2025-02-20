"use server";

import { z } from "zod";
import { unstable_noStore as noStore, revalidateTag } from "next/cache";
import { createTaskSchema, customFields, tasks } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, asc, desc, like, sql } from "drizzle-orm";
import { TAGS } from "@/config/tags";

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
  let orderBy = desc(tasks.createdAt);
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

interface GroupedData {
  name: string;
  type: "text" | "number" | "checkbox" | "dateTime";
  values: string[];
}

// get all custom fields created by user
export async function getCustomFieldsAction() {
  noStore();

  try {
    const customFields = await db.query.customFields.findMany();

    // Group by a composite key built from lowercased name and type
    const grouped = customFields.reduce(
      (acc: Record<string, GroupedData>, { name, type, value }) => {
        // Convert both name and type to lowercase for grouping
        const key = `${name.toLowerCase()}|${type}`;

        if (!acc[key]) {
          // You can choose to store the lowercased version, or preserve the original casing from the first occurrence
          acc[key] = { name: name.toLowerCase(), type: type, values: [] };
        }
        // Convert value to lowercase before checking for duplicates
        const lowerValue = value.toLowerCase();
        if (!acc[key].values.includes(lowerValue)) {
          acc[key].values.push(lowerValue);
        }
        return acc;
      },
      {} as Record<string, GroupedData>,
    );

    // Convert the grouped object into an array of objects
    const customFieldsColumns: GroupedData[] = Object.values(grouped);

    return {
      success: true,
      data: { customFields, customFieldsColumns },
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
      await db
        .insert(customFields)
        .values(
          validedRequestBody.data.customFields.map((c) => ({
            ...c,
            taskId: task[0]!.insertedId,
            value: String(c.value),
          })),
        )
        .execute();

      revalidateTag(TAGS.customFields.getCustomFileds);
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
