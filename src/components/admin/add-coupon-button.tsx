"use client";

import { Plus } from "lucide-react";
import { toast } from "sonner";

export function AddCouponButton() {
  return (
    <button
      onClick={() =>
        toast("New coupon", {
          description: "Create a new discount code for your store.",
        })
      }
      className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-paper hover:bg-gold hover:text-white"
    >
      <Plus className="h-4 w-4" /> New coupon
    </button>
  );
}
