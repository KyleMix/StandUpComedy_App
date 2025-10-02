import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createReport } from "@/lib/dataStore";

const reportSchema = z.object({
  targetType: z.enum(["USER", "THREAD", "GIG"]),
  targetId: z.string().min(1),
  reason: z.string().min(3),
  details: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = reportSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const report = await createReport({
    reporterId: session.user.id,
    targetType: parsed.data.targetType,
    targetId: parsed.data.targetId,
    reason: parsed.data.reason,
    details: parsed.data.details ?? null
  });

  return NextResponse.json({ report }, { status: 201 });
}
