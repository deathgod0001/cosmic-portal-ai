import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import BackgroundPlayer from '../audio/BackgroundPlayer';
import MusicService from '@/services/MusicService';
import { toast } from 'sonner';
import { Music, Upload, Youtube, Search, RefreshCcw } from 'lucide-react';

const BackgroundSettings = () => {
  const musicService = MusicService.getInstance();
  const [autoplay, setAutoplay] = useState(musicService.getSettings().autoplay);
  const [loop, setLoop] = useState(musicService.getSettings().loop);
  const [recentTracks, setRecentTracks] = useState(musicService.getSettings().recentTracks || []);
  const [currentTab, setCurrentTab] = useState('player');
  
  useEffect(() => {
    const handleTrackChange = () => {
      setRecentTracks(musicService.getSettings().recentTracks);
    };
    
    musicService.addEventListener('trackChange', handleTrackChange);
    
    return () => {
      musicService.removeEventListener('trackChange', handleTrackChange);
    };
  }, []);
  
  const handleAutoplayChange = (checked: boolean) => {
    setAutoplay(checked);
    musicService.updateSettings({ autoplay: checked });
    toast.success(`Autoplay ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const handleLoopChange = (checked: boolean) => {
    setLoop(checked);
    musicService.updateSettings({ loop: checked });
    toast.success(`Loop ${checked ? 'enabled' : 'disabled'}`);
  };
  
  const loadTrack = (track: any) => {
    musicService.loadTrack(track);
    musicService.play();
    toast.success(`Now playing: ${track.title}`);
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

  return (
    <div className="space-y-6 pt-4">
      <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="player">Player</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="player" className="space-y-4 mt-4">
          <BackgroundPlayer />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Autoplay Music</Label>
              <Switch 
                checked={autoplay}
                onCheckedChange={handleAutoplayChange}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Loop Playback</Label>
              <Switch 
                checked={loop}
                onCheckedChange={handleLoopChange}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="library" className="space-y-4 mt-4">
          <div className="flex items-center gap-2 mb-4">
            <Music size={18} className="text-neon-cyan" />
            <h4 className="text-sm font-medium">Recent Tracks</h4>
          </div>
          
          {recentTracks.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {recentTracks.map((track, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-cosmic-light/20 cursor-pointer"
                  onClick={() => loadTrack(track)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-2">
                    {track.type === 'youtube' && <Youtube size={14} className="text-red-400" />}
                    {track.type === 'uploaded' && <Upload size={14} className="text-blue-400" />}
                    {track.type === 'local' && <Music size={14} className="text-green-400" />}
                    <span className="text-sm truncate max-w-40">{track.title}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Music size={14} />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Music size={36} className="mx-auto mb-2 opacity-50" />
              <p>No recent tracks</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label>Upload Music File</Label>
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="bg-cosmic-light/10 border-cosmic-accent/20"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 mt-4">
              <Label>YouTube Search</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search for music..."
                  className="bg-cosmic-light/10 border-cosmic-accent/20"
                />
                <Button variant="outline" size="icon">
                  <Search size={16} />
                </Button>
              </div>
              
              <div className="text-center py-4 text-xs text-muted-foreground">
                Note: YouTube playback may require third-party services
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Reset player settings but keep current track
            musicService.updateSettings({
              volume: 0.5,
              autoplay: false,
              loop: true
            });
            setAutoplay(false);
            setLoop(true);
            toast.success("Player settings reset");
          }}
          className="text-xs"
        >
          <RefreshCcw size={12} className="mr-1" />
          Reset Settings
        </Button>
      </div>
    </div>
  );
};

export default BackgroundSettings;
