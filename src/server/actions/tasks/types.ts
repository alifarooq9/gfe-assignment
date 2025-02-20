import { tasks } from "@/server/db/schema";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const tasksSelectSchema = createSelectSchema(tasks);
export type Task = z.infer<typeof tasksSelectSchema>;
