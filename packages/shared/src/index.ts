import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  display_name: z.string().min(1),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  company: z.string().optional().default(""),
  job_title: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  birthday: z.string().optional().nullable(),
});

export type Contact = z.infer<typeof contactSchema>;
