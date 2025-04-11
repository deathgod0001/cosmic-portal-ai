
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Trash2, Download } from 'lucide-react';
import KamiVoice from '@/components/voice/KamiVoice';
import KamiSettings from '@/components/settings/KamiSettings';

declare global {
  interface Window {
    puter: any;
  }
}

const KamiQuest = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load search history from localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('kamiSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.saveHistory) {
          const savedHistory = localStorage.getItem('kamiQuestHistory');
          if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
          }
        }
      }
    } catch (error) {
      console.error("Error loading saved search history:", error);
    }
    
    // Load puter.js script when component mounts
    if (!window.puter) {
      const script = document.createElement('script');
      script.src = 'https://js.puter.com/v2/';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // Save search history to localStorage
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('kamiSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.saveHistory) {
          localStorage.setItem('kamiQuestHistory', JSON.stringify(searchHistory));
        }
      }
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  }, [searchHistory]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    setResults(null);
    
    try {
      // First, check if the puter.js script is loaded
      if (!window.puter) {
        // Load puter.js script
        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      // Use Gemini to search for information, as it has good web knowledge
      const response = await window.puter.ai.chat(
        `Search for comprehensive information about: ${query}. Please provide factual information similar to what might be found on Wikipedia. Include relevant details and cite sources when possible.`,
        { model: 'google/gemini-2.5-pro-exp-03-25:free' }
      );
      
      const responseText = response.message.content;
      setResults(responseText);
      setSearchHistory(prev => [query, ...prev.filter(item => item !== query)].slice(0, 10));
      toast.success("Search completed!");
      
      // Check if auto voice is enabled and play the response
      try {
        const savedSettings = localStorage.getItem('kamiSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.voiceEnabled) {
            setTimeout(() => {
              const SpeechService = require('@/services/SpeechService').default;
              const speech = SpeechService.getInstance();
              speech.speak(responseText);
            }, 500);
          }
        }
      } catch (error) {
        console.error("Error with auto voice playback:", error);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to fetch results. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSearch = (term: string) => {
    setQuery(term);
    handleSearch(new Event('submit') as any);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
    toast.info("Search history cleared!");
  };

  const handleExport = () => {
    if (!results) return;
    
    const content = `# KamiQuest Search Results\n\nQuery: ${query}\nDate: ${new Date().toLocaleString()}\n\n${results}`;
    
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `kamiquest-${query.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast.success("Search results exported successfully!");
  };

  return (
    <div className="min-h-screen pt-16 bg-cosmic flex flex-col">
      <motion.div 
        className="flex-grow container mx-auto px-4 py-6 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold flex items-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="text-ethereal-gold">Kami</span>
              <span className="text-neon-cyan">Quest</span>
              <span className="text-xs text-muted-foreground ml-2 mt-auto mb-2">by Rishab</span>
            </motion.h1>
            
            <KamiSettings />
          </div>
          
          <motion.p 
            className="text-lg text-center mb-8 text-ethereal-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Search the vast knowledge of the universe with our AI-powered knowledge engine.
          </motion.p>
          
          {/* Search form */}
          <motion.form 
            onSubmit={handleSearch}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="What would you like to learn about?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow bg-cosmic-light/30 border-cosmic-accent/30"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !query.trim()} 
                className="cosmic-button"
              >
                {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 'Search'}
              </Button>
            </div>
          </motion.form>
          
          {/* Past searches */}
          {searchHistory.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm text-ethereal-white/60">Recent searches:</h3>
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-6 text-xs text-ethereal-white/60 hover:text-ethereal-white/90"
                >
                  Clear
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickSearch(term)}
                      className="bg-cosmic-light/20 border-cosmic-accent/20"
                    >
                      {term}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Results */}
          {isLoading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="relative w-16 h-16">
                  <div className="w-16 h-16 rounded-full border-4 border-neon-cyan/30 border-t-neon-cyan animate-spin"></div>
                </div>
                <p className="mt-4 text-ethereal-white/70">Searching knowledge dimensions...</p>
              </div>
            </div>
          ) : results ? (
            <motion.div 
              className="flex-grow rounded-lg bg-cosmic-light/20 border border-cosmic-accent/30 p-6 overflow-y-auto relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Results for: <span className="text-neon-cyan">{query}</span></h3>
                <div className="flex gap-2">
                  {/* Voice component */}
                  <KamiVoice text={results} />
                  
                  {/* Export button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="bg-cosmic-light/20 border-cosmic-accent/20"
                  >
                    <Download size={14} className="mr-1" />
                    Export
                  </Button>
                </div>
              </div>
              
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{results}</div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center">
              <div className="max-w-md">
                <div className="w-20 h-20 bg-cosmic-light/20 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Begin your quest for knowledge</h3>
                <p className="text-ethereal-white/70">
                  Enter a topic, question, or subject above, and our AI will search for accurate information from trusted sources.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default KamiQuest;
