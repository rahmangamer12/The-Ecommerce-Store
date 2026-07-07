import { ShoppingCart } from "lucide-react";
import { AdminOrderRow } from "@/components/admin/order-row";
import { getAllOrders } from "@/lib/order-queries";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="mt-1 text-sm text-muted">
          Real orders from your store. Click one to view details and update its status.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-paper-2">
            <ShoppingCart className="h-7 w-7 text-muted" />
          </div>
          <h2 className="mt-5 font-display text-xl font-semibold">No orders yet</h2>
          <p className="mt-2 max-w-sm text-sm text-muted">
            Orders placed through checkout will appear here for you to fulfil.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <AdminOrderRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
