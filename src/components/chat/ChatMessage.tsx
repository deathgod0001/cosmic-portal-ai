
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import KamiVoice from '@/components/voice/KamiVoice';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string;
};

interface ChatMessageProps {
  message: Message;
  modelName: string;
}

const ChatMessage = ({ message, modelName }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = useState(false);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        setIsCopied(true);
        toast.success("Message copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy message");
      });
  };
  
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 180, damping: 15 }}
    >
      <motion.div 
        className={`relative max-w-[85%] rounded-lg p-4 ${
          isUser 
            ? 'bg-primary/20 border border-primary/30 hover:bg-primary/25 transition-all' 
            : 'bg-cosmic-light/50 border border-cosmic-accent/30 hover:bg-cosmic-light/60 transition-all'
        }`}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={copyToClipboard}
            className="p-1 rounded-full hover:bg-cosmic-light/30"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isCopied ? (
              <Check size={14} className="text-green-500" />
            ) : (
              <Copy size={14} className="text-muted-foreground" />
            )}
          </motion.button>
        </div>
        
        {!isUser && (
          <div className="flex items-center justify-between mb-2">
            <motion.div 
              className="text-xs text-neon-cyan font-medium"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {modelName}
            </motion.div>
            <div className="ml-4">
              <KamiVoice text={message.content} />
            </div>
          </div>
        )}
        
        <div className="whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
          {message.content}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatMessage;
