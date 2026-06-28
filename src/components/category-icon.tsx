import {
  Cpu,
  Headphones,
  Lamp,
  Shirt,
  Watch,
  Sparkles,
  Mountain,
  HeartPulse,
  Tag,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Cpu,
  Headphones,
  Lamp,
  Shirt,
  Watch,
  Sparkles,
  Mountain,
  HeartPulse,
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = map[name] ?? Tag;
  return <Icon className={className} />;
}
