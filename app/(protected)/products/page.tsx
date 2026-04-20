import { getAllProducts } from "@/lib/actions/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, ChevronLeft, ChevronRight, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import { getProductStatus, getStatusColor } from "@/lib/utils/productStatus";

export default async function ProductsPage(props: { searchParams: Promise<{ page?: string, q?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const q = searchParams.q || "";
  const { products, total, pages } = await getAllProducts(page, 15, q);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">All Products</h2>
      </div>

      <Card className="p-4">
        <form method="GET" className="flex flex-col sm:flex-row gap-2">
          <Input name="q" placeholder="Search by type, S/N, or make..." defaultValue={q} className="max-w-sm" />
          <div className="flex gap-2">
            <Button type="submit" variant="secondary">Filter</Button>
            {q && <Link href="/products"><Button variant="ghost">Clear</Button></Link>}
          </div>
        </form>
      </Card>

      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Serial No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Rating/DC</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>AMC Freq</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center h-24">No products found.</TableCell>
              </TableRow>
            )}
            {products.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium">{p.type}</TableCell>
                <TableCell>
                  {p.serialNo}
                  {p.isAutoSerial && <Badge variant="secondary" className="ml-2 text-[10px]">AUTO</Badge>}
                </TableCell>
                <TableCell>
                  {p.customerId?.organization || "Unknown"}
                  <div className="text-xs text-muted-foreground">{p.customerId?.customerName}</div>
                </TableCell>
                <TableCell>{p.rating || "-"} / {p.dcVolt || "-"}</TableCell>
                <TableCell>{p.make || "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(getProductStatus(p))}>
                    {getProductStatus(p)}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{p.visitFrequency || "None"}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/customers/${p.customerId?._id}/products/${p._id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {products.length === 0 && (
          <div className="text-center p-8 bg-white border rounded">No products found.</div>
        )}
        {products.map((p: any) => (
          <Card key={p._id}>
            <CardContent className="p-4 flex flex-col gap-2 border-l-4 border-indigo-500">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-lg">{p.type} <span className="text-sm font-normal text-muted-foreground ml-1">({p.rating || '-'} / {p.dcVolt || '-'})</span></h4>
                  <p className="text-sm font-medium">S/N: {p.serialNo}</p>
                </div>
                {p.isAutoSerial && <Badge variant="secondary" className="text-[10px]">AUTO</Badge>}
              </div>
              <div className="flex gap-2">
                <Badge className={`${getStatusColor(getProductStatus(p))} text-[10px]`}>
                  {getProductStatus(p)}
                </Badge>
              </div>
              <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                <span className="block font-semibold text-gray-800">{p.customerId?.organization || "Unknown"}</span>
                <span className="block text-xs">{p.customerId?.customerName}</span>
              </div>
              <div className="flex justify-between items-end mt-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase"><Calendar className="w-3 h-3 inline mr-1"/>{p.visitFrequency || "No AMC"}</span>
                <Link href={`/customers/${p.customerId?._id}/products/${p._id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Pagination */}
      <Card className="p-4 bg-white/50 border-dashed mt-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{products.length}</span> of <span className="font-medium">{total}</span> products
          </p>
          <div className="flex gap-2">
            <Link href={`/products?page=${page - 1}&q=${q}`} className={page <= 1 ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page <= 1}><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
            </Link>
            <div className="flex items-center px-4 text-sm font-medium border rounded-md bg-white">
              Page {page} of {pages || 1}
            </div>
            <Link href={`/products?page=${page + 1}&q=${q}`} className={page >= pages ? "pointer-events-none opacity-50" : ""}>
              <Button variant="outline" size="sm" disabled={page >= pages}>Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
