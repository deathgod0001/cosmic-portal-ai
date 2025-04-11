
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, Pause, Volume2, VolumeX, 
  Music, Youtube, Upload, Search, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MusicService from '@/services/MusicService';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface BackgroundPlayerProps {
  compact?: boolean;
  className?: string;
}

const BackgroundPlayer: React.FC<BackgroundPlayerProps> = ({ 
  compact = false,
  className = "" 
}) => {
  const musicService = MusicService.getInstance();
  const [isPlaying, setIsPlaying] = useState(musicService.isPlaying());
  const [volume, setVolume] = useState(musicService.getSettings().volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(musicService.getSettings().currentSource);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ title: string, videoId: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Set up default track if none exists
    if (!currentTrack) {
      const defaultTrack = {
        type: 'local' as const,
        url: '/audio/daylight.mp3', // This path should be correct based on your public folder structure
        title: 'Daylight',
      };
      musicService.loadTrack(defaultTrack);
      setCurrentTrack(defaultTrack);
    }
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = (newVolume: number) => setVolume(newVolume);
    const handleTrackChange = (track: any) => setCurrentTrack(track);
    
    musicService.addEventListener('play', handlePlay);
    musicService.addEventListener('pause', handlePause);
    musicService.addEventListener('volumeChange', handleVolumeChange);
    musicService.addEventListener('trackChange', handleTrackChange);
    
    // Update current time and duration
    const updateInterval = setInterval(() => {
      setCurrentTime(musicService.getCurrentTime());
      setDuration(musicService.getDuration());
    }, 1000);
    
    return () => {
      musicService.removeEventListener('play', handlePlay);
      musicService.removeEventListener('pause', handlePause);
      musicService.removeEventListener('volumeChange', handleVolumeChange);
      musicService.removeEventListener('trackChange', handleTrackChange);
      clearInterval(updateInterval);
    };
  }, []);

  const togglePlay = () => {
    musicService.toggle();
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    musicService.updateSettings({ volume: newVolume });
  };

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    musicService.seekTo(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const results = await musicService.searchYouTube(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Failed to search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };
  
  const selectYouTubeTrack = (result: { title: string, videoId: string }) => {
    const track = {
      type: 'youtube' as const,
      url: musicService.getYouTubeURL(result.videoId),
      title: result.title
    };
    
    musicService.loadTrack(track);
    musicService.play();
    setShowSearch(false);
    toast.success(`Now playing: ${result.title}`);
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const track = {
        type: 'uploaded' as const,
        url,
        title: file.name
      };
      
      musicService.loadTrack(track);
      musicService.play();
      toast.success(`Now playing: ${file.name}`);
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8" 
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-8 h-8" 
            onClick={() => setShowVolumeSlider(!showVolumeSlider)}
          >
            {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          
          {showVolumeSlider && (
            <motion.div 
              className="absolute bottom-full right-0 p-2 bg-cosmic-light/80 backdrop-blur-sm border border-cosmic-accent/30 rounded-md w-24 mb-2 z-50"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="h-24"
              />
            </motion.div>
          )}
        </div>
        
        <motion.span 
          className="text-xs opacity-70 truncate max-w-32"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {currentTrack?.title || 'No track selected'}
        </motion.span>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-cosmic-light/10 backdrop-blur-sm border border-cosmic-accent/20 p-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <motion.div 
            className="font-medium text-sm flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <Music size={16} className="text-neon-cyan" />
            <span className="truncate max-w-40">
              {currentTrack?.title || 'No track selected'}
            </span>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <input 
              type="file" 
              id="music-upload" 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="audio/*"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 text-neon-cyan" 
              onClick={() => document.getElementById('music-upload')?.click()}
            >
              <Upload size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 text-neon-magenta" 
              onClick={() => setShowSearch(!showSearch)}
            >
              <Youtube size={16} />
            </Button>
          </div>
        </div>
        
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 items-center mb-2">
                <Input
                  placeholder="Search YouTube music..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-cosmic-light/5 border-cosmic-accent/20"
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleSearch} 
                  disabled={isSearching}
                >
                  <Search size={16} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowSearch(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
                {isSearching ? (
                  <div className="text-center text-sm py-2">Searching...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((result, index) => (
                    <motion.div
                      key={index}
                      className="flex justify-between items-center p-2 rounded-md hover:bg-cosmic-light/10 cursor-pointer"
                      onClick={() => selectYouTubeTrack(result)}
                      whileHover={{ scale: 1.01 }}
                    >
                      <span className="text-sm truncate">{result.title}</span>
                      <Button variant="ghost" size="icon" className="w-8 h-8">
                        <Play size={14} />
                      </Button>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center text-sm py-2 text-muted-foreground">
                    {searchQuery ? 'No results found' : 'Search for music on YouTube'}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div className="space-y-1.5">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={1}
            onValueChange={handleTimeChange}
            disabled={!duration}
            className="my-2"
          />
          
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration || 0)}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
              
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8" 
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                  {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </Button>
                
                {showVolumeSlider && (
                  <motion.div 
                    className="absolute bottom-full right-0 p-2 bg-cosmic-light/80 backdrop-blur-sm border border-cosmic-accent/30 rounded-md w-24 mb-2 z-50"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      orientation="vertical"
                      onValueChange={handleVolumeChange}
                      className="h-24"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackgroundPlayer;
