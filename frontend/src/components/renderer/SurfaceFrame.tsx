interface SurfaceFrameProps {
  width: number;
  height: number;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function SurfaceFrame({ width, height, label, children, className = '' }: SurfaceFrameProps) {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(width, height);
  const ratio = `${width / d}:${height / d}`;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div
        className="bg-white rounded-lg shadow-sm border border-surface-200 overflow-hidden relative"
        style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        {children}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-surface-700">{label}</p>
        <p className="text-[10px] text-surface-400">
          {width} × {height} px · Ratio {ratio}
        </p>
      </div>
    </div>
  );
}
