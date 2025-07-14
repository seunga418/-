import { Bot, User } from "lucide-react";
import { ExcuseCard } from "./excuse-card";
import type { ExcuseResponse } from "@shared/schema";

interface ChatMessageProps {
  type: 'bot' | 'user';
  content: string;
  excuse?: ExcuseResponse;
  onCopy?: (content: string) => void;
  onSave?: (excuse: ExcuseResponse) => void;
  onRegenerate?: () => void;
  isGenerating?: boolean;
}

export function ChatMessage({ 
  type, 
  content, 
  excuse, 
  onCopy, 
  onSave, 
  onRegenerate,
  isGenerating 
}: ChatMessageProps) {
  return (
    <div className={`flex items-start space-x-3 ${type === 'user' ? 'justify-end' : ''}`}>
      {type === 'bot' && (
        <div className="w-8 h-8 bg-[var(--lavender)] rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="text-white" size={16} />
        </div>
      )}
      
      <div className={`space-y-3 ${type === 'user' ? 'flex-1 flex justify-end' : 'flex-1'}`}>
        <div className={`p-4 max-w-md ${
          type === 'bot' 
            ? 'chat-message-bot' 
            : 'chat-message-user'
        }`}>
          <p className={`text-sm ${type === 'bot' ? 'text-[var(--navy)]' : 'text-white'}`}>
            {content}
          </p>
        </div>
        
        {excuse && onCopy && onSave && onRegenerate && (
          <ExcuseCard 
            excuse={excuse}
            onCopy={onCopy}
            onSave={onSave}
            onRegenerate={onRegenerate}
            isGenerating={isGenerating}
          />
        )}
      </div>

      {type === 'user' && (
        <div className="w-8 h-8 bg-[var(--navy)] rounded-full flex items-center justify-center flex-shrink-0">
          <User className="text-white" size={16} />
        </div>
      )}
    </div>
  );
}
