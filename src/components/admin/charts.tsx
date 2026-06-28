"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const GOLD = "#b08a4f";
const INK = "#46413a";

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e8e3d8",
  background: "#fff",
  fontSize: 12,
};

export function RevenueAreaChart({
  data,
}: {
  data: { name: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
            <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} stroke="#8a8378" />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#8a8378" />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={GOLD}
          strokeWidth={2.5}
          fill="url(#rev)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CategoryBarChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
        <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} stroke="#8a8378" interval={0} angle={-20} textAnchor="end" height={60} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#8a8378" />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(176,138,79,0.08)" }} />
        <Bar dataKey="value" fill={GOLD} radius={[6, 6, 0, 0]} maxBarSize={42} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const DONUT = ["#b08a4f", "#46413a", "#c8a877", "#8a8378", "#98763f", "#d9bd92"];

export function StatusDonut({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={DONUT[i % DONUT.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { INK };
