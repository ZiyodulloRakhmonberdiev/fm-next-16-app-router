import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email").min(3, "Email must be at least 3 characters").max(128, "Email must be less than 128 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  remember: z.boolean().default(true).optional(),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email").min(3, "Email must be at least 3 characters").max(128, "Email must be less than 128 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be less than 128 characters"),
  fullName: z.string().min(3, "Full name must be at least 3 characters").max(128, "Full name must be less than 128 characters"),
  phoneNumber: z.number().min(9, "Phone number must be at least 9 characters").max(24, "Phone number must be less than 24 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password and confirm password do not match",
  path: ["confirmPassword"],
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;