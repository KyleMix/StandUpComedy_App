import { redirect } from "next/navigation";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/zodSchemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

async function register(formData: FormData) {
  "use server";
  const data = Object.fromEntries(formData.entries());
  const parsed = registerSchema.safeParse({
    name: data.name,
    email: data.email,
    password: data.password,
    role: data.role
  });
  if (!parsed.success) {
    throw new Error("Invalid registration details");
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

  if (parsed.data.role === "COMEDIAN") {
    await prisma.comedianProfile.create({
      data: {
        userId: user.id,
        stageName: parsed.data.name
      }
    });
  }

  redirect("/auth/sign-in");
}

export default async function SignUpPage({ searchParams }: { searchParams: { role?: string } }) {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={register} className="space-y-4">
          <Input name="name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required minLength={6} />
          <div>
            <label className="text-sm font-medium text-slate-700">Role</label>
            <select
              name="role"
              defaultValue={searchParams.role ?? "COMEDIAN"}
              className="mt-1 w-full rounded-md border border-slate-200 p-2 text-sm"
            >
              <option value="COMEDIAN">Comedian</option>
              <option value="PROMOTER">Promoter</option>
              <option value="VENUE">Venue</option>
              <option value="FAN">Fan</option>
            </select>
          </div>
          <Button type="submit" className="w-full">
            Sign up
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account? <a className="text-brand" href="/auth/sign-in">Sign in</a>
        </p>
      </CardContent>
    </Card>
  );
}
