import { VisitLogForm } from "@/components/logbook/VisitLogForm";
import { getCustomersList } from "@/lib/actions/customers";

export default async function NewLogbookPage() {
  const customersList = await getCustomersList();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Record Daily Visit</h2>
        <p className="text-muted-foreground">Select customer and addressed products to record the log.</p>
      </div>

      <VisitLogForm customersList={customersList} />
    </div>
  );
}
