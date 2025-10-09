import { NextResponse } from "next/server";

const notImplemented = () =>
  NextResponse.json({ error: "Not implemented" }, { status: 501 });

export async function GET() {
  return notImplemented();
}

export async function PATCH() {
  return notImplemented();
}
