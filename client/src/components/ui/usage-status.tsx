import { Card, CardContent } from "./card";
import { Progress } from "./progress";
import { ChartLine } from "lucide-react";

interface UsageStatusProps {
  stats?: {
    count: number;
    warning: boolean;
  };
}

export function UsageStatus({ stats }: UsageStatusProps) {
  const count = stats?.count || 0;
  const maxCount = 5;
  const percentage = (count / maxCount) * 100;
  const isWarning = count >= 3;

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-5">
        <h3 className="font-semibold text-[var(--navy)] mb-3 flex items-center">
          <ChartLine className="text-[var(--lavender)] mr-2" size={18} />
          이번 주 사용량
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">{count}/{maxCount} 사용</span>
          {isWarning && (
            <span className="text-xs text-[var(--coral)] font-medium">주의 권장</span>
          )}
        </div>
        <Progress 
          value={percentage} 
          className="w-full h-2"
          style={{
            backgroundColor: 'hsl(0, 0%, 90%)'
          }}
        />

        <p className="text-xs text-gray-500 mt-2">
          너무 자주 사용하면 의심받을 수 있어요!
        </p>
      </CardContent>
    </Card>
  );
}
