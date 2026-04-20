"use client";

import { useTransition } from "react";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function ProductForm({ customerId, initialData, productTypes = [] }: { customerId: string, initialData?: any, productTypes?: string[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        if (initialData) {
          await updateProduct(initialData._id, formData, customerId);
          toast.success("Product updated successfully!");
        } else {
          await createProduct(customerId, formData);
          toast.success("Product created successfully!");
        }
        router.push(`/customers/${customerId}`);
      } catch (error) {
        toast.error("Failed to save product.");
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor="type">Product Type *</Label>
              <Select name="type" required defaultValue={initialData?.type}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {productTypes.map(pt => (
                    <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                  ))}
                  {productTypes.length === 0 && <SelectItem value="default" disabled>No types defined in Settings</SelectItem>}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serialNo">Serial Number</Label>
              <Input id="serialNo" name="serialNo" placeholder="Leave blank to auto-generate" defaultValue={initialData?.serialNo} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (e.g. 5KVA)</Label>
              <Input id="rating" name="rating" defaultValue={initialData?.rating} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dcVolt">DC Volt</Label>
              <Input id="dcVolt" name="dcVolt" defaultValue={initialData?.dcVolt} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ah">Battery AH</Label>
              <Input id="ah" name="ah" defaultValue={initialData?.ah} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input id="qty" name="qty" type="number" defaultValue={initialData?.qty || "1"} min="1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="make">Make / Brand</Label>
              <Input id="make" name="make" defaultValue={initialData?.make} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="installationDate">Installation Date</Label>
              <Input id="installationDate" name="installationDate" type="date" defaultValue={initialData?.installationDate ? new Date(initialData.installationDate).toISOString().split('T')[0] : ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warrantyPeriod">Warranty Period (Months)</Label>
              <Input id="warrantyPeriod" name="warrantyPeriod" type="number" defaultValue={initialData?.warrantyPeriod} />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-3 border-t my-2 pt-4">
              <h4 className="font-semibold text-sm">AMC Agreement Details</h4>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amcStartDate">AMC Start Date</Label>
              <Input id="amcStartDate" name="amcStartDate" type="date" defaultValue={initialData?.amcStartDate ? new Date(initialData.amcStartDate).toISOString().split('T')[0] : ""} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amcPeriod">AMC Period (Months)</Label>
              <Input id="amcPeriod" name="amcPeriod" type="number" defaultValue={initialData?.amcPeriod} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitFrequency">Visit Frequency</Label>
              <Select name="visitFrequency" defaultValue={initialData?.visitFrequency || "null"}>
                <SelectTrigger><SelectValue placeholder="No scheduled visits" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="half-yearly">Half Yearly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
