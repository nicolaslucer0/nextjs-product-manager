import { ReactNode } from "react";

type StatsCardProps = {
  readonly title: string;
  readonly value: number;
  readonly icon: ReactNode;
  readonly bgColor: string;
  readonly textColor: string;
};

export default function StatsCard({
  title,
  value,
  icon,
  bgColor,
  textColor,
}: StatsCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/60 mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className={`${bgColor} rounded-full p-3`}>
          <svg
            className={`w-8 h-8 ${textColor}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
}
