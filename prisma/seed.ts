/**
 * Demo seed data: two organizations with different plans to showcase
 * multi-tenancy, RBAC, plan gating and the dashboard chart.
 *
 * Run: npm run db:seed   (or `npx prisma migrate reset` to recreate + seed)
 *
 * All demo users share the password: password123
 */
import "dotenv/config";
import { randomBytes, scryptSync } from "crypto";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

const PASSWORD = hashPassword("password123");
const daysAgo = (n: number, hour = 10) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 24, 0, 0);
  return d;
};

async function main() {
  // Reset in dependency order (Invitation/Activity have no back-relations to wipe manually)
  await db.invitation.deleteMany();
  await db.activity.deleteMany();
  await db.project.deleteMany();
  await db.organizationUser.deleteMany();
  await db.organization.deleteMany();
  await db.user.deleteMany();

  // ---------- Users ----------
  const [ava, ben, cara, dan, eli] = await Promise.all([
    db.user.create({ data: { email: "ava@acme.test", name: "Ava Chen", passwordHash: PASSWORD, lastSignInAt: daysAgo(0, 9) } }),
    db.user.create({ data: { email: "ben@acme.test", name: "Ben Ortiz", passwordHash: PASSWORD, lastSignInAt: daysAgo(1) } }),
    db.user.create({ data: { email: "cara@globex.test", name: "Cara Diaz", passwordHash: PASSWORD, lastSignInAt: daysAgo(2) } }),
    db.user.create({ data: { email: "dan@globex.test", name: "Dan Whitfield", passwordHash: PASSWORD, lastSignInAt: daysAgo(4) } }),
    db.user.create({ data: { email: "eli@globex.test", name: "Eli Park", passwordHash: PASSWORD, lastSignInAt: daysAgo(6) } }),
  ]);

  // ---------- Organizations ----------
  const acme = await db.organization.create({
    data: {
      name: "Acme Inc",
      slug: "acme-inc",
      plan: "FREE",
      createdAt: daysAgo(45),
    },
  });
  const globex = await db.organization.create({
    data: {
      name: "Globex Corp",
      slug: "globex-corp",
      plan: "PRO",
      createdAt: daysAgo(60),
    },
  });

  // ---------- Memberships (Acme FREE: 2/2 members = at plan limit) ----------
  await db.organizationUser.createMany({
    data: [
      { userId: ava.id, organizationId: acme.id, role: "OWNER" },
      { userId: ben.id, organizationId: acme.id, role: "ADMIN" },
      // Ava also belongs to Globex as a MEMBER — proves org switching + RBAC
      { userId: ava.id, organizationId: globex.id, role: "MEMBER" },
      { userId: cara.id, organizationId: globex.id, role: "OWNER" },
      { userId: dan.id, organizationId: globex.id, role: "ADMIN" },
      { userId: eli.id, organizationId: globex.id, role: "MEMBER" },
    ],
  });

  // ---------- Projects (Acme FREE: 3/3 = at plan limit) ----------
  await db.project.createMany({
    data: [
      { title: "Website Redesign", status: "Active", organizationId: acme.id, createdAt: daysAgo(28), updatedAt: daysAgo(2) },
      { title: "Mobile App", status: "Paused", organizationId: acme.id, createdAt: daysAgo(14), updatedAt: daysAgo(5) },
      { title: "Billing Integration", status: "Active", organizationId: acme.id, createdAt: daysAgo(3), updatedAt: daysAgo(1) },
      { title: "Onboarding Flow", status: "Active", organizationId: globex.id, createdAt: daysAgo(29), updatedAt: daysAgo(3) },
      { title: "Analytics Engine", status: "Active", organizationId: globex.id, createdAt: daysAgo(22), updatedAt: daysAgo(2) },
      { title: "API Gateway", status: "Active", organizationId: globex.id, createdAt: daysAgo(18), updatedAt: daysAgo(6) },
      { title: "Design System", status: "Completed", organizationId: globex.id, createdAt: daysAgo(15), updatedAt: daysAgo(4) },
      { title: "Data Export", status: "Paused", organizationId: globex.id, createdAt: daysAgo(9), updatedAt: daysAgo(9) },
      { title: "SSO Support", status: "Active", organizationId: globex.id, createdAt: daysAgo(5), updatedAt: daysAgo(1) },
      { title: "Audit Logs", status: "Active", organizationId: globex.id, createdAt: daysAgo(1), updatedAt: daysAgo(1) },
    ],
  });

  // ---------- Pending invitation (Acme) ----------
  await db.invitation.create({
    data: {
      email: "nina@acme.test",
      role: "MEMBER",
      organizationId: acme.id,
      invitedById: ava.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: daysAgo(1),
    },
  });

  // ---------- Activity feed ----------
  await db.activity.createMany({
    data: [
      { organizationId: acme.id, actorId: ava.id, type: "MEMBER_JOINED", message: "Ava Chen created Acme Inc", createdAt: daysAgo(45) },
      { organizationId: acme.id, actorId: ava.id, type: "MEMBER_INVITED", message: "Ava Chen invited ben@acme.test as ADMIN", createdAt: daysAgo(44) },
      { organizationId: acme.id, actorId: ben.id, type: "MEMBER_JOINED", message: "Ben Ortiz joined as ADMIN", createdAt: daysAgo(43) },
      { organizationId: acme.id, actorId: ava.id, type: "PROJECT_CREATED", message: "Ava Chen created project “Website Redesign”", createdAt: daysAgo(28) },
      { organizationId: acme.id, actorId: ben.id, type: "PROJECT_CREATED", message: "Ben Ortiz created project “Mobile App”", createdAt: daysAgo(14) },
      { organizationId: acme.id, actorId: ben.id, type: "PROJECT_STATUS_CHANGED", message: "Ben Ortiz marked “Mobile App” as Paused", createdAt: daysAgo(5) },
      { organizationId: acme.id, actorId: ava.id, type: "PROJECT_CREATED", message: "Ava Chen created project “Billing Integration”", createdAt: daysAgo(3) },
      { organizationId: acme.id, actorId: ava.id, type: "MEMBER_INVITED", message: "Ava Chen invited nina@acme.test as MEMBER", createdAt: daysAgo(1) },
      { organizationId: globex.id, actorId: cara.id, type: "MEMBER_JOINED", message: "Cara Diaz created Globex Corp", createdAt: daysAgo(60) },
      { organizationId: globex.id, actorId: cara.id, type: "PLAN_UPGRADED", message: "Cara Diaz upgraded the workspace to Pro", createdAt: daysAgo(52) },
      { organizationId: globex.id, actorId: cara.id, type: "PROJECT_CREATED", message: "Cara Diaz created project “Onboarding Flow”", createdAt: daysAgo(29) },
      { organizationId: globex.id, actorId: dan.id, type: "PROJECT_CREATED", message: "Dan Whitfield created project “Analytics Engine”", createdAt: daysAgo(22) },
      { organizationId: globex.id, actorId: dan.id, type: "PROJECT_CREATED", message: "Dan Whitfield created project “API Gateway”", createdAt: daysAgo(18) },
      { organizationId: globex.id, actorId: eli.id, type: "ROLE_CHANGED", message: "Cara Diaz changed dan@globex.test’s role to ADMIN", createdAt: daysAgo(16) },
      { organizationId: globex.id, actorId: eli.id, type: "PROJECT_CREATED", message: "Eli Park created project “Design System”", createdAt: daysAgo(15) },
      { organizationId: globex.id, actorId: cara.id, type: "PROJECT_CREATED", message: "Cara Diaz created project “Data Export”", createdAt: daysAgo(9) },
      { organizationId: globex.id, actorId: dan.id, type: "PROJECT_CREATED", message: "Dan Whitfield created project “SSO Support”", createdAt: daysAgo(5) },
      { organizationId: globex.id, actorId: cara.id, type: "PROJECT_CREATED", message: "Cara Diaz created project “Audit Logs”", createdAt: daysAgo(1) },
    ],
  });

  console.log("✓ Seed complete");
  console.log("  Sign in: ava@acme.test / password123 (Acme Inc — FREE, owner)");
  console.log("          cara@globex.test / password123 (Globex Corp — PRO, owner)");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
