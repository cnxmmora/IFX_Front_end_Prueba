export function Sparkline({ values }: { values: number[] }) {
  return (
    <div className="mt-3 flex h-[30px] items-end gap-[2px]">
      {values.map((v, i) => (
        <div
          key={i}
          className="bg-bivi-magenta flex-1 rounded-t-[2px] opacity-35"
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}
