import { MapPin, Plus, Pencil } from "lucide-react";

const sampleAddresses = [
  {
    id: "a1",
    label: "Home",
    fullName: "Alex Morgan",
    line1: "24 Park Lane, Apt 5",
    city: "London",
    zip: "W1K 1BE",
    country: "United Kingdom",
    phone: "+44 7700 000000",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Office",
    fullName: "Alex Morgan",
    line1: "1 Canada Square, Floor 32",
    city: "London",
    zip: "E14 5AB",
    country: "United Kingdom",
    phone: "+44 7700 000001",
    isDefault: false,
  },
];

export default function AddressesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold">Saved addresses</h2>
        <button className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-gold hover:text-white">
          <Plus className="h-4 w-4" /> Add address
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {sampleAddresses.map((a) => (
          <div key={a.id} className="relative rounded-2xl border border-border bg-card p-5">
            {a.isDefault && (
              <span className="absolute right-4 top-4 rounded-full bg-gold/15 px-2.5 py-0.5 text-xs font-semibold text-gold-strong">
                Default
              </span>
            )}
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="h-4 w-4 text-gold-strong" /> {a.label}
            </div>
            <div className="mt-3 space-y-0.5 text-sm text-ink-soft">
              <p className="font-medium text-ink">{a.fullName}</p>
              <p>{a.line1}</p>
              <p>
                {a.city}, {a.zip}
              </p>
              <p>{a.country}</p>
              <p>{a.phone}</p>
            </div>
            <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-gold-strong hover:underline">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
