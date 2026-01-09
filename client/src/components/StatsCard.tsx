import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) {
  return (
    <div className={cn(
      "bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-full",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-3xl font-bold font-display text-foreground mt-1">{value}</p>
      </div>
    </div>
  );
}
