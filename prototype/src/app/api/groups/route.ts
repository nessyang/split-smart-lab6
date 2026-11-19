import { NextResponse } from "next/server";
import { createGroup, listGroups } from "@/lib/splitsmart";
import { handleError, readJson } from "@/lib/http";

export async function GET() {
  try {
    return NextResponse.json({ groups: await listGroups() });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const group = await createGroup(await readJson(request));
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
