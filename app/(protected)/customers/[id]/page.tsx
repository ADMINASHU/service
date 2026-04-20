import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { getProductsByCustomer } from "@/lib/actions/products";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  const customer = await Customer.findById(id).lean();
  if (!customer) return <div>Customer not found.</div>;

  const products = await getProductsByCustomer(id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Customer Details</h2>
        <Link href={`/customers/${id}/edit`}>
          <Button variant="outline">Edit Customer</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{customer.organization} - {customer.customerName}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Region/Branch</p>
            <p className="font-medium">{customer.region} / {customer.branch}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Person</p>
            <p className="font-medium">{customer.contactPersonName || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Contact Number</p>
            <p className="font-medium">{customer.contactNo || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Address</p>
            <p className="font-medium">{customer.address}, {customer.district}, {customer.state} {customer.pinCode}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <h3 className="text-xl font-bold tracking-tight">Products</h3>
        <Link href={`/customers/${id}/products/new`}>
          <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Serial No</TableHead>
              <TableHead>Rating/DC</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>AMC Freq</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24">No products recorded.</TableCell>
              </TableRow>
            )}
            {products.map((p: any) => (
              <TableRow key={p._id}>
                <TableCell className="font-medium">{p.type}</TableCell>
                <TableCell>
                  {p.serialNo}
                  {p.isAutoSerial && <Badge variant="secondary" className="ml-2 text-[10px]">AUTO</Badge>}
                </TableCell>
                <TableCell>{p.rating || "-"} / {p.dcVolt || "-"}</TableCell>
                <TableCell>{p.make || "-"}</TableCell>
                <TableCell className="capitalize">{p.visitFrequency || "None"}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/customers/${id}/products/${p._id}/edit`}>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
