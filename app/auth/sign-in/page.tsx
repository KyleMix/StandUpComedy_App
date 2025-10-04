import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth, signIn } from "@/lib/auth";

async function handleSignIn(formData: FormData) {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid credentials");
  }
  await signIn({
    email,
    password,
    redirectTo: "/dashboard"
  });
}

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSignIn} className="space-y-4">
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <p className="font-medium text-slate-700">Testing credentials</p>
          <p className="mt-1">
            <span className="font-semibold">Email:</span> master@thefunny.local
          </p>
          <p>
            <span className="font-semibold">Password:</span> TestingMaster!123
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-slate-400">
            Always use the master tester account during manual QA.
          </p>
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">
          Need an account?{" "}
          <Link className="font-medium text-brand" href="/auth/sign-up/comedian">
            Join as a comedian
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
