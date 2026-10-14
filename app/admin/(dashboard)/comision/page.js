import { readStore } from "@/lib/store";
import { computeCommission } from "@/lib/commission";
import CommissionDashboard from "@/components/admin/commission-dashboard";

export default async function CommissionPage() {
  const data = await readStore();
  const commission = computeCommission(data);

  return <CommissionDashboard commission={commission} settings={data.settings} />;
}
