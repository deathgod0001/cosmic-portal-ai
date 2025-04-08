
import React, { useState, useRef, useEffect } from 'react';
import ThreeJSBackground from '@/components/ThreeJSBackground';
import Navigation from '@/components/Navigation';
import MagicButton from '@/components/MagicButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  model: string;
  timestamp: Date;
}

const modelOptions = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest OpenAI model with advanced reasoning' },
  { id: 'claude-3-7-sonnet', name: 'Claude 3.7', description: 'Anthropic\'s latest model with exceptional insights' },
  { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3', description: 'Meta\'s powerful open model' },
  { id: 'deepseek-reasoner', name: 'DeepSeek', description: 'Specialized in complex reasoning' },
  { id: 'google/gemini-2.5-pro-exp-03-25:free', name: 'Gemini 2.5', description: 'Google\'s advanced multimodal model' },
];

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedModel, setSelectedModel] = useState(modelOptions[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      model: selectedModel.id,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsThinking(true);
    
    // Simulate AI response (in a real app, this would call an API)
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: simulateResponse(inputValue, selectedModel.id),
        isUser: false,
        model: selectedModel.id,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
      setIsThinking(false);
    }, 1500);
  };
  
  const simulateResponse = (input: string, model: string): string => {
    // This is a placeholder - in a real app this would integrate with actual AI models
    const responses = [
      "I've analyzed your request and found some fascinating insights on this topic.",
      "That's an interesting question. From what I understand, there are multiple perspectives to consider.",
      "Based on the current conversation context, I think the following would be helpful to explore.",
      "I've searched through reliable sources and can provide this information for your consideration.",
      "Looking at the patterns in our discussion so far, I believe this approach might be beneficial.",
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    return `${randomResponse} (Using ${model} to process your query: "${input}")`;
  };
  
  const handleExportChat = () => {
    // Create chat export
    const chatContent = messages.map((message) => {
      const role = message.isUser ? 'User' : 'KamiAI';
      const timestamp = message.timestamp.toLocaleString();
      return `[${timestamp}] ${role} (${message.model}):\n${message.content}\n\n`;
    }).join('');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KamiAI_Chat_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Chat history exported successfully!');
  };
  
  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat history cleared!');
  };
  
  return (
    <>
      <ThreeJSBackground />
      
      <div className="min-h-screen cosmos-bg">
        <Navigation />
        
        <div className="pt-24 pb-6 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="cosmic-text text-3xl md:text-4xl font-bold mb-2">KamiChat</h1>
              <p className="text-kami-ethereal/80">
                Engage with hyper-intelligent AI using multiple models
              </p>
            </div>
            
            <div className="flex flex-col h-[75vh] rounded-xl portal-card">
              {/* Chat header */}
              <div className="p-4 border-b border-kami-cosmic/20 flex flex-wrap items-center justify-between gap-2">
                <div className="relative">
                  <button
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-kami-void hover:bg-kami-cosmic/20 transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full bg-kami-cosmic animate-pulse"></span>
                    <span>{selectedModel.name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isModelDropdownOpen ? "transform rotate-180" : ""
                      )}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  
                  {isModelDropdownOpen && (
                    <div className="absolute mt-2 w-64 rounded-lg portal-card p-2 z-10">
                      {modelOptions.map((model) => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model);
                            setIsModelDropdownOpen(false);
                          }}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-lg transition-colors",
                            selectedModel.id === model.id
                              ? "bg-kami-cosmic/20"
                              : "hover:bg-kami-void"
                          )}
                        >
                          <div className="font-medium">{model.name}</div>
                          <div className="text-xs text-kami-ethereal/70">{model.description}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportChat}
                    className="p-2 rounded-lg hover:bg-kami-cosmic/20 transition-colors"
                    title="Export Chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                  
                  <button
                    onClick={handleClearChat}
                    className="p-2 rounded-lg hover:bg-kami-cosmic/20 transition-colors"
                    title="Clear Chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div className="max-w-md">
                      <div className="mb-4 w-16 h-16 mx-auto rounded-full bg-cosmic-gradient flex items-center justify-center">
                        <span className="text-white text-2xl">神</span>
                      </div>
                      <h3 className="cosmic-text text-xl font-bold mb-2">Welcome to KamiChat</h3>
                      <p className="text-kami-ethereal/80">
                        Begin your conversation with hyper-intelligent AI. Ask questions, 
                        seek wisdom, or engage in creative dialogue.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={cn(
                          "max-w-[80%] rounded-xl p-3",
                          message.isUser
                            ? "bg-kami-cosmic/30 rounded-tr-none"
                            : "bg-kami-void/80 rounded-tl-none"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className={`text-xs ${message.isUser ? 'text-kami-ethereal/70' : 'cosmic-text'}`}>
                            {message.isUser ? 'You' : 'KamiAI'}
                          </span>
                          <span className="text-xs text-kami-ethereal/50">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))
                )}
                
                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-kami-void/80 rounded-xl rounded-tl-none p-4 max-w-[80%]">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-kami-cosmic animate-pulse"></div>
                        <div className="w-2 h-2 rounded-full bg-kami-cosmic animate-pulse delay-150"></div>
                        <div className="w-2 h-2 rounded-full bg-kami-cosmic animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat input */}
              <div className="p-4 border-t border-kami-cosmic/20">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 bg-kami-void/60 border border-kami-cosmic/30 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-kami-cosmic/50"
                  />
                  <MagicButton type="submit" disabled={isThinking}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </MagicButton>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat;
