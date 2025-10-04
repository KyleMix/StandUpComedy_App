import { NextRequest, NextResponse } from "next/server";
import { runOpenMicIngestion } from "@/lib/openmics/ingest";
export async function POST(req: NextRequest) {
  if (req.headers.get("x-ingest-secret") !== process.env.INGEST_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await runOpenMicIngestion();
  return NextResponse.json({ ok: true });
}
