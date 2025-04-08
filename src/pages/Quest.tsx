
import React, { useState } from 'react';
import ThreeJSBackground from '@/components/ThreeJSBackground';
import Navigation from '@/components/Navigation';
import MagicButton from '@/components/MagicButton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  confidence: number;
}

const Quest: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSelectedResult(null);
    
    // Simulate search (in a real app, this would call an API)
    setTimeout(() => {
      // Generate fake results
      const fakeResults: SearchResult[] = [
        {
          id: '1',
          title: `Results for "${searchQuery}" from Wikipedia`,
          snippet: `This is comprehensive information about "${searchQuery}" gathered from multiple verified sources. The topic appears to have significant research with several key insights about its origins and development over time.`,
          source: 'Wikipedia',
          confidence: 0.95,
        },
        {
          id: '2',
          title: `Academic perspective on "${searchQuery}"`,
          snippet: `Several scholarly articles discuss "${searchQuery}" in depth, noting its importance in the field. Recent studies have expanded our understanding and challenged previous assumptions.`,
          source: 'Google Scholar',
          confidence: 0.87,
        },
        {
          id: '3',
          title: `Historical context of "${searchQuery}"`,
          snippet: `The historical development of "${searchQuery}" reveals interesting patterns and cultural significance. This timeline shows key events and milestones that shaped its current understanding.`,
          source: 'Encyclopedia Britannica',
          confidence: 0.82,
        },
      ];
      
      setSearchResults(fakeResults);
      setIsSearching(false);
      toast.success('Search completed!');
    }, 2000);
  };
  
  const handleResultSelect = (result: SearchResult) => {
    setSelectedResult(result);
  };
  
  return (
    <>
      <ThreeJSBackground />
      
      <div className="min-h-screen cosmos-bg">
        <Navigation />
        
        <div className="pt-24 pb-6 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="cosmic-text text-3xl md:text-4xl font-bold mb-2">KamiQuest</h1>
              <p className="text-kami-ethereal/80">
                Embark on an odyssey of knowledge beyond conventional search capabilities
              </p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 h-[75vh]">
              {/* Search panel */}
              <div className="md:w-2/5 portal-card p-4">
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Begin your quest for knowledge..."
                      className="w-full bg-kami-void/60 border border-kami-cosmic/30 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-kami-cosmic/50"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <button
                        type="submit"
                        className="rounded-full w-8 h-8 flex items-center justify-center bg-cosmic-gradient"
                      >
                        {isSearching ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                <div className="space-y-3 overflow-y-auto max-h-[calc(75vh-8rem)]">
                  {searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <div
                        key={result.id}
                        onClick={() => handleResultSelect(result)}
                        className={cn(
                          "p-3 rounded-lg cursor-pointer transition-colors",
                          selectedResult?.id === result.id
                            ? "bg-kami-cosmic/30"
                            : "hover:bg-kami-void"
                        )}
                      >
                        <h3 className="font-medium mb-1 cosmic-text">{result.title}</h3>
                        <p className="text-sm text-kami-ethereal/70 line-clamp-2">{result.snippet}</p>
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <span className="bg-kami-void px-2 py-0.5 rounded">
                            {result.source}
                          </span>
                          <div className="flex items-center">
                            <span
                              className={cn(
                                "mr-1",
                                result.confidence > 0.9
                                  ? "text-green-400"
                                  : result.confidence > 0.7
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              )}
                            >
                              ●
                            </span>
                            <span>{Math.floor(result.confidence * 100)}% confidence</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      {isSearching ? (
                        <div>
                          <div className="mb-4 mx-auto w-12 h-12 border-4 border-kami-cosmic border-t-transparent rounded-full animate-spin"></div>
                          <p className="cosmic-text animate-pulse">Searching across dimensions...</p>
                        </div>
                      ) : (
                        <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-12 w-12 mx-auto text-kami-ethereal/40 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          <p className="text-kami-ethereal/60">
                            Begin your quest by entering a topic to explore
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Results panel */}
              <div className="md:w-3/5 portal-card p-4 overflow-y-auto">
                {selectedResult ? (
                  <div className="animate-fade-in">
                    <div className="mb-6">
                      <h2 className="cosmic-text text-2xl font-bold mb-2">{selectedResult.title}</h2>
                      <div className="flex items-center text-sm">
                        <span className="bg-kami-void px-2 py-0.5 rounded mr-2">
                          {selectedResult.source}
                        </span>
                        <div className="flex items-center">
                          <span
                            className={cn(
                              "mr-1",
                              selectedResult.confidence > 0.9
                                ? "text-green-400"
                                : selectedResult.confidence > 0.7
                                ? "text-yellow-400"
                                : "text-red-400"
                            )}
                          >
                            ●
                          </span>
                          <span>{Math.floor(selectedResult.confidence * 100)}% confidence</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <p>{selectedResult.snippet}</p>
                      
                      <p>
                        This knowledge quest has revealed multiple perspectives on "{searchQuery}". 
                        The topic has been analyzed through academic, historical, and cultural lenses 
                        to provide a comprehensive understanding.
                      </p>
                      
                      <p>
                        Recent developments suggest significant advancements in this area, with 
                        ongoing research expanding our understanding. Several key insights have 
                        emerged from this analysis:
                      </p>
                      
                      <ul>
                        <li>The foundational concepts have evolved significantly over time</li>
                        <li>Multiple disciplines contribute valuable perspectives</li>
                        <li>Contemporary applications continue to develop in unexpected ways</li>
                      </ul>
                      
                      <p>
                        The intersection of various fields creates rich opportunities for further 
                        exploration and discovery. This quest has only revealed the beginning of 
                        what can be understood about this fascinating topic.
                      </p>
                    </div>
                    
                    <div className="mt-6 flex gap-3">
                      <MagicButton 
                        variant="default" 
                        className="px-4"
                        onClick={() => toast.success('Content saved!')}
                      >
                        Save Results
                      </MagicButton>
                      
                      <MagicButton 
                        variant="celestial" 
                        className="px-4"
                        onClick={() => {
                          setSearchQuery(searchQuery + ' deeper analysis');
                          toast.info('Exploring deeper insights...');
                        }}
                      >
                        Explore Deeper
                      </MagicButton>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-center">
                    <div className="max-w-md">
                      <div className="mb-4 w-16 h-16 mx-auto rounded-full bg-cosmic-gradient p-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-full w-full text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="cosmic-text text-xl font-bold mb-2">Begin Your Knowledge Quest</h3>
                      <p className="text-kami-ethereal/80">
                        Search for a topic to explore and gain comprehensive insights beyond 
                        conventional search capabilities. Select a result to view full details.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quest;
