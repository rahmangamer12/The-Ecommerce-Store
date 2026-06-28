import { sampleOrders } from "@/data/orders";
import { formatPrice, formatDate } from "@/lib/utils";
import { siteConfig } from "@/config/site";

type CustomerRow = {
  name: string;
  email: string;
  orders: number;
  spent: number;
  last: string;
};

export default function AdminCustomersPage() {
  // Aggregate customers from orders.
  const map = new Map<string, CustomerRow>();
  for (const o of sampleOrders) {
    const existing = map.get(o.customerEmail);
    if (existing) {
      existing.orders += 1;
      existing.spent += o.total;
      if (o.date > existing.last) existing.last = o.date;
    } else {
      map.set(o.customerEmail, {
        name: o.customerName,
        email: o.customerEmail,
        orders: 1,
        spent: o.total,
        last: o.date,
      });
    }
  }
  const customers = [...map.values()].sort((a, b) => b.spent - a.spent);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="mt-1 text-sm text-muted">
          Everyone who has placed an order with your store.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border bg-paper-2 text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Last order</th>
              <th className="px-4 py-3 text-right font-medium">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.email} className="hover:bg-ink/[0.02]">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-paper-2 text-sm font-semibold">
                      {c.name.charAt(0)}
                    </span>
                    <span className="font-medium">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink-soft">{c.email}</td>
                <td className="px-4 py-3 text-ink-soft">{c.orders}</td>
                <td className="px-4 py-3 text-ink-soft">{formatDate(c.last)}</td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatPrice(c.spent, siteConfig.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
