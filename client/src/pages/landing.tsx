import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  KeyRound, 
  LogIn, 
  UserPlus, 
  Shield, 
  Lightbulb, 
  Heart,
  Users,
  Car,
  User,
  Eye,
  EyeOff
} from "lucide-react";

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [signupData, setSignupData] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    confirmPassword: "" 
  });
  const { toast } = useToast();
  const features = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: "몸 상태",
      description: "건강 관련 핑계를 자연스럽게 생성"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "가족 문제",
      description: "가족 상황을 고려한 적절한 핑계"
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: "교통 문제",
      description: "교통 상황 관련 핑계 제공"
    },
    {
      icon: <User className="h-6 w-6" />,
      title: "개인 사정",
      description: "개인적인 상황에 맞는 핑계"
    }
  ];

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
            <Dialog open={showAuth} onOpenChange={setShowAuth}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[var(--lavender)] text-[var(--lavender)] hover:bg-[var(--lavender)]/10"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  로그인
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button 
                  className="bg-[var(--lavender)] hover:bg-[var(--lavender)]/90 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  회원가입
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>ExcuseMe</DialogTitle>
                  <DialogDescription>
                    계정에 로그인하거나 새 계정을 만드세요.
                  </DialogDescription>
                </DialogHeader>
                <AuthTabs 
                  loginData={loginData}
                  setLoginData={setLoginData}
                  signupData={signupData}
                  setSignupData={setSignupData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  onClose={() => setShowAuth(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="w-20 h-20 bg-[var(--lavender)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-bold text-[var(--navy)] mb-4">
            상황별 수업 불참 핑계 생성기
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            AI가 도와주는 자연스럽고 믿을 만한 핑계를 만들어보세요. 
            상황에 맞는 톤과 내용으로 적절한 핑계를 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog open={showAuth} onOpenChange={setShowAuth}>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  className="bg-[var(--lavender)] hover:bg-[var(--lavender)]/90 text-white px-8"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  로그인하고 시작하기
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-[var(--lavender)] text-[var(--lavender)] hover:bg-[var(--lavender)]/10 px-8"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  무료 회원가입
                </Button>
              </DialogTrigger>
            </Dialog>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-[var(--navy)] text-center mb-8">
            다양한 상황별 핑계 제공
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                <CardHeader className="text-center pb-2">
                  <div className="w-12 h-12 bg-[var(--lavender)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-[var(--lavender)]">
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-[var(--navy)]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-16">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-[var(--lavender)] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[var(--navy)] mb-4">
              안전하고 신뢰할 수 있는 서비스
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              개인정보 보호를 최우선으로 하며, 사용자의 데이터는 안전하게 보호됩니다. 
              적절한 사용량 관리로 건전한 이용 문화를 지향합니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--lavender)] mb-2">AI 기반</div>
              <p className="text-gray-600">최신 AI 기술로 자연스러운 핑계 생성</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--lavender)] mb-2">맞춤형</div>
              <p className="text-gray-600">상황과 톤에 맞는 개인화된 핑계</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--lavender)] mb-2">사용량 관리</div>
              <p className="text-gray-600">적절한 사용을 위한 주간 사용량 추적</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-[var(--navy)] mb-4">
            지금 바로 시작해보세요!
          </h3>
          <p className="text-gray-600 mb-8">
            몇 분 안에 계정을 만들고 상황에 맞는 핑계를 생성할 수 있습니다.
          </p>
          <Dialog open={showAuth} onOpenChange={setShowAuth}>
            <DialogTrigger asChild>
              <Button 
                size="lg"
                className="bg-[var(--lavender)] hover:bg-[var(--lavender)]/90 text-white px-12"
              >
                <LogIn className="h-5 w-5 mr-2" />
                시작하기
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold text-[var(--navy)]">
                  ExcuseMe에 오신 것을 환영합니다
                </DialogTitle>
                <DialogDescription className="text-center text-gray-600">
                  계정을 만들거나 로그인하여 시작하세요
                </DialogDescription>
              </DialogHeader>
              <AuthTabs
                loginData={loginData}
                setLoginData={setLoginData}
                signupData={signupData}
                setSignupData={setSignupData}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                onClose={() => setShowAuth(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-[var(--lavender)] rounded-full flex items-center justify-center">
              <KeyRound className="text-white" size={12} />
            </div>
            <span className="text-[var(--navy)] font-semibold">ExcuseMe</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 ExcuseMe. 모든 권리 보유.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface AuthTabsProps {
  loginData: { username: string; password: string };
  setLoginData: (data: { username: string; password: string }) => void;
  signupData: { username: string; email: string; password: string; confirmPassword: string };
  setSignupData: (data: { username: string; email: string; password: string; confirmPassword: string }) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  onClose: () => void;
}

function AuthTabs({
  loginData,
  setLoginData,
  signupData,
  setSignupData,
  showPassword,
  setShowPassword,
  onClose
}: AuthTabsProps) {
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (data: { username: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/login', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "로그인 성공",
        description: "환영합니다!"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "로그인 실패",
        description: error.message || "아이디 또는 비밀번호가 잘못되었습니다.",
        variant: "destructive"
      });
    }
  });

  const signupMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string }) => {
      const response = await apiRequest('POST', '/api/auth/signup', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "회원가입 성공",
        description: "계정이 생성되었습니다. 로그인해주세요."
      });
      setSignupData({ username: "", email: "", password: "", confirmPassword: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "회원가입 실패",
        description: error.message || "회원가입 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({
        title: "입력 오류",
        description: "아이디와 비밀번호를 모두 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupData.username || !signupData.email || !signupData.password) {
      toast({
        title: "입력 오류",
        description: "모든 필드를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호가 일치하지 않습니다.",
        variant: "destructive"
      });
      return;
    }
    if (signupData.password.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 6자리 이상이어야 합니다.",
        variant: "destructive"
      });
      return;
    }
    signupMutation.mutate({
      username: signupData.username,
      email: signupData.email,
      password: signupData.password
    });
  };

  return (
    <Tabs defaultValue="login" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">로그인</TabsTrigger>
        <TabsTrigger value="signup">회원가입</TabsTrigger>
      </TabsList>
      
      <TabsContent value="login" className="space-y-4">
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-username">아이디</Label>
            <Input
              id="login-username"
              type="text"
              placeholder="아이디를 입력하세요"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">비밀번호</Label>
            <div className="relative">
              <Input
                id="login-password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                disabled={loginMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[var(--lavender)] hover:bg-[var(--lavender)]/90"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-username">아이디</Label>
            <Input
              id="signup-username"
              type="text"
              placeholder="아이디를 입력하세요"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              disabled={signupMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">이메일</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              disabled={signupMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">비밀번호</Label>
            <div className="relative">
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="비밀번호를 입력하세요 (6자리 이상)"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                disabled={signupMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-confirm">비밀번호 확인</Label>
            <Input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              placeholder="비밀번호를 다시 입력하세요"
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              disabled={signupMutation.isPending}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-[var(--lavender)] hover:bg-[var(--lavender)]/90"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? "회원가입 중..." : "회원가입"}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}