import { ProductForm } from "@/components/products/ProductForm";
import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { getSettings } from "@/lib/actions/settings";

export default async function NewProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  await connectToDatabase();
  const customer = await Customer.findById(id).lean();
  const settings = await getSettings();
  const productTypes = settings.find((s: any) => s.key === "productTypes")?.values || [];
  
  if (!customer) return <div>Customer not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Product</h2>
        <p className="text-muted-foreground">
          Registering a new product for <span className="font-medium text-foreground">{customer.customerName}</span>.
        </p>
      </div>

      <ProductForm customerId={id} productTypes={productTypes} />
    </div>
  );
}
