import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import type { Organization, OrganizationUser, Role, User } from "@/generated/prisma/client";

const SESSION_COOKIE = "layerstack_session";
const ACTIVE_ORG_COOKIE = "layerstack_org";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type SessionPayload = { uid: string; exp: number };

function authSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not set. Copy .env.example to .env and configure it.");
  }
  return secret;
}

function sign(body: string): string {
  return createHmac("sha256", authSecret()).update(body).digest("base64url");
}

function createToken(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string): SessionPayload | null {
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(sign(body));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
    if (typeof payload.uid !== "string" || typeof payload.exp !== "number") return null;
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Password hashing — scrypt with a random salt (format: salt:hash). */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export async function createSession(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createToken({ uid: userId, exp: Date.now() + SESSION_TTL_MS }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(ACTIVE_ORG_COOKIE);
}

/** Returns the signed-in user, or null when there is no valid session. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return db.user.findUnique({ where: { id: payload.uid } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** True when the user belongs to at least one organization. */
export async function userHasOrg(userId: string): Promise<boolean> {
  const count = await db.organizationUser.count({ where: { userId } });
  return count > 0;
}

export type OrgMembership = OrganizationUser & { organization: Organization };

export type SessionContext = {
  user: User;
  org: Organization;
  membership: OrganizationUser;
  role: Role;
  memberships: OrgMembership[];
};

/**
 * Resolves the signed-in user together with their active organization.
 * The active org is stored in a cookie and validated against membership;
 * falls back to the first organization the user belongs to.
 */
export async function requireOrgContext(): Promise<SessionContext> {
  const user = await requireUser();
  const memberships = await db.organizationUser.findMany({
    where: { userId: user.id },
    include: { organization: true },
    orderBy: { organization: { createdAt: "asc" } },
  });
  if (memberships.length === 0) {
    // Not /sign-in or /sign-up: signed-in users are redirected away from
    // those pages, which would loop forever for a zero-membership account.
    redirect("/no-workspace");
  }
  const jar = await cookies();
  const activeOrgId = jar.get(ACTIVE_ORG_COOKIE)?.value;
  const cookieMatch = memberships.find((m) => m.organizationId === activeOrgId);
  // Default to an org the user owns, then the oldest membership
  const active =
    cookieMatch ?? memberships.find((m) => m.role === "OWNER") ?? memberships[0];
  return {
    user,
    org: active.organization,
    membership: active,
    role: active.role,
    memberships,
  };
}
