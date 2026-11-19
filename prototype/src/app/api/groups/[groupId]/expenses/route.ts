import { NextResponse } from "next/server";
import { createExpense, listExpenses, parseGroupId } from "@/lib/splitsmart";
import { handleError, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ groupId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const groupId = parseGroupId((await params).groupId);
    return NextResponse.json({ expenses: await listExpenses(groupId) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const groupId = parseGroupId((await params).groupId);
    const expense = await createExpense(groupId, await readJson(request));
    return NextResponse.json({ expense }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
