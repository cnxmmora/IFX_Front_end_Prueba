import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const segments = [
  { name: "Marca A", value: 42, color: "#F11B67" },
  { name: "Marca B", value: 28, color: "#A855F7" },
  { name: "Marca C", value: 18, color: "#6366F1" },
  { name: "Otras", value: 12, color: "#8B7AAE" },
];

export function ShareDonut() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-2">
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={1}
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              {segments.map((s) => (
                <Cell key={s.name} fill={s.color} opacity={s.color === "#8B7AAE" ? 0.7 : 1} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="text-[28px] font-extrabold tracking-tight text-bivi-text leading-none">
            42%
          </div>
          <div className="text-bivi-muted mt-1 text-[10px] font-semibold tracking-[0.12em] uppercase">
            Líder
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-1">
        {segments.map((s, i) => (
          <div
            key={s.name}
            className={`flex items-center justify-between py-1.5 text-[12px] ${
              i < segments.length - 1 ? "border-bivi-border-soft border-b" : ""
            }`}
          >
            <span className="text-bivi-muted-2 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: s.color, opacity: s.color === "#8B7AAE" ? 0.7 : 1 }}
              />
              {s.name}
            </span>
            <span className="text-bivi-text font-bold">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
