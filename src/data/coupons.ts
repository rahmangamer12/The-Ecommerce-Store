import type { Coupon } from "@/types";

/** Demo coupons. Try them at checkout. Manage real ones in the admin panel. */
export const coupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 10,
    description: "10% off your first order",
    active: true,
  },
  {
    code: "LUXE25",
    type: "fixed",
    value: 25,
    minSubtotal: 150,
    description: "$25 off orders over $150",
    active: true,
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    description: "Free worldwide shipping",
    active: true,
  },
];

export function findCoupon(code: string): Coupon | null {
  const c = coupons.find(
    (x) => x.code.toLowerCase() === code.trim().toLowerCase() && x.active,
  );
  return c ?? null;
}
