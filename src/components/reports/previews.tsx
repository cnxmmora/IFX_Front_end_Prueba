import type { ReactNode } from "react";

const barColor = "var(--gradient-main)";

export function PreviewBars({ heights }: { heights: number[] }) {
  return (
    <div className="absolute inset-4 flex items-end gap-1">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-[3px] opacity-60"
          style={{ height: `${h}%`, background: barColor }}
        />
      ))}
    </div>
  );
}

export function PreviewSvg({ children }: { children: ReactNode }) {
  return (
    <svg
      className="absolute inset-4"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
    >
      {children}
    </svg>
  );
}

export const previews = {
  bars1: <PreviewBars heights={[40, 55, 35, 70, 60, 85, 75, 95, 80, 100]} />,
  geoLine: (
    <PreviewSvg>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%" stopColor="#F11B67" />
          <stop offset="100%" stopColor="#3F228B" />
        </linearGradient>
      </defs>
      <path
        d="M0,80 L20,70 L40,75 L60,55 L80,60 L100,40 L120,45 L140,30 L160,25 L180,15 L200,20"
        stroke="url(#g1)"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0,80 L20,70 L40,75 L60,55 L80,60 L100,40 L120,45 L140,30 L160,25 L180,15 L200,20 L200,100 L0,100 Z"
        fill="url(#g1)"
        opacity=".2"
      />
    </PreviewSvg>
  ),
  bubbles: (
    <PreviewSvg>
      <circle cx="50" cy="50" r="20" fill="none" stroke="#F11B67" strokeWidth="1.5" opacity=".7" />
      <circle cx="80" cy="55" r="25" fill="none" stroke="#901A6A" strokeWidth="1.5" opacity=".7" />
      <circle cx="120" cy="45" r="30" fill="none" stroke="#3F228B" strokeWidth="1.5" opacity=".7" />
      <circle cx="160" cy="50" r="18" fill="none" stroke="#F11B67" strokeWidth="1.5" opacity=".7" />
      <circle cx="50" cy="50" r="8" fill="#F11B67" opacity=".6" />
      <circle cx="80" cy="55" r="12" fill="#901A6A" opacity=".6" />
      <circle cx="120" cy="45" r="16" fill="#3F228B" opacity=".6" />
      <circle cx="160" cy="50" r="6" fill="#F11B67" opacity=".6" />
    </PreviewSvg>
  ),
  bars2: <PreviewBars heights={[15, 25, 45, 85, 70, 50, 40, 75, 90, 60, 35, 20]} />,
  curve: (
    <PreviewSvg>
      <defs>
        <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F11B67" stopOpacity=".5" />
          <stop offset="100%" stopColor="#F11B67" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M0,70 Q30,40 60,50 T120,45 T200,30 L200,100 L0,100 Z" fill="url(#g2)" />
      <path d="M0,70 Q30,40 60,50 T120,45 T200,30" stroke="#F11B67" strokeWidth="2" fill="none" />
      <circle cx="40" cy="55" r="3" fill="#F11B67" />
      <circle cx="90" cy="47" r="3" fill="#F11B67" />
      <circle cx="150" cy="38" r="3" fill="#F11B67" />
    </PreviewSvg>
  ),
  doubleLine: (
    <PreviewSvg>
      <path d="M0,20 L40,35 L70,30 L100,55 L130,50 L170,75 L200,80" stroke="#F11B67" strokeWidth="2" fill="none" />
      <path
        d="M0,40 L40,50 L70,45 L100,70 L130,68 L170,85 L200,88"
        stroke="#3F228B"
        strokeWidth="2"
        fill="none"
        opacity=".7"
      />
    </PreviewSvg>
  ),
  target: (
    <PreviewSvg>
      <circle cx="100" cy="50" r="38" fill="none" stroke="#F11B67" strokeWidth="1.5" opacity=".4" />
      <circle cx="100" cy="50" r="26" fill="none" stroke="#F11B67" strokeWidth="1.5" opacity=".6" />
      <circle cx="100" cy="50" r="14" fill="none" stroke="#F11B67" strokeWidth="1.5" opacity=".8" />
      <circle cx="100" cy="50" r="5" fill="#F11B67" />
      <circle cx="130" cy="35" r="3" fill="#3F228B" />
      <circle cx="70" cy="60" r="3" fill="#901A6A" />
      <circle cx="115" cy="70" r="3" fill="#3F228B" />
    </PreviewSvg>
  ),
  bars3: <PreviewBars heights={[30, 45, 40, 60, 50, 70, 65, 85, 75, 95]} />,
  digital: (
    <PreviewSvg>
      <path d="M0,60 C40,50 60,70 100,55 S160,40 200,50" stroke="#F11B67" strokeWidth="2" fill="none" />
      <path
        d="M0,60 C40,50 60,70 100,55 S160,40 200,50 L200,100 L0,100 Z"
        fill="#F11B67"
        opacity=".15"
      />
      <path d="M0,75 C40,65 60,80 100,75 S160,65 200,72" stroke="#3F228B" strokeWidth="2" fill="none" />
    </PreviewSvg>
  ),
};
