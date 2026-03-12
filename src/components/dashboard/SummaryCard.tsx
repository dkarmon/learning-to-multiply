// ABOUTME: Reusable metric card displaying a label and value.
// ABOUTME: Used on the dashboard overview for facts mastered, accuracy, etc.

interface SummaryCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
}

export function SummaryCard({ label, value, sublabel, color = '#06628d' }: SummaryCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col gap-1 min-w-[140px]">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-3xl font-bold" style={{ color }}>
        {value}
      </span>
      {sublabel && (
        <span className="text-xs text-gray-400">{sublabel}</span>
      )}
    </div>
  );
}
