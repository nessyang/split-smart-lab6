import { prisma } from "./prisma";
import { computeBalances } from "./balances";
import { parseAmountToCents, splitEvenly, ValidationError } from "./money";

export { ValidationError };

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

const NAME_MAX = 60;
const DESCRIPTION_MAX = 120;

function requireText(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ValidationError(`${label} is required.`);
  }
  const text = value.trim();
  if (text.length > max) throw new ValidationError(`${label} must be ${max} characters or fewer.`);
  return text;
}

function requireId(value: unknown, label: string): number {
  const id = typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  if (typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError(`${label} is not a valid ID.`);
  }
  return id;
}

export function parseGroupId(value: unknown): number {
  return requireId(value, "Group");
}

async function requireGroup(groupId: number) {
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) throw new NotFoundError(`Group ${groupId} does not exist.`);
  return group;
}

export async function listGroups() {
  const groups = await prisma.group.findMany({
    orderBy: { id: "asc" },
    include: { _count: { select: { members: true, expenses: true } } },
  });
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    createdAt: g.createdAt,
    memberCount: g._count.members,
    expenseCount: g._count.expenses,
  }));
}

export async function createGroup(input: { name?: unknown }) {
  const name = requireText(input.name, "Group name", NAME_MAX);
  return prisma.group.create({ data: { name } });
}

export async function listMembers(groupId: number) {
  await requireGroup(groupId);
  return prisma.member.findMany({ where: { groupId }, orderBy: { id: "asc" } });
}

export async function addMember(groupId: number, input: { name?: unknown }) {
  await requireGroup(groupId);
  const name = requireText(input.name, "Member name", NAME_MAX);
  const existing = await prisma.member.findFirst({ where: { groupId, name } });
  if (existing) throw new ValidationError(`"${name}" is already a member of this group.`);
  return prisma.member.create({ data: { groupId, name } });
}

export async function listExpenses(groupId: number) {
  await requireGroup(groupId);
  const expenses = await prisma.expense.findMany({
    where: { groupId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      payer: true,
      participants: { include: { member: true }, orderBy: { memberId: "asc" } },
    },
  });
  return expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amountCents: e.amountCents,
    createdAt: e.createdAt,
    payer: { id: e.payer.id, name: e.payer.name },
    participants: e.participants.map((p) => ({
      memberId: p.memberId,
      name: p.member.name,
      shareCents: p.shareCents,
    })),
  }));
}

export async function createExpense(
  groupId: number,
  input: { description?: unknown; amount?: unknown; payerId?: unknown; participantIds?: unknown },
) {
  await requireGroup(groupId);
  const description = requireText(input.description, "Description", DESCRIPTION_MAX);
  const amountCents = parseAmountToCents(input.amount);
  const payerId = requireId(input.payerId, "Payer");

  if (!Array.isArray(input.participantIds) || input.participantIds.length === 0) {
    throw new ValidationError("Select at least one participant.");
  }
  const participantIds = input.participantIds.map((id) => requireId(id, "Participant"));
  if (new Set(participantIds).size !== participantIds.length) {
    throw new ValidationError("Each participant can only be selected once.");
  }

  const members = await prisma.member.findMany({ where: { groupId }, select: { id: true } });
  const memberIds = new Set(members.map((m) => m.id));
  if (!memberIds.has(payerId)) {
    throw new ValidationError(`Payer (member ${payerId}) does not belong to this group.`);
  }
  const outsiders = participantIds.filter((id) => !memberIds.has(id));
  if (outsiders.length > 0) {
    throw new ValidationError(
      `Participant(s) ${outsiders.join(", ")} do not belong to this group.`,
    );
  }

  const shares = splitEvenly(amountCents, participantIds);
  const created = await prisma.expense.create({
    data: {
      groupId,
      description,
      amountCents,
      payerId,
      participants: {
        create: [...shares].map(([memberId, shareCents]) => ({ memberId, shareCents })),
      },
    },
  });
  return created;
}

export async function getBalances(groupId: number) {
  await requireGroup(groupId);
  const [members, expenses] = await Promise.all([
    prisma.member.findMany({ where: { groupId }, orderBy: { id: "asc" } }),
    prisma.expense.findMany({ where: { groupId }, include: { participants: true } }),
  ]);
  const balances = computeBalances(
    members.map((m) => m.id),
    expenses,
  );
  const rows = members.map((m) => ({ memberId: m.id, name: m.name, balanceCents: balances.get(m.id) ?? 0 }));
  const totalCents = rows.reduce((sum, r) => sum + r.balanceCents, 0);
  return { balances: rows, totalCents };
}
