import { CustomerForm } from "@/components/customers/CustomerForm";
import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/actions/settings";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  
  await connectToDatabase();
  const customer = await Customer.findById(id).lean();
  const settings = await getSettings();
  const getValues = (key: string) => settings.find((s: any) => s.key === key)?.values || [];
  
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Customer</h2>
        <p className="text-muted-foreground">Modify the details for {customer.customerName}.</p>
      </div>

      <CustomerForm 
        isAdmin={session?.user?.role === "admin"} 
        initialData={JSON.parse(JSON.stringify(customer))} 
        organizations={getValues("organizations")}
        regions={getValues("regions")}
        branches={getValues("branches")}
        states={getValues("states")}
      />
    </div>
  );
}
