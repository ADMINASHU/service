import { getCustomers } from "@/lib/actions/customers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

export default async function CustomersPage(props: { searchParams: Promise<{ page?: string, q?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const { customers, total, pages } = await getCustomers(page, 15, q);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <Link href="/customers/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Add Customer
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-col sm:flex-row gap-2">
          <Input name="q" placeholder="Search by name, org, or contact no..." defaultValue={q} className="max-w-sm" />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            {q && <Link href="/customers"><Button variant="ghost">Clear</Button></Link>}
          </div>
        </form>
      </Card>

      <Card className="hidden md:block">
        <div className="rounded-md border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Region / Branch</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    No customers found.
                  </TableCell>
                </TableRow>
              )}
              {customers.map((c: any) => (
                <TableRow key={c._id}>
                  <TableCell className="font-medium">{c.organization}</TableCell>
                  <TableCell>
                    <Link href={`/customers/${c._id}`} className="text-blue-600 hover:underline">
                      {c.customerName}
                    </Link>
                  </TableCell>
                  <TableCell>{c.contactPersonName || "-"}</TableCell>
                  <TableCell>{c.contactNo || "-"}</TableCell>
                  <TableCell>{c.region} / {c.branch}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/customers/${c._id}/edit`}>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {customers.length === 0 && (
          <div className="text-center p-8 bg-white border rounded">No customers found.</div>
        )}
        {customers.map((c: any) => (
          <Card key={c._id}>
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <h4 className="font-semibold">{c.organization} ({c.customerName})</h4>
                <p className="text-sm text-gray-600">{c.contactPersonName} - {c.contactNo}</p>
                <p className="text-xs text-gray-500 mt-1">{c.region} / {c.branch}</p>
              </div>
              <Link href={`/customers/${c._id}`}>
                <Button variant="outline" size="sm">View</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Card className="p-4 bg-white/50 border-dashed mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{customers.length}</span> of <span className="font-medium">{total}</span> customers
          </p>
          <div className="flex gap-2">
            <Link href={`/customers?page=${page - 1}&q=${q}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page <= 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
            </Link>
            <div className="flex items-center px-4 text-sm font-medium border rounded-md bg-white">
              Page {page} of {pages || 1}
            </div>
            <Link href={`/customers?page=${page + 1}&q=${q}`} className={page >= pages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page >= pages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
