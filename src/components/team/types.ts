import type { Role } from "@/generated/prisma/client";

export type TeamRow =
  | {
      kind: "member";
      id: string;
      name: string | null;
      email: string;
      role: Role;
      isSelf: boolean;
      lastSignInAt: string | null;
    }
  | {
      kind: "invite";
      id: string;
      email: string;
      role: Role;
      token: string;
      expiresAt: string;
    };

export type MemberRow = Extract<TeamRow, { kind: "member" }>;
export type InviteRow = Extract<TeamRow, { kind: "invite" }>;
