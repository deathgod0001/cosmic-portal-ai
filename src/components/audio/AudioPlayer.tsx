
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  allowDownload?: boolean;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title = "Background Music",
  autoPlay = false,
  loop = true,
  allowDownload = false,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    audio.volume = volume;
    
    // Set loading state
    setIsLoading(true);
    
    if (autoPlay) {
      audio.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error playing audio:", error);
          setIsLoading(false);
        });
    }
    
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };
    const handleEnded = () => {
      if (!loop) setIsPlaying(false);
    };
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [autoPlay, loop, volume, src]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error("Error playing audio:", error));
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const restart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      if (!isPlaying) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => console.error("Error playing audio:", error));
      }
    }
  };
  
  const downloadAudio = () => {
    // Create a temporary anchor element
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = src;
    
    // Extract filename from src or use title
    const fileName = src.split('/').pop() || `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
    a.download = fileName;
    
    // Add to the DOM and trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    
    toast.success("Download started");
  };

  const glow = isPlaying ? 'shadow-lg shadow-primary/20' : '';

  return (
    <div className={`rounded-md p-3 bg-cosmic-light/10 border border-cosmic-accent/20 transition-all ${glow} ${className}`}>
      <audio src={src} ref={audioRef} loop={loop} />
      
      <div className="flex items-center justify-between mb-2">
        <motion.div 
          className="text-sm font-medium truncate max-w-[180px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={restart}
          >
            <SkipBack size={16} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={togglePlay}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-3 w-3 rounded-full border-2 border-t-transparent animate-spin" />
            ) : isPlaying ? (
              <Pause size={16} />
            ) : (
              <Play size={16} />
            )}
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setShowVolumeSlider(!showVolumeSlider)}
            >
              {volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            
            {showVolumeSlider && (
              <motion.div 
                className="absolute bottom-full right-0 p-2 bg-cosmic-light/80 backdrop-blur-sm border border-cosmic-accent/30 rounded-md w-24 mb-2 z-10"
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
          
          {allowDownload && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={downloadAudio}
              title="Download audio"
            >
              <Download size={16} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-1.5">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={handleTimeChange}
          disabled={!duration || isLoading}
          className="h-1.5"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <div>{formatTime(currentTime)}</div>
          <div>{duration ? formatTime(duration) : '--:--'}</div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
