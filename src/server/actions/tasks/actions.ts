"use server";

import { z } from "zod";
import { unstable_noStore as noStore, revalidateTag } from "next/cache";
import { createTaskSchema, customFields, tasks } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, asc, desc, eq, inArray, like, sql } from "drizzle-orm";
import { TAGS } from "@/config/tags";
import { Task } from "@/server/actions/tasks/types";

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

  // Parse sort parameters
  const sortParts = sortBy?.split(".") ?? [];
  const isCustomField = sortParts[0] === "customFields";
  const direction = sortParts[isCustomField ? 2 : 1] ?? "desc";
  const fieldName = sortParts[isCustomField ? 1 : 0];

  // Build search conditions
  const conditions = [];
  if (search) {
    conditions.push(
      like(
        tasks[search.searchAccessor as keyof typeof tasks],
        `%${search.value.toLowerCase()}%`,
      ),
    );
  }

  let dbData: Task[];

  if (isCustomField && fieldName) {
    // Determine the type of the custom field
    const typeQuery = await db
      .select({ type: customFields.type })
      .from(customFields)
      .where(eq(customFields.name, fieldName))
      .limit(1);

    const customFieldType = typeQuery[0]?.type || "text"; // Default to 'text'

    // Subquery to get the custom field value for sorting
    const sortValue = sql`(SELECT value FROM ${customFields} WHERE task_id = ${tasks.id} AND name = ${fieldName} LIMIT 1)`;

    // Cast the value based on its type
    let castedSortValue;
    switch (customFieldType) {
      case "number":
        castedSortValue = sql`CAST(COALESCE(${sortValue}, '0') AS REAL)`;
        break;
      case "dateTime":
        castedSortValue = sql`COALESCE(${sortValue}, '1970-01-01T00:00:00')`;
        break;
      case "checkbox":
        castedSortValue = sql`CAST(COALESCE(${sortValue}, '0') AS INTEGER)`;
        break;
      case "text":
      default:
        castedSortValue = sql`COALESCE(${sortValue}, '')`;
    }

    // Subquery to check if the custom field exists
    const hasCustomField = sql`EXISTS(SELECT 1 FROM ${customFields} WHERE task_id = ${tasks.id} AND name = ${fieldName})`;

    // Main query to fetch sorted task IDs
    const sortedTasksQuery = db
      .select({ id: tasks.id })
      .from(tasks)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(
        desc(hasCustomField), // Tasks with the custom field come first
        direction === "desc" ? desc(castedSortValue) : asc(castedSortValue), // Then sort by value
      )
      .limit(rowSize)
      .offset(offset);

    const sortedTaskIds = (await sortedTasksQuery).map((task) => task.id);

    if (sortedTaskIds.length > 0) {
      // Fetch full task data including custom fields
      const fullTasks = await db.query.tasks.findMany({
        where: inArray(tasks.id, sortedTaskIds),
        with: {
          customFields: true,
        },
      });

      // Reorder the tasks based on the sorted task IDs
      const taskMap = new Map(fullTasks.map((task) => [task.id, task]));
      dbData = sortedTaskIds.map((id) => taskMap.get(id)!);
    } else {
      dbData = [];
    }
  } else {
    // Regular task field sorting
    const orderBy =
      direction === "desc"
        ? desc(tasks[fieldName as keyof typeof tasks])
        : asc(tasks[fieldName as keyof typeof tasks]);

    dbData = await db.query.tasks.findMany({
      with: {
        customFields: true,
      },
      where: conditions.length ? and(...conditions) : undefined,
      offset,
      limit: rowSize,
      orderBy: fieldName ? orderBy : desc(tasks.createdAt),
    });
  }

  // Get total count for pagination
  const totalRes = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${tasks.id})`.mapWith(Number) })
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
        let lowerValue = value;
        if (type === "text") {
          lowerValue = (value as string).toLowerCase();
        }
        if (!acc[key].values.includes(lowerValue as string)) {
          acc[key].values.push(lowerValue as string);
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
          validedRequestBody.data.customFields.map((c) => {
            let value = c.value;

            if (c.type === "text") {
              value = String(value);
            } else if (c.type === "number") {
              value = Number(value);
            } else if (c.type === "checkbox") {
              value = Boolean(value);
            } else if (c.type === "dateTime") {
              value = new Date(value as string);
            }

            return {
              ...c,
              taskId: task[0]!.insertedId,
              value,
            };
          }),
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
