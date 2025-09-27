import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const requests = await prisma.verificationRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Verification queue</h1>
      {requests.length === 0 ? (
        <p className="text-sm text-slate-600">No pending requests.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{request.user?.email ?? request.userId}</CardTitle>
                <Badge variant="outline">{request.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-600">
                <p>Role requested: {request.roleRequested}</p>
                <p>{request.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
