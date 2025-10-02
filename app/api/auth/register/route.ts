import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zodSchemas";
import { hash } from "bcryptjs";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const identifier = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anonymous";
  if (!rateLimit(`auth:register:${identifier}`)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const hashedPassword = await hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      hashedPassword,
      role: parsed.data.role
    }
  });

  return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 });
}
