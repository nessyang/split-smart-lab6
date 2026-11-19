import { NextResponse } from "next/server";
import { getBalances, parseGroupId } from "@/lib/splitsmart";
import { handleError } from "@/lib/http";

type Ctx = { params: Promise<{ groupId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const groupId = parseGroupId((await params).groupId);
    return NextResponse.json(await getBalances(groupId));
  } catch (error) {
    return handleError(error);
  }
}
