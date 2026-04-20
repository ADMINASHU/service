import { getVisitLogs } from "@/lib/actions/visitLogs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";

import { getUsers } from "@/lib/actions/users";

export default async function LogbookPage(props: { searchParams: Promise<{ page?: string, q?: string, month?: string, year?: string, status?: string, visitedBy?: string }> }) {
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const month = searchParams.month === undefined ? currentMonth : searchParams.month;
  const year = searchParams.year === undefined ? currentYear : searchParams.year;
  const status = searchParams.status || "";
  const visitedBy = searchParams.visitedBy || "";

  const filters = { q, month, year, status, visitedBy };
  const { logs, total, pages } = await getVisitLogs(page, 15, filters);
  
  const { users } = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Visit Logbook</h2>
        <Link href="/logbook/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Record Visit</Button>
        </Link>
      </div>

      <Card className="p-4 bg-white/50 shadow-sm border-dashed">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
          <Input name="q" placeholder="Search text..." defaultValue={q} className="md:col-span-2 lg:col-span-3 bg-white" />
          
          <select name="month" defaultValue={month} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 md:col-span-2 lg:col-span-2">
            <option value="">All Months</option>
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>
          
          <select name="year" defaultValue={year} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 md:col-span-2 lg:col-span-2">
            <option value="">All Yrs</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          
          <select name="status" defaultValue={status} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 md:col-span-2 lg:col-span-2">
             <option value="">All Statuses</option>
             <option value="Open">Open</option>
             <option value="Closed">Closed</option>
             <option value="Pending">Pending</option>
             <option value="In Progress">In Progress</option>
          </select>

          <select name="visitedBy" defaultValue={visitedBy} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-700 md:col-span-2 lg:col-span-2">
             <option value="">All Engineers</option>
             {users.map((u: any) => (
               <option key={u.email} value={u.name}>{u.name}</option>
             ))}
          </select>

          <div className="flex gap-2 w-full md:col-span-2 lg:col-span-1">
            <Button type="submit" variant="secondary" className="w-full h-10 text-xs px-2 shadow-sm">Filter</Button>
            {(q || month || year || status || visitedBy) && (
              <Link href="/logbook" className="h-full">
                <Button type="button" variant="ghost" className="h-10 text-xs px-2 text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50" title="Clear Filters">X</Button>
              </Link>
            )}
          </div>
        </form>
      </Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24">
                  No visit logs recorded.
                </TableCell>
              </TableRow>
            )}
            {logs.map((log: any) => (
              <TableRow key={log._id}>
                <TableCell className="font-medium">
                  {new Date(log.visitDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <p className="font-medium">{log.customerId?.organization || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">{log.customerId?.customerName}</p>
                </TableCell>
                <TableCell>{log.visitedBy}</TableCell>
                <TableCell className="max-w-xs truncate">{log.actionTaken}</TableCell>
                <TableCell>
                  <Badge variant={log.status === 'Closed' ? 'default' : 'secondary'}>{log.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {logs.length === 0 && (
          <div className="text-center p-8 bg-white border rounded">No visit logs found.</div>
        )}
        {logs.map((log: any) => (
          <Card key={log._id}>
            <CardContent className="p-4 flex flex-col gap-2">
              <div className="flex justify-between items-start mb-1">
                 <div>
                    <h4 className="font-semibold text-sm">{log.actionTaken}</h4>
                    <span className="text-xs text-muted-foreground">{new Date(log.visitDate).toLocaleDateString()}</span>
                 </div>
                 <Badge variant="outline">{log.status}</Badge>
              </div>
              <p className="text-sm text-gray-700 font-medium">{log.customerId?.organization || "Unknown"}</p>
              {log.complaintNo && <p className="text-xs text-gray-500">Complaint: {log.complaintNo}</p>}
              <p className="text-xs text-gray-400 mt-2">Tech: {log.visitedBy}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Pagination */}
      <Card className="p-4 bg-white/50 border-dashed mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{logs.length}</span> of <span className="font-medium">{total}</span> logs
          </p>
          <div className="flex gap-2 text-gray-700">
            <Link href={`/logbook?page=${page - 1}&q=${q}&status=${status}&visitedBy=${visitedBy}&month=${month}&year=${year}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page <= 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
            </Link>
            <div className="flex items-center px-4 text-sm font-medium border rounded-md bg-white">
              Page {page} of {pages || 1}
            </div>
            <Link href={`/logbook?page=${page + 1}&q=${q}&status=${status}&visitedBy=${visitedBy}&month=${month}&year=${year}`} className={page >= pages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page >= pages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
