import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Bookmark } from "lucide-react";
import type { Excuse } from "@shared/schema";

interface SavedExcusesProps {
  excuses: Excuse[];
  onCopyExcuse: (content: string) => void;
}

export function SavedExcuses({ excuses, onCopyExcuse }: SavedExcusesProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘 사용';
    if (diffDays === 1) return '1일 전 사용';
    if (diffDays < 7) return `${diffDays}일 전 사용`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주일 전 사용`;
    return `${Math.floor(diffDays / 30)}개월 전 사용`;
  };

  const getCategoryName = (category: string): string => {
    const names = {
      health: "몸살 관련",
      family: "가족 문제", 
      transport: "교통 문제",
      personal: "개인 사정"
    };
    return names[category as keyof typeof names] || category;
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-5">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center">
          <Bookmark className="text-[var(--lavender)] mr-2" size={18} />
          저장된 핑계
        </h3>
        <div className="space-y-2">
          {excuses.slice(0, 3).map((excuse) => (
            <Button
              key={excuse.id}
              variant="ghost"
              onClick={() => onCopyExcuse(excuse.content)}
              className="w-full text-left p-3 h-auto rounded-lg hover:bg-[var(--lavender)]/5 border border-gray-200 hover:border-[var(--lavender)]/30 transition-all"
            >
              <div className="text-sm text-[var(--navy)] font-medium truncate">
                {getCategoryName(excuse.category)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTimeAgo(excuse.createdAt)}
              </div>
            </Button>
          ))}
          
          {excuses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              아직 저장된 핑계가 없습니다
            </p>
          )}
        </div>
        
        {excuses.length > 3 && (
          <Button 
            variant="ghost"
            className="w-full mt-3 text-[var(--lavender)] text-sm font-medium hover:text-purple-600 transition-colors"
          >
            + 더 보기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
