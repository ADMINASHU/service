import { getDashboardStats } from "@/lib/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Package, Activity, Battery, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getVisitLogs } from "@/lib/actions/visitLogs";
import { getDueVisits } from "@/lib/actions/amcTracker";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  
  const visitsResponse = await getVisitLogs(1, 10);
  const recentLogs = visitsResponse.logs;
  
  const allDue = await getDueVisits();
  const upcomingSchedules = allDue.dueVisits.slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Quick metrics and highlights of your service tracker.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AMC Action Needed</CardTitle>
            <Activity className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
            <Link href="/amc-tracker"><Button variant="outline" className="w-full mt-2" size="sm">View Tracker</Button></Link>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Products by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.productsByType.length === 0 && <p className="text-sm text-gray-500">No data</p>}
              {stats.productsByType.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t._id}</p>
                  <p className="text-sm text-muted-foreground">{t.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Battery Distributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.productsByBattery.length === 0 && <p className="text-sm text-gray-500">No data</p>}
              {stats.productsByBattery.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between">
                  <p className="text-sm font-medium">{t._id}</p>
                  <p className="text-sm text-muted-foreground">{t.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-indigo-100 bg-indigo-50/10">
          <CardHeader>
            <CardTitle className="text-indigo-700">Lifecycle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.productsByStatus.length === 0 && <p className="text-sm text-gray-500">No data</p>}
              {stats.productsByStatus.map((t: any) => (
                <div key={t._id} className="flex items-center justify-between">
                  <Badge variant="outline" className={
                    t._id === 'Warranty' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                    t._id === 'AMC' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 
                    'bg-slate-50 text-slate-700 border-slate-200'
                  }>
                    {t._id}
                  </Badge>
                  <p className="text-sm font-bold">{t.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" /> Action Needed (AMC Schedule)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">All caught up! No visits due.</p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((item: any) => (
                  <div key={item._id} className="p-3 border rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-semibold text-sm">{item.customer?.organization || "Unknown"}</div>
                      <Badge variant={item.daysToEnd < 7 ? "destructive" : "secondary"} className="text-[10px]">
                        {item.daysToEnd < 0 ? 'Overdue' : `${item.daysToEnd}d left`}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span>{item.type} • S/N: {item.serialNo}</span>
                      <Link href={`/logbook/new?customerId=${item.customerId}&productId=${item._id}`} className="text-blue-600 hover:underline">
                        Log Visit →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500" /> Recent Logbook Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent logs found.</p>
            ) : (
              <div className="space-y-3">
                {recentLogs.map((log: any) => (
                  <div key={log._id} className="p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium text-sm truncate pr-2" title={log.actionTaken}>
                        {log.actionTaken}
                      </div>
                      <span className="text-[10px] text-gray-500 whitespace-nowrap">
                        {new Date(log.visitDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-2">
                      <span className="truncate">{log.customerId?.organization || "Unknown"}</span>
                      <Badge variant="outline" className="text-[10px]">{log.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
