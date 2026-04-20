import { getDueVisits } from "@/lib/actions/amcTracker";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { getSettings } from "@/lib/actions/settings";
import { getProductStatus, getStatusColor } from "@/lib/utils/productStatus";
import { auth } from "@/lib/auth";

export default async function AMCTrackerPage(props: { searchParams: Promise<{ q?: string, page?: string, region?: string, branch?: string }> }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const page = Number(searchParams.page) || 1;
  const region = searchParams.region || "";
  const branch = searchParams.branch || "";

  const { dueVisits, total, pages } = await getDueVisits(page, 15, q, region, branch);
  
  const settings = await getSettings();
  const regions = settings.find((s: any) => s.key === "regions")?.values || [];
  const branches = settings.find((s: any) => s.key === "branches")?.values || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">AMC Service Tracker</h2>
      </div>

      <Card className="p-4 bg-white/50 border-dashed">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <Input name="q" placeholder="Search customer or product..." defaultValue={q} className="md:col-span-2 bg-white" />
          
          {isAdmin && (
            <>
              <select name="region" defaultValue={region} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                <option value="">All Regions</option>
                {regions.map((r: string) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select name="branch" defaultValue={branch} className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm">
                <option value="">All Branches</option>
                {branches.map((b: string) => <option key={b} value={b}>{b}</option>)}
              </select>
            </>
          )}

          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="flex-1">Filter</Button>
            {(q || region || branch) && <Link href="/amc-tracker"><Button type="button" variant="ghost">Clear</Button></Link>}
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
                    <div className="flex gap-1 mt-1">
                      <Badge variant="outline" className="capitalize text-[10px]">{item.visitFrequency}</Badge>
                      <Badge className={getStatusColor(getProductStatus(item)) + " text-[10px]"}>
                        {getProductStatus(item)}
                      </Badge>
                    </div>
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
                  <div className="flex gap-1 mt-1">
                    <Badge variant="outline" className="text-[10px] uppercase">{item.visitFrequency}</Badge>
                    <Badge className={getStatusColor(getProductStatus(item)) + " text-[10px]"}>
                      {getProductStatus(item)}
                    </Badge>
                  </div>
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
