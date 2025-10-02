import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/zodSchemas";
import { compare } from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const identifier = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
  if (!rateLimit(`auth:login:${identifier}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.hashedPassword) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const valid = await compare(parsed.data.password, user.hashedPassword);
  if (!valid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  return NextResponse.json({ user: { id: user.id, email: user.email } });
}
