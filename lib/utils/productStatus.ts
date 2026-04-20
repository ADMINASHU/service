export function getProductStatus(product: {
  installationDate?: Date | string | null;
  warrantyPeriod?: number | null;
  amcStartDate?: Date | string | null;
  amcPeriod?: number | null;
}) {
  const now = new Date();
  
  // 1. Warranty Check
  if (product.installationDate && product.warrantyPeriod) {
    const installDate = new Date(product.installationDate);
    const warrantyEndDate = new Date(installDate);
    // Add warranty months
    warrantyEndDate.setMonth(installDate.getMonth() + Number(product.warrantyPeriod));
    
    if (now <= warrantyEndDate) return "Warranty";
  }
  
  // 2. AMC Check (if Warranty is expired or not applicable)
  if (product.amcStartDate && product.amcPeriod) {
    const amcStart = new Date(product.amcStartDate);
    const amcEndDate = new Date(amcStart);
    // Add AMC months
    amcEndDate.setMonth(amcStart.getMonth() + Number(product.amcPeriod));
    
    if (now >= amcStart && now <= amcEndDate) return "AMC";
  }
  
  return "Expired";
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Warranty":
      return "bg-emerald-500 hover:bg-emerald-600 text-white border-none";
    case "AMC":
      return "bg-indigo-500 hover:bg-indigo-600 text-white border-none";
    default:
      return "bg-slate-500 hover:bg-slate-600 text-white border-none";
  }
}
