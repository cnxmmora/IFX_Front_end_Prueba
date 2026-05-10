const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const PATTERN = [
  0.1, 0.05, 0.05, 0.05, 0.1, 0.15, 0.3, 0.6, 0.75, 0.65, 0.55, 0.7, 0.9, 0.85,
  0.7, 0.5, 0.55, 0.65, 0.85, 0.9, 0.8, 0.6, 0.4, 0.2,
];

// Deterministic pseudo-random so SSR/CSR match
function pseudo(d: number, h: number) {
  const x = Math.sin(d * 31 + h * 7) * 10000;
  return x - Math.floor(x);
}

export function Heatmap() {
  return (
    <div>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: "60px repeat(24, 1fr)" }}
      >
        {DAYS.map((day, di) => (
          <DayRow key={day} day={day} di={di} />
        ))}
      </div>
      <div
        className="mt-1.5 grid gap-[2px]"
        style={{ gridTemplateColumns: "60px repeat(24, 1fr)" }}
      >
        <span />
        {Array.from({ length: 24 }).map((_, h) => (
          <span
            key={h}
            className="text-bivi-muted text-center text-[9px]"
          >
            {h % 3 === 0 ? h : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function DayRow({ day, di }: { day: string; di: number }) {
  return (
    <>
      <div className="text-bivi-muted flex items-center pr-2 text-[10px] font-medium">
        {day}
      </div>
      {Array.from({ length: 24 }).map((_, h) => {
        let intensity = PATTERN[h];
        if (di >= 5) {
          intensity =
            h < 9
              ? intensity * 0.4
              : h > 10 && h < 20
                ? intensity * 1.2
                : intensity;
        }
        intensity = Math.min(1, intensity * (0.8 + pseudo(di, h) * 0.5));
        const alpha = 0.1 + intensity * 0.9;
        return (
          <div
            key={h}
            className="bg-bivi-bg-3 hover:scale-150 hover:z-10 relative aspect-square rounded-[2px] transition-transform"
            style={{ background: `rgba(241, 27, 103, ${alpha})` }}
            title={`${day} ${h}:00 — ${Math.round(intensity * 100)}% intensidad`}
          />
        );
      })}
    </>
  );
}
