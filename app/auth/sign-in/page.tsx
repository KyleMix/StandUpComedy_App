import { auth, signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

async function handleSignIn(formData: FormData) {
  "use server";
  const email = formData.get("email");
  const password = formData.get("password");
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Invalid credentials");
  }
  await signIn("credentials", {
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
        <p className="mt-4 text-center text-sm text-slate-600">
          Need an account? <a className="text-brand" href="/auth/sign-up">Sign up</a>
        </p>
      </CardContent>
    </Card>
  );
}
