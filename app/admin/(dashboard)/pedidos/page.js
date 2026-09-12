import { readStore } from "@/lib/store";
import CrmBoard from "@/components/admin/crm-board";

export default async function AdminOrdersPage() {
  const data = await readStore();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-deep-900">Pedidos · CRM</h1>
      <p className="mt-1 mb-6 text-sm text-brand-deep-900/60">
        Arrastra las tarjetas entre columnas, da clic para ver el detalle, y escribe por WhatsApp
        para hacer remarketing directo con cada clienta.
      </p>
      <CrmBoard initialOrders={data.orders || []} storeName={data.settings.storeName} />
    </div>
  );
}
