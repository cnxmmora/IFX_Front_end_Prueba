import {
  AreaChart,
  Area,
  Line,
  LineChart,
  ComposedChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { mes: "Ago", marcaA: 58, marcaB: 48, marcaC: 38, prom: 47 },
  { mes: "Sep", marcaA: 61, marcaB: 50, marcaC: 36, prom: 49 },
  { mes: "Oct", marcaA: 64, marcaB: 53, marcaC: 39, prom: 52 },
  { mes: "Nov", marcaA: 68, marcaB: 55, marcaC: 38, prom: 54 },
  { mes: "Dic", marcaA: 71, marcaB: 58, marcaC: 41, prom: 56 },
  { mes: "Ene", marcaA: 74, marcaB: 60, marcaC: 42, prom: 58 },
  { mes: "Feb", marcaA: 78, marcaB: 64, marcaC: 44, prom: 60 },
];

export function LoyaltyLineChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="areaA" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F11B67" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#F11B67" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#ffffff" strokeOpacity={0.08} vertical={false} />
          <XAxis
            dataKey="mes"
            stroke="#8B7AAE"
            fontSize={10}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#8B7AAE"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              background: "#331C6E",
              border: "1px solid rgba(241,27,103,.3)",
              borderRadius: 8,
              fontSize: 12,
              color: "#F5EFFF",
            }}
            labelStyle={{ color: "#B8A8D8" }}
          />
          <Area
            type="monotone"
            dataKey="marcaA"
            stroke="#F11B67"
            strokeWidth={2.5}
            fill="url(#areaA)"
            name="Marca A"
          />
          <Line
            type="monotone"
            dataKey="marcaB"
            stroke="#A855F7"
            strokeWidth={2}
            dot={false}
            name="Marca B"
          />
          <Line
            type="monotone"
            dataKey="marcaC"
            stroke="#6366F1"
            strokeWidth={2}
            dot={false}
            name="Marca C"
          />
          <Line
            type="monotone"
            dataKey="prom"
            stroke="#8B7AAE"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            dot={false}
            name="Promedio"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Suppress unused warnings
void AreaChart;
void LineChart;
