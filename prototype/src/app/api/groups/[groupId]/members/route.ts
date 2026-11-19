import { NextResponse } from "next/server";
import { addMember, listMembers, parseGroupId } from "@/lib/splitsmart";
import { handleError, readJson } from "@/lib/http";

type Ctx = { params: Promise<{ groupId: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  try {
    const groupId = parseGroupId((await params).groupId);
    return NextResponse.json({ members: await listMembers(groupId) });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request, { params }: Ctx) {
  try {
    const groupId = parseGroupId((await params).groupId);
    const member = await addMember(groupId, await readJson(request));
    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
