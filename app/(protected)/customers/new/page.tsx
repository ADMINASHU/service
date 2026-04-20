import { CustomerForm } from "@/components/customers/CustomerForm";
import { auth } from "@/lib/auth";
import { getSettings } from "@/lib/actions/settings";

export default async function NewCustomerPage(props: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const settings = await getSettings();
  
  const getValues = (key: string) => settings.find((s: any) => s.key === key)?.values || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Customer</h2>
        <p className="text-muted-foreground">
          Enter customer details below.
        </p>
      </div>

      <CustomerForm 
        isAdmin={isAdmin} 
        organizations={getValues("organizations")} 
        regions={getValues("regions")} 
        branches={getValues("branches")} 
        states={getValues("states") as string[]} 
      />
    </div>
  );
}
