interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = "" }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className={`ppm-progress h-2 ${className}`}>
      <div 
        className="ppm-progress-bar h-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}