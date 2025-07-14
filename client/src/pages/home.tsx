import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  KeyRound, 
  Bot, 
  User, 
  ChartLine,
  List,
  Thermometer,
  Home,
  Bus,
  UserIcon,
  Dice1,
  SlidersHorizontal,
  Bookmark,
  Copy,
  RefreshCw,
  Edit,
  Lightbulb,
  Send,
  Shield,
  RotateCcw,
  LogIn,
  LogOut,
  UserCheck
} from "lucide-react";
import { ChatMessage } from "@/components/ui/chat-message";
import { CategorySelector } from "@/components/ui/category-selector";
import { ExcuseCard } from "@/components/ui/excuse-card";
import { UsageStatus } from "@/components/ui/usage-status";
import { SavedExcuses } from "@/components/ui/saved-excuses";
import type { ExcuseRequest, ExcuseResponse } from "@shared/schema";

export default function HomePage() {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("health");
  const [selectedTone, setSelectedTone] = useState<string>("light");
  const [userInput, setUserInput] = useState("");
  const [currentExcuse, setCurrentExcuse] = useState<ExcuseResponse | null>(null);
  const [messages, setMessages] = useState<Array<{
    type: 'bot' | 'user';
    content: string;
    excuse?: ExcuseResponse;
  }>>([
    {
      type: 'bot',
      content: '안녕하세요! 👋 ExcuseMe입니다. 어떤 상황에서 수업을 빠져야 하시나요? 상황을 선택하시거나 구체적으로 말씀해 주세요!'
    }
  ]);

  const { data: usageStats } = useQuery({
    queryKey: ['/api/usage/current-week'],
  });

  const { data: bookmarkedExcuses } = useQuery({
    queryKey: ['/api/excuses/bookmarked'],
  });

  const generateExcuseMutation = useMutation({
    mutationFn: async (request: ExcuseRequest) => {
      const response = await apiRequest('POST', '/api/generate-excuse', request);
      return response.json();
    },
    onSuccess: (data: ExcuseResponse) => {
      setCurrentExcuse(data);
      setMessages(prev => [
        ...prev,
        {
          type: 'bot',
          content: `${getCategoryName(data.category)} 관련 핑계를 생성했어요! 자연스럽게 사용해 보세요 😊`,
          excuse: data
        }
      ]);
      queryClient.invalidateQueries({ queryKey: ['/api/usage/current-week'] });
    },
    onError: () => {
      toast({
        title: "오류",
        description: "핑계 생성에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: number; bookmarked: boolean }) => {
      const response = await apiRequest('PATCH', `/api/excuses/${id}/bookmark`, { bookmarked });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "성공",
        description: "핑계가 저장되었습니다!"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/excuses/bookmarked'] });
    }
  });

  const clearExcusesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('DELETE', '/api/excuses/clear');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "초기화 완료",
        description: "핑계 기록이 모두 삭제되었습니다."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/excuses/bookmarked'] });
      queryClient.invalidateQueries({ queryKey: ['/api/usage/current-week'] });
      setMessages([{
        type: 'bot',
        content: '안녕하세요! 👋 ExcuseMe입니다. 어떤 상황에서 수업을 빠져야 하시나요? 상황을 선택하시거나 구체적으로 말씀해 주세요!'
      }]);
      setCurrentExcuse(null);
    },
    onError: () => {
      toast({
        title: "오류",
        description: "초기화에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateExcuse = () => {
    if (!userInput.trim()) {
      toast({
        title: "입력 필요",
        description: "구체적인 상황을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    const userMessage = userInput;
    setMessages(prev => [...prev, {
      type: 'user',
      content: userMessage
    }]);

    generateExcuseMutation.mutate({
      category: selectedCategory as any,
      tone: selectedTone as any,
      userInput: userMessage
    });

    setUserInput("");
  };

  const handleCopyExcuse = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "복사 완료",
      description: "핑계가 클립보드에 복사되었습니다!"
    });
  };

  const handleSaveExcuse = (excuse: ExcuseResponse) => {
    bookmarkMutation.mutate({ id: excuse.id, bookmarked: true });
  };

  const handleRegenerateExcuse = () => {
    if (currentExcuse) {
      generateExcuseMutation.mutate({
        category: selectedCategory as any,
        tone: selectedTone as any,
        userInput: "다시 생성해주세요"
      });
    }
  };

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
    <div className="bg-cream min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[var(--lavender)] rounded-full flex items-center justify-center">
              <KeyRound className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--navy)]">ExcuseMe</h1>
              <p className="text-sm text-gray-500">당신의 작은 비밀 친구</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-[var(--lavender)]/10"
              onClick={() => clearExcusesMutation.mutate()}
              disabled={clearExcusesMutation.isPending}
              title="초기화"
            >
              <RotateCcw className="text-[var(--lavender)]" size={20} />
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-600 flex items-center space-x-1">
                  <UserCheck className="h-3 w-3" />
                  <span>{user?.email || "로그인됨"}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full hover:bg-[var(--lavender)]/10"
                  onClick={async () => {
                    try {
                      await apiRequest('POST', '/api/auth/logout');
                      queryClient.clear();
                      toast({
                        title: "로그아웃 완료",
                        description: "성공적으로 로그아웃되었습니다."
                      });
                      // 로그아웃 후 즉시 로그인 전 상태로 변경
                      window.location.reload();
                    } catch (error) {
                      toast({
                        title: "로그아웃 실패",
                        description: "로그아웃 중 오류가 발생했습니다.",
                        variant: "destructive"
                      });
                    }
                  }}
                  title="로그아웃"
                >
                  <LogOut className="text-[var(--lavender)]" size={20} />
                </Button>
              </div>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-[var(--lavender)]/10"
                onClick={() => window.location.href = '/api/login'}
                title="로그인"
              >
                <LogIn className="text-[var(--lavender)]" size={20} />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          <UsageStatus stats={usageStats} />
          
          <CategorySelector 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Tone Control */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-5">
              <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center">
                <SlidersHorizontal className="text-[var(--lavender)] mr-2" size={18} />
                톤 조절
              </h3>
              <RadioGroup value={selectedTone} onValueChange={setSelectedTone} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="light" id="light" className="text-[var(--lavender)] border-[var(--lavender)]" />
                  <Label htmlFor="light" className="text-sm text-[var(--navy)] cursor-pointer">가벼운 핑계</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="moderate" id="moderate" className="text-[var(--lavender)] border-[var(--lavender)]" />
                  <Label htmlFor="moderate" className="text-sm text-[var(--navy)] cursor-pointer">적당한 사유</Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="serious" id="serious" className="text-[var(--lavender)] border-[var(--lavender)]" />
                  <Label htmlFor="serious" className="text-sm text-[var(--navy)] cursor-pointer">진지한 사유</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          <SavedExcuses excuses={bookmarkedExcuses || []} onCopyExcuse={handleCopyExcuse} />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Messages */}
          <Card className="shadow-sm border border-gray-200 flex-1 mb-4">
            <CardContent className="p-6">
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={index}
                    type={message.type}
                    content={message.content}
                    excuse={message.excuse}
                    onCopy={handleCopyExcuse}
                    onSave={handleSaveExcuse}
                    onRegenerate={handleRegenerateExcuse}
                    isGenerating={generateExcuseMutation.isPending}
                  />
                ))}

                {/* Tips Message */}
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-[var(--lavender)] rounded-full flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="text-white" size={16} />
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-2xl rounded-tl-md p-4 max-w-md">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 사용 팁:</strong> 같은 핑계를 너무 자주 사용하지 마세요. 다양한 상황을 번갈아 사용하는 것이 좋아요!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="구체적인 상황을 입력해주세요... (예: 내일 3교시 영어 수업)"
                  className="flex-1 border-gray-200 focus:border-[var(--lavender)] focus:ring-[var(--lavender)]/20"
                  onKeyPress={(e) => e.key === 'Enter' && handleGenerateExcuse()}
                />
                <Button 
                  onClick={handleGenerateExcuse}
                  disabled={generateExcuseMutation.isPending || !userInput.trim()}
                  className="bg-[var(--lavender)] hover:bg-[var(--lavender)]/90 text-white"
                >
                  <Send size={16} />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>AI가 상황에 맞는 자연스러운 핑계를 생성해드려요</span>
                <span className="flex items-center space-x-1">
                  <Shield className="text-[var(--lavender)]" size={12} />
                  <span>안전한 사용</span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
