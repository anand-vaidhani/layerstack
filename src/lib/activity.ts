import { db } from "@/lib/db";

export type ActivityType =
  | "PROJECT_CREATED"
  | "PROJECT_DELETED"
  | "PROJECT_STATUS_CHANGED"
  | "MEMBER_INVITED"
  | "MEMBER_INVITE_REVOKED"
  | "MEMBER_JOINED"
  | "MEMBER_REMOVED"
  | "ROLE_CHANGED"
  | "PLAN_UPGRADED"
  | "PLAN_DOWNGRADED"
  | "ORG_RENAMED"
  | "PROFILE_UPDATED";

export async function logActivity(params: {
  organizationId: string;
  actorId?: string | null;
  type: ActivityType;
  message: string;
}): Promise<void> {
  await db.activity.create({
    data: {
      organizationId: params.organizationId,
      actorId: params.actorId ?? null,
      type: params.type,
      message: params.message,
    },
  });
}
