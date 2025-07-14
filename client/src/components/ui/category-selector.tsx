import { Button } from "./button";
import { Card, CardContent } from "./card";
import { Thermometer, Home, Bus, UserIcon, Dice1, List } from "lucide-react";

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategorySelector({ selectedCategory, onCategoryChange }: CategorySelectorProps) {
  const categories = [
    { id: 'health', name: '몸 상태', icon: Thermometer },
    { id: 'family', name: '가족 문제', icon: Home },
    { id: 'transport', name: '교통 문제', icon: Bus },
    { id: 'personal', name: '개인 사정', icon: UserIcon },
  ];

  const handleRandomCategory = () => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    onCategoryChange(randomCategory.id);
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-5">
        <h3 className="font-semibold text-[var(--navy)] mb-4 flex items-center">
          <List className="text-[var(--lavender)] mr-2" size={18} />
          상황 선택
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {categories.map((category) => {
            const IconComponent = category.icon;
            const isActive = selectedCategory === category.id;
            
            return (
              <Button
                key={category.id}
                variant="outline"
                onClick={() => onCategoryChange(category.id)}
                className={`category-btn h-auto p-3 flex flex-col items-center text-sm font-medium transition-all border-2 ${
                  isActive 
                    ? 'active bg-[var(--lavender)]/20 border-[var(--lavender)] text-[var(--lavender)]' 
                    : 'border-gray-200 text-[var(--navy)] hover:bg-[var(--lavender)]/10 hover:border-[var(--lavender)] hover:text-[var(--lavender)]'
                }`}
              >
                <IconComponent size={20} className="mb-2" />
                {category.name}
              </Button>
            );
          })}
        </div>
        <Button 
          onClick={handleRandomCategory}
          className="w-full mt-3 bg-gradient-to-r from-[var(--lavender)] to-purple-400 text-white hover:shadow-lg transition-all"
        >
          <Dice1 className="mr-2" size={16} />
          랜덤으로 선택
        </Button>
      </CardContent>
    </Card>
  );
}
