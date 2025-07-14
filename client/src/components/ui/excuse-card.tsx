import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Copy, Bookmark, RefreshCw, Edit } from "lucide-react";
import type { ExcuseResponse } from "@shared/schema";

interface ExcuseCardProps {
  excuse: ExcuseResponse;
  onCopy: (content: string) => void;
  onSave: (excuse: ExcuseResponse) => void;
  onRegenerate: () => void;
  isGenerating?: boolean;
}

export function ExcuseCard({ excuse, onCopy, onSave, onRegenerate, isGenerating }: ExcuseCardProps) {
  const getCategoryName = (category: string): string => {
    const names = {
      health: "몸 상태",
      family: "가족 문제", 
      transport: "교통 문제",
      personal: "개인 사정"
    };
    return names[category as keyof typeof names] || category;
  };

  const getToneName = (tone: string): string => {
    const names = {
      light: "가벼운",
      moderate: "적당한",
      serious: "진지한"
    };
    return names[tone as keyof typeof names] || tone;
  };

  return (
    <div className="space-y-3">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-[var(--lavender)] bg-[var(--lavender)]/10 px-2 py-1 rounded-full">
              {getCategoryName(excuse.category)} · {getToneName(excuse.tone)} 톤
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCopy(excuse.excuse)}
              className="text-gray-400 hover:text-[var(--coral)] h-auto p-1"
            >
              <Copy size={14} />
            </Button>
          </div>
          <p className="text-[var(--navy)] font-medium leading-relaxed">
            {excuse.excuse}
          </p>
        </CardContent>
      </Card>
      
      <div className="flex space-x-2">
        <Button 
          onClick={() => onSave(excuse)}
          className="bg-[var(--coral)] text-white hover:bg-[var(--coral)]/90 text-sm"
          size="sm"
        >
          <Bookmark className="mr-2" size={14} />
          저장
        </Button>
        <Button 
          onClick={onRegenerate}
          disabled={isGenerating}
          className="bg-[var(--lavender)] text-white hover:bg-[var(--lavender)]/90 text-sm"
          size="sm"
        >
          <RefreshCw className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} size={14} />
          다시 생성
        </Button>
        <Button 
          variant="outline"
          size="sm"
          className="border-[var(--lavender)] text-[var(--lavender)] hover:bg-[var(--lavender)]/10 text-sm"
        >
          <Edit className="mr-2" size={14} />
          수정
        </Button>
      </div>
    </div>
  );
}
