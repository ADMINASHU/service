import { ProductForm } from "@/components/products/ProductForm";
import connectToDatabase from "@/lib/db";
import Customer from "@/lib/models/Customer";
import { getProductById } from "@/lib/actions/products";
import { getSettings } from "@/lib/actions/settings";

export default async function EditProductPage({ params }: { params: Promise<{ id: string, productId: string }> }) {
  const { id, productId } = await params;
  
  await connectToDatabase();
  const customer = await Customer.findById(id).lean();
  const product = await getProductById(productId);
  const settings = await getSettings();
  const productTypes = settings.find((s: any) => s.key === "productTypes")?.values || [];
  
  if (!customer) return <div>Customer not found</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Product</h2>
        <p className="text-muted-foreground">
          Updating <span className="font-medium text-foreground">{product.type} ({product.serialNo})</span> for <span className="font-medium text-foreground">{customer.customerName}</span>.
        </p>
      </div>

      <ProductForm customerId={id} initialData={product} productTypes={productTypes} />
    </div>
  );
}
