"use client";

import { useTransition } from "react";
import { createCustomer, updateCustomer } from "@/lib/actions/customers";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface CustomerFormProps {
  isAdmin: boolean;
  initialData?: any;
  organizations?: string[];
  regions?: string[];
  branches?: string[];
  states?: string[];
}

export function CustomerForm({ isAdmin, initialData, organizations = [], regions = [], branches = [], states = [] }: CustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        if (initialData) {
          await updateCustomer(initialData._id, formData);
          toast.success("Customer updated successfully!");
          router.push(`/customers/${initialData._id}`);
        } else {
          await createCustomer(formData);
          toast.success("Customer created successfully!");
          router.push("/customers");
        }
      } catch (error) {
        toast.error("Failed to save customer.");
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input id="customerName" name="customerName" required defaultValue={initialData?.customerName} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Select name="organization" required defaultValue={initialData?.organization}>
                <SelectTrigger><SelectValue placeholder="Select Organization" /></SelectTrigger>
                <SelectContent>
                  {organizations.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {isAdmin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select name="region" required defaultValue={initialData?.region}>
                    <SelectTrigger><SelectValue placeholder="Select Region" /></SelectTrigger>
                    <SelectContent>
                      {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="branch">Branch *</Label>
                  <Select name="branch" required defaultValue={initialData?.branch}>
                    <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Address *</Label>
              <Input id="address" name="address" required defaultValue={initialData?.address} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pinCode">Pin Code</Label>
              <Input id="pinCode" name="pinCode" defaultValue={initialData?.pinCode} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select name="state" defaultValue={initialData?.state}>
                <SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" disabled>None</SelectItem>
                  {states.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" name="district" defaultValue={initialData?.district} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPersonName">Contact Person</Label>
              <Input id="contactPersonName" name="contactPersonName" defaultValue={initialData?.contactPersonName} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNo">Contact No</Label>
              <Input id="contactNo" name="contactNo" defaultValue={initialData?.contactNo} />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
