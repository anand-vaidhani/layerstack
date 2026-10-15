import type { Role } from "@/generated/prisma/client";
import type { MemberRow } from "./types";

/** Only owners and admins can invite/remove teammates. */
export function canInvite(viewerRole: Role): boolean {
  return viewerRole !== "MEMBER";
}

/** OWNER can edit anyone but themselves; ADMIN can edit MEMBER rows only. */
export function canEditRole(viewerRole: Role, row: MemberRow): boolean {
  if (row.isSelf) return false;
  if (viewerRole === "OWNER") return true;
  if (viewerRole === "ADMIN") return row.role === "MEMBER";
  return false;
}

/** Roles the viewer may grant — admins can manage members but never grant/keep owner. */
export function allowedRoles(viewerRole: Role): Role[] {
  if (viewerRole === "OWNER") return ["OWNER", "ADMIN", "MEMBER"];
  return ["ADMIN", "MEMBER"];
}
