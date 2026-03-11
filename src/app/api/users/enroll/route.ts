import { loginUser } from "@/features/users/api/login-user";
import { toFloat32Array } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { faceId?: unknown } | null;
    const faceId = body?.faceId;

    if (!faceId) {
      return NextResponse.json({ error: "faceId is required" }, { status: 400 });
    }

    const parsedFaceId = toFloat32Array(faceId);
    if (!parsedFaceId) {
      return NextResponse.json(
        { error: "faceId must be a JSON array of numbers" },
        { status: 400 },
      );
    }

    const user = await loginUser(parsedFaceId);
    return NextResponse.json({ userId: user.id, faceId: user.faceId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unexpected error" },
      { status: 500 },
    );
  }
}

