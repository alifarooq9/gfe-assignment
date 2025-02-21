// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { relations, sql } from "drizzle-orm";
import { int, sqliteTableCreator, text, union } from "drizzle-orm/sqlite-core";
import { z } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `GFE-assignment_${name}`,
);

export const tasks = createTable("task", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  title: text("title", { length: 256 }).notNull(),
  priority: text("priority", {
    enum: ["low", "medium", "high", "urgent", "none"],
  })
    .$type<"low" | "medium" | "high" | "urgent" | "none">()
    .notNull()
    .default("none"),
  status: text("status", {
    enum: ["not_started", "in_progress", "completed"],
  })
    .$type<"not_started" | "in_progress" | "completed">()
    .notNull()
    .default("not_started"),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: int("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date(),
  ),
});

export const tasksRelations = relations(tasks, ({ many }) => ({
  customFields: many(customFields),
}));

export const customFields = createTable("custom_field", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  taskId: int("task_id", { mode: "number" })
    .references(() => tasks.id)
    .notNull(),
  name: text("name", { length: 128 }).notNull(),
  type: text("type", {
    enum: ["text", "number", "checkbox", "dateTime"],
  })
    .$type<"text" | "number" | "checkbox" | "dateTime">()
    .notNull(),
  value: text("value", { mode: "json" })
    .$type<string | number | boolean | Date>()
    .notNull(),
});

export const customFieldsRelations = relations(customFields, ({ one }) => ({
  task: one(tasks, { fields: [customFields.taskId], references: [tasks.id] }),
}));

export const createTaskSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 character long",
  }),
  priority: z
    .enum(["low", "medium", "high", "urgent", "none"], {
      message:
        "Priority must be one of the following: low, medium, high, urgent, none",
    })
    .default("none"),
  status: z
    .enum(["not_started", "in_progress", "completed"], {
      message:
        "Status must be one of the following: not_started, in_progress, completed",
    })
    .default("not_started"),
  customFields: z
    .array(
      z.object({
        name: z.string().min(1, "Field name is required"),
        type: z.enum(["text", "number", "checkbox", "dateTime"]),
        value: z.union([z.string(), z.number(), z.boolean(), z.date()]),
      }),
    )
    .optional(),
});
