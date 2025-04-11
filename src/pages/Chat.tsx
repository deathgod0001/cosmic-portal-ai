
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatMessage from '@/components/chat/ChatMessage';
import { Loader2, Download, Trash2, Settings, Brain } from 'lucide-react';
import KamiVoice from '@/components/voice/KamiVoice';
import KamiImage from '@/components/image/KamiImage';
import KamiSettings from '@/components/settings/KamiSettings';
import SpeechService from '@/services/SpeechService';
import BackgroundPlayer from '@/components/audio/BackgroundPlayer';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model: string;
};

type AIModel = {
  id: string;
  name: string;
  description: string;
  puterConfig: {
    model: string;
    responseExtractor?: (response: any) => string;
    useContext: boolean;
  };
};

declare global {
  interface Window {
    puter: any;
  }
}

const availableModels: AIModel[] = [
  { 
    id: 'gpt-4o', 
    name: 'GPT-4o', 
    description: 'OpenAI\'s most advanced model',
    puterConfig: {
      model: 'gpt-4o',
      responseExtractor: (response: any) => {
        if (typeof response === 'string') return response;
        return response?.message?.content || JSON.stringify(response);
      },
      useContext: true
    }
  },
  { 
    id: 'claude-3-7-sonnet', 
    name: 'Claude 3.7', 
    description: 'Anthropic\'s latest AI assistant',
    puterConfig: {
      model: 'claude-3-7-sonnet',
      responseExtractor: (response: any) => {
        if (typeof response === 'string') return response;
        return response?.message?.content?.[0]?.text || JSON.stringify(response);
      },
      useContext: true
    }
  },
  { 
    id: 'meta-llama/llama-3.3-70b-instruct', 
    name: 'Llama 3.3', 
    description: 'Meta\'s open-source model',
    puterConfig: {
      model: 'meta-llama/llama-3.3-70b-instruct',
      responseExtractor: (response: any) => {
        if (typeof response === 'string') return response;
        return response?.message?.content || JSON.stringify(response);
      },
      useContext: true
    }
  },
  { 
    id: 'deepseek-reasoner', 
    name: 'DeepSeek', 
    description: 'Advanced reasoning AI system',
    puterConfig: {
      model: 'deepseek-reasoner',
      responseExtractor: (response: any) => {
        if (typeof response === 'string') return response;
        return response?.text || JSON.stringify(response);
      },
      useContext: true
    }
  },
  { 
    id: 'google/gemini-2.5-pro-exp-03-25:free', 
    name: 'Gemini 2.5 Pro', 
    description: 'Google\'s multimodal AI model',
    puterConfig: {
      model: 'google/gemini-2.5-pro-exp-03-25:free',
      responseExtractor: (response: any) => {
        if (typeof response === 'string') return response;
        return response?.message?.content || JSON.stringify(response);
      },
      useContext: true
    }
  },
];

const KamiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(availableModels[0].id);
  const [currentTab, setCurrentTab] = useState<'chat' | 'image'>('chat');
  const [lastAssistantMessage, setLastAssistantMessage] = useState<Message | null>(null);
  const [contextMode, setContextMode] = useState<'full' | 'recent' | 'none'>('full');
  const [showBackground, setShowBackground] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('kamiSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.rememberChat) {
          const savedMessages = localStorage.getItem('kamiChatHistory');
          if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
          }
        }
        
        if (settings.defaultModel) {
          const modelExists = availableModels.some(model => model.id === settings.defaultModel);
          if (modelExists) {
            setSelectedModel(settings.defaultModel);
          }
        }
        
        if (settings.modelContext) {
          setContextMode(settings.modelContext === 'summary' ? 'recent' : settings.modelContext);
        }
      }
    } catch (error) {
      console.error("Error loading saved data:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('kamiSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.saveHistory) {
          localStorage.setItem('kamiChatHistory', JSON.stringify(messages));
        }
      }
      
      const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant) {
        setLastAssistantMessage(lastAssistant);
      }
    } catch (error) {
      console.error("Error saving chat history:", error);
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    if (!window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.body.appendChild(script);
    }
  }, [messages]);

  const createContext = () => {
    // Based on contextMode, prepare the messages for the AI
    let contextMessages;
    
    switch (contextMode) {
      case 'full':
        // Use all messages
        contextMessages = messages;
        break;
      case 'recent':
        // Use last 6 messages or all if less than 6
        contextMessages = messages.slice(-6);
        break;
      case 'none':
        // Only include the current message (handled in submitPrompt)
        contextMessages = [];
        break;
      default:
        contextMessages = messages;
    }
    
    return contextMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      model: selectedModel
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      if (!window.puter) {
        toast.error("AI service not available. Please try refreshing the page.");
        setIsLoading(false);
        return;
      }
      
      const modelConfig = availableModels.find(m => m.id === selectedModel)?.puterConfig;
      if (!modelConfig) {
        throw new Error(`Model configuration not found for ${selectedModel}`);
      }
      
      // Use context based on model config and user settings
      const context = modelConfig.useContext ? createContext() : [];
      
      const response = await window.puter.ai.chat(
        input,
        { 
          model: modelConfig.model,
          messages: context,
        }
      );
      
      const responseExtractor = modelConfig.responseExtractor || (r => String(r));
      const responseText = responseExtractor(response);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        model: selectedModel
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      const model = availableModels.find(m => m.id === selectedModel)?.name || selectedModel;
      toast.success(`${model} has responded!`);
      
      try {
        const savedSettings = localStorage.getItem('kamiSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.voiceEnabled) {
            setTimeout(() => {
              const speech = SpeechService.getInstance();
              speech.speak(responseText);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error with auto voice playback:", error);
      }
    } catch (error) {
      console.error("AI response error:", error);
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const chatHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'KamiAI ('+availableModels.find(m => m.id === msg.model)?.name+')'}: ${msg.content}`
    ).join('\n\n');
    
    const element = document.createElement('a');
    const file = new Blob([chatHistory], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `kamiai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Chat history exported successfully!");
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.info("Chat history cleared!");
  };

  return (
    <div className="min-h-screen pt-16 bg-cosmic flex flex-col">
      <AnimatePresence>
        {showBackground && (
          <motion.div 
            className="fixed inset-0 z-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 to-purple-900/30" />
            <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="flex-grow container mx-auto px-4 py-6 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <span className="text-neon-magenta">Kami</span>
                <span className="text-neon-cyan">Chat</span>
                <span className="text-xs text-muted-foreground ml-2">by Rishab</span>
              </h1>
              
              <BackgroundPlayer compact className="ml-4 hidden md:flex" />
            </motion.div>
            
            <div className="flex gap-3 items-center">
              <Select
                value={contextMode}
                onValueChange={(value) => setContextMode(value as 'full' | 'recent' | 'none')}
              >
                <SelectTrigger className="w-[120px] bg-cosmic-light/10 border-cosmic-accent/20">
                  <SelectValue placeholder="Context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <Brain size={14} />
                      <span>Full History</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="recent">
                    <div className="flex items-center gap-2">
                      <Brain size={14} />
                      <span>Recent Only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="none">
                    <div className="flex items-center gap-2">
                      <Brain size={14} />
                      <span>No Context</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              
              <KamiSettings />
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExport}
                disabled={messages.length === 0}
                className="flex items-center gap-1"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearChat}
                disabled={messages.length === 0}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
          
          <Tabs
            value={currentTab}
            onValueChange={(value) => setCurrentTab(value as 'chat' | 'image')}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="image">Kami Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-4">
              <div className="flex-grow rounded-lg bg-cosmic-light/30 border border-cosmic-accent/20 mb-4 overflow-hidden flex flex-col">
                <div className="flex-grow p-4 overflow-y-auto">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                      <motion.div 
                        className="w-16 h-16 bg-cosmic rounded-full mb-4 flex items-center justify-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        <span className="text-3xl">✨</span>
                      </motion.div>
                      <motion.h3 
                        className="text-xl font-medium mb-2"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        Welcome to KamiChat
                      </motion.h3>
                      <motion.p 
                        className="text-ethereal-white/70 max-w-md"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        Start a conversation with multiple AI models. Select your preferred model and ask anything!
                      </motion.p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message, index) => (
                        <ChatMessage 
                          key={message.id} 
                          message={message} 
                          modelName={availableModels.find(m => m.id === message.model)?.name || message.model}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>
                
                <form 
                  onSubmit={handleSubmit}
                  className="p-4 border-t border-cosmic-accent/20 bg-cosmic/50 backdrop-blur-sm"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <div className="w-40">
                        <Select
                          value={selectedModel}
                          onValueChange={setSelectedModel}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="bg-cosmic border-cosmic-accent/30">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableModels.map(model => (
                              <SelectItem key={model.id} value={model.id}>
                                <div className="flex flex-col">
                                  <span>{model.name}</span>
                                  <span className="text-xs text-muted-foreground">{model.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <BackgroundPlayer compact className="md:hidden" />
                        
                        {lastAssistantMessage && (
                          <KamiVoice text={lastAssistantMessage.content} />
                        )}
                      </div>
                    </div>
                    
                    <div className="relative flex-grow">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        className="w-full px-4 py-3 rounded-lg bg-cosmic border border-cosmic-accent/30 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 text-ethereal-white"
                        disabled={isLoading}
                      />
                      <div className="absolute right-3 bottom-3">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={isLoading}
                          className="cosmic-button text-white py-1 px-4"
                        >
                          {isLoading ? 
                            <span className="flex items-center">
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </span> : 
                            "Send"
                          }
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </TabsContent>
            
            <TabsContent value="image" className="mt-4">
              <div className="rounded-lg bg-cosmic-light/30 border border-cosmic-accent/20 p-6">
                <h3 className="text-xl font-medium mb-4">Generate Images with KamiAI</h3>
                <KamiImage />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default KamiChat;
