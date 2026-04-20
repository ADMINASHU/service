import { auth } from "@/lib/auth";
import { getUsers } from "@/lib/actions/users";
import { redirect } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { getSettings } from "@/lib/actions/settings";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function UsersPage(props: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/dashboard");
  }

  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const { users, total, pages } = await getUsers(page, 15, q);
  
  const settings = await getSettings();
  const regions = settings.find((s: any) => s.key === "regions")?.values || [];
  const branches = settings.find((s: any) => s.key === "branches")?.values || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Administration</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and branch access.</p>
        </div>
        <UserFormDialog regions={regions} branches={branches} />
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-col sm:flex-row gap-2">
          <Input name="q" placeholder="Search users by name, email, region..." defaultValue={q} className="max-w-sm" />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            {q && <Link href="/users"><Button variant="ghost">Clear</Button></Link>}
          </div>
        </form>
      </Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Region/Branch Control</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u: any) => (
              <TableRow key={u._id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant={u.role === 'admin' ? 'destructive' : 'secondary'}>{u.role}</Badge>
                </TableCell>
                <TableCell>{u.role === 'admin' ? 'ALL ACCESS' : `${u.region} / ${u.branch}`}</TableCell>
                <TableCell>
                  <Badge variant={u.isActive ? 'default' : 'outline'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.length === 0 && (
          <div className="text-center p-8 bg-white border rounded">No users found.</div>
        )}
        {users.map((u: any) => (
          <Card key={u._id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{u.name}</h4>
                <p className="text-sm text-muted-foreground">{u.email}</p>
                {(u.region || u.branch) && (
                  <p className="text-xs text-muted-foreground mt-1 bg-gray-50 inline-block px-2 py-1 rounded">
                    {u.region || "-"} / {u.branch || "-"}
                  </p>
                )}
              </div>
              <Badge variant={u.role === 'admin' ? "default" : "secondary"}>{u.role}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Card className="p-4 bg-white/50 border-dashed">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{users.length}</span> of <span className="font-medium">{total}</span> users
          </p>
          <div className="flex gap-2">
            <Link href={`/users?page=${page - 1}&q=${q}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page <= 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
            </Link>
            <div className="flex items-center px-4 text-sm font-medium border rounded-md bg-white">
              Page {page} of {pages || 1}
            </div>
            <Link href={`/users?page=${page + 1}&q=${q}`} className={page >= pages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page >= pages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
