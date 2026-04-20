import { getDueVisits } from "@/lib/actions/amcTracker";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function AMCTrackerPage(props: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const { dueVisits, total, pages } = await getDueVisits(page, 15, q);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">AMC Service Tracker</h2>
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-col sm:flex-row gap-2">
          <Input name="q" placeholder="Search by org, product type, or S/N..." defaultValue={q} className="max-w-sm" />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            {q && <Link href="/amc-tracker"><Button variant="ghost">Clear</Button></Link>}
          </div>
        </form>
      </Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Urgency</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Product details</TableHead>
              <TableHead>Interval</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dueVisits.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  No visits due right now! All caught up.
                </TableCell>
              </TableRow>
            )}
            {dueVisits.map((item: any) => {
              const isCritical = item.daysToEnd <= 7;
              
              return (
                <TableRow key={item._id}>
                  <TableCell>
                    <Badge variant={isCritical ? "destructive" : "secondary"}>
                      {item.daysToEnd < 0 ? 'Overdue' : `${item.daysToEnd} days left`}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.customer.organization}</p>
                    <p className="text-xs text-muted-foreground">{item.customer.customerName}</p>
                    <p className="text-xs text-muted-foreground">{item.customer.region} / {item.customer.branch}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{item.customer.contactNo}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{item.type} {item.rating ? `(${item.rating})` : ''}</p>
                    <p className="text-xs text-muted-foreground">S/N: {item.serialNo}</p>
                    <Badge variant="outline" className="mt-1 capitalize text-[10px]">{item.visitFrequency}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(item.intervalStart).toLocaleDateString()} to</p>
                    <p className="text-sm">{new Date(item.intervalEnd).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/logbook/new?customerId=${item.customerId}&productId=${item._id}`}>
                      <Button size="sm">Log Visit</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {dueVisits.length === 0 && (
          <div className="text-center p-8 bg-white border rounded">All caught up! No visits due.</div>
        )}
        {dueVisits.map((item: any) => (
          <Card key={item._id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{item.customer?.organization || "Unknown"}</h4>
                  <p className="text-xs text-muted-foreground">{item.type} • S/N: {item.serialNo}</p>
                </div>
                <Badge variant={item.daysToEnd < 7 ? "destructive" : "secondary"} className="whitespace-nowrap ml-2">
                  {item.daysToEnd < 0 ? 'Overdue' : `${item.daysToEnd} days left`}
                </Badge>
              </div>
              <Link href={`/logbook/new?customerId=${item.customerId}&productId=${item._id}`} className="mt-3 block w-full">
                <Button variant="outline" className="w-full" size="sm">Log Visit →</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <Card className="p-4 bg-white/50 border-dashed mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{dueVisits.length}</span> of <span className="font-medium">{total}</span> items
          </p>
          <div className="flex gap-2">
            <Link href={`/amc-tracker?page=${page - 1}&q=${q}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page <= 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
            </Link>
            <div className="flex items-center px-4 text-sm font-medium border rounded-md bg-white">
              Page {page} of {pages || 1}
            </div>
            <Link href={`/amc-tracker?page=${page + 1}&q=${q}`} className={page >= pages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page >= pages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
