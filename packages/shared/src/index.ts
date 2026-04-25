import { z } from "zod";

export * from "./phone-country";
export * from "./form-schemas";
export * from "./contact-helpers";

export const contactSchema = z.object({
  id: z.string().uuid().optional(),
  display_name: z.string().min(1),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().optional().default(""),
  first_name: z.string().optional().default(""),
  last_name: z.string().optional().default(""),
  company: z.string().optional().default(""),
  job_title: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  birthday: z.string().optional().nullable(),
});

export type Contact = z.infer<typeof contactSchema>;

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/, "Use a CSS hex color like #4f46e5");

export const labelCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  color: hexColor,
});

export type LabelCreate = z.infer<typeof labelCreateSchema>;
