import { z } from "zod";

export const authSignInSchema = z.object({
  email: z.string().trim().min(1, "Enter email.").email("Invalid email."),
  password: z.string().min(1, "Enter password."),
});

export type AuthSignInForm = z.infer<typeof authSignInSchema>;

export const authSignUpSchema = z.object({
  email: z.string().trim().min(1, "Enter email.").email("Invalid email."),
  password: z.string().min(6, "Use at least 6 characters."),
});

export type AuthSignUpForm = z.infer<typeof authSignUpSchema>;

/** Fields collected in contact create/edit forms (web + mobile). */
export const contactFormSchema = z.object({
  display_name: z.string().trim().min(1, "Name required."),
  email: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || z.string().email().safeParse(v).success, "Invalid email."),
  phone: z.string(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
