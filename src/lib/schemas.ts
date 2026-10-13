import { z } from "zod";

export const signInSchema = z.object({
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  email: z.email("Enter a valid email").toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  organizationName: z.string().trim().min(2, "Organization name must be at least 2 characters").max(60),
});

export const createProjectSchema = z.object({
  title: z.string().trim().min(2, "Project title must be at least 2 characters").max(80),
  status: z.enum(["Active", "Paused", "Completed"]).default("Active"),
});

export const inviteMemberSchema = z.object({
  email: z.email("Enter a valid email").toLowerCase(),
  role: z.enum(["ADMIN", "MEMBER"]),
});

export const changeRoleSchema = z.object({
  membershipId: z.string().min(1, "Missing member"),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]),
});

export const removeMemberSchema = z.object({
  membershipId: z.string().min(1, "Missing member"),
});

export const updateOrgSchema = z.object({
  name: z.string().trim().min(2, "Organization name must be at least 2 characters").max(60),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters").max(100),
});
