"use client";

import { useTransition, useState, useEffect } from "react";
import { createVisitLog } from "@/lib/actions/visitLogs";
import { getProductsByCustomer } from "@/lib/actions/products";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function VisitLogForm({ customersList }: { customersList: any[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillCustomerId = searchParams?.get("customerId") || "";
  const prefillProductId = searchParams?.get("productId") || "";

  const [isPending, startTransition] = useTransition();
  const [selectedCustomer, setSelectedCustomer] = useState(prefillCustomerId);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(prefillProductId ? [prefillProductId] : []);

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(customersList);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetch(`/api/customers/search?q=${searchQuery}`)
        .then(res => res.json())
        .then(data => setSearchResults(data))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (selectedCustomer) {
      getProductsByCustomer(selectedCustomer).then(setProducts);
    } else {
      setProducts([]);
    }
  }, [selectedCustomer]);

  const toggleProduct = (pid: string) => {
    setSelectedProducts(prev => 
      prev.includes(pid) ? prev.filter(id => id !== pid) : [...prev, pid]
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedProducts.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("productIds", JSON.stringify(selectedProducts));
    formData.append("customerId", selectedCustomer);
    
    startTransition(async () => {
      try {
        await createVisitLog(formData);
        toast.success("Visit Log created successfully!");
        router.push(`/logbook`);
      } catch (error) {
        toast.error("Failed to save log.");
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label htmlFor="visitDate">Date of Visit *</Label>
              <Input id="visitDate" name="visitDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitedBy">Visited By (Technician Name) *</Label>
              <Input id="visitedBy" name="visitedBy" required />
            </div>

            <div className="space-y-2 md:col-span-2 flex flex-col">
              <Label>Customer *</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm text-left font-normal hover:bg-gray-50 focus:outline-hidden focus:ring-2 focus:ring-ring"
                >
                  <span className="truncate">
                    {selectedCustomer
                      ? searchResults.find((c) => c._id === selectedCustomer)?.organization ||
                        customersList.find((c) => c._id === selectedCustomer)?.organization ||
                        "Selected Customer"
                      : "Select Customer..."}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-[300px] lg:w-[600px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput 
                      placeholder="Search customers..." 
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {searchResults.map((c) => (
                          <CommandItem
                            key={c._id}
                            value={c._id}
                            onSelect={(currentValue) => {
                              setSelectedCustomer(currentValue === selectedCustomer ? "" : currentValue);
                              setOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedCustomer === c._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {c.organization} ({c.customerName}) - {c.region}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <input type="hidden" name="customerId" value={selectedCustomer} />
            </div>

            {selectedCustomer && (
              <div className="space-y-3 md:col-span-2 border p-4 rounded-md">
                <Label>Products Addressed *</Label>
                {products.length === 0 ? <p className="text-sm text-gray-500">No products found for this customer.</p> : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {products.map(p => (
                      <div key={p._id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={p._id} 
                          checked={selectedProducts.includes(p._id)} 
                          onCheckedChange={() => toggleProduct(p._id)} 
                        />
                        <label htmlFor={p._id} className="text-sm cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {p.type} {p.rating ? `(${p.rating})` : ''} - S/N: {p.serialNo}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="complaintNo">Complaint Number (if applicable)</Label>
              <Input id="complaintNo" name="complaintNo" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintType">Complaint Type</Label>
              <Input id="complaintType" name="complaintType" placeholder="e.g., General, Software..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintDate">Complaint Date</Label>
              <Input id="complaintDate" name="complaintDate" type="date" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="Closed">
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="complaintDescription">Complaint Description</Label>
              <Input id="complaintDescription" name="complaintDescription" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="actionTaken">Action Taken *</Label>
              <Input id="actionTaken" name="actionTaken" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="note">Notes / Remarks</Label>
              <Input id="note" name="note" />
            </div>

          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isPending || selectedProducts.length===0}>
              {isPending ? "Saving..." : "Save Log"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
