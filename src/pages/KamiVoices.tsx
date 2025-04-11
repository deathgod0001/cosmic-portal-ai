
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { VolumeX, Volume, Volume1, Volume2, Play, Pause, Save, Download, Mic, Music, Upload, Search } from 'lucide-react';
import SpeechService from '@/services/SpeechService';
import AudioPlayer from '@/components/audio/AudioPlayer';

// Pre-defined voice examples for the user to try
const VoiceExample = {
  GREETING: "Hello! I'm KamiAI, your personal AI assistant. How can I help you today?",
  STORY: "Once upon a time, in a digital realm far beyond imagination, an AI named Kami was born. With knowledge vast as the cosmos and creativity boundless as the universe, an AI named Kami was born. With knowledge vast as the cosmos and creativity boundless as the universe, Kami set out to assist humans in their quest for information and inspiration.",
  TECHNICAL: "KamiAI uses advanced natural language processing techniques to understand context, respond appropriately, and learn from interactions. It can process complex queries across multiple domains of knowledge.",
  EMOTIONAL: "I'm excited to work with you on this project! I believe we can create something truly amazing together. Let's collaborate and bring your vision to life!"
};

// Extended voice categories for the UI
const VoiceCategories = {
  NATURAL: "Natural",
  ROBOTIC: "Robotic",
  ACCENTED: "Accented",
  STYLIZED: "Stylized",
  NOVELTY: "Novelty",
  CUSTOM: "Custom"
};

// Default background music
const DEFAULT_MUSIC = {
  title: "Daylight",
  url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" // Placeholder URL for now
};

const KamiVoices = () => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [pitch, setPitch] = useState<number>(1);
  const [rate, setRate] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [text, setText] = useState<string>(VoiceExample.GREETING);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeExample, setActiveExample] = useState<string>('GREETING');
  const [recordings, setRecordings] = useState<{ name: string; blob: Blob; url?: string }[]>([]);
  const [backgroundMusic, setBackgroundMusic] = useState<string>(DEFAULT_MUSIC.url);
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.5);
  const [customMusicUrl, setCustomMusicUrl] = useState<string>("");
  const [youtubeSearchQuery, setYoutubeSearchQuery] = useState<string>("");
  const [showMusicControls, setShowMusicControls] = useState<boolean>(false);
  
  const speechService = SpeechService.getInstance();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Voice categorization function (will be used to organize the 40+ voices)
  const categorizeVoices = (voices: SpeechSynthesisVoice[]) => {
    const categories: { [key: string]: SpeechSynthesisVoice[] } = {
      [VoiceCategories.NATURAL]: [],
      [VoiceCategories.ROBOTIC]: [],
      [VoiceCategories.ACCENTED]: [],
      [VoiceCategories.STYLIZED]: [],
      [VoiceCategories.NOVELTY]: [],
      [VoiceCategories.CUSTOM]: []
    };

    // Categorize voices based on name and language
    voices.forEach(voice => {
      // Simple categorization rules (can be expanded)
      if (voice.name.toLowerCase().includes('google') || voice.name.toLowerCase().includes('natural')) {
        categories[VoiceCategories.NATURAL].push(voice);
      } else if (voice.name.toLowerCase().includes('microsoft') || voice.name.toLowerCase().includes('edge')) {
        categories[VoiceCategories.STYLIZED].push(voice);
      } else if (voice.lang !== 'en-US' && voice.lang !== 'en-GB') {
        categories[VoiceCategories.ACCENTED].push(voice);
      } else if (voice.name.toLowerCase().includes('assistant') || voice.name.toLowerCase().includes('bot')) {
        categories[VoiceCategories.ROBOTIC].push(voice);
      } else if (voice.name.toLowerCase().includes('fun') || voice.name.toLowerCase().includes('joke')) {
        categories[VoiceCategories.NOVELTY].push(voice);
      } else {
        // Default category
        categories[VoiceCategories.CUSTOM].push(voice);
      }
    });

    return categories;
  };

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);
      
      // Set default voice
      if (!selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(voice => voice.default)?.voiceURI || availableVoices[0].voiceURI;
        setSelectedVoice(defaultVoice);
      }
      
      // Log voice count for debugging
      console.log(`Loaded ${availableVoices.length} voices`);
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    // Initialize background music
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
      audioRef.current.loop = true;
      audioRef.current.src = backgroundMusic;
    }
    
    // Load settings from localStorage
    try {
      const savedSettings = localStorage.getItem('kamiVoiceSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setPitch(settings.pitch || 1);
        setRate(settings.rate || 1);
        setVolume(settings.volume || 1);
        if (settings.voiceURI) {
          setSelectedVoice(settings.voiceURI);
        }
      }
    } catch (error) {
      console.error("Failed to load voice settings:", error);
    }
    
    return () => {
      // Clean up
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const handlePlay = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;
    
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => {
      setIsPlaying(false);
      toast.error("Error playing speech");
    };
    
    window.speechSynthesis.speak(utterance);
  };

  const handleSaveSettings = () => {
    const settings = {
      pitch,
      rate,
      volume,
      voiceURI: selectedVoice
    };
    
    localStorage.setItem('kamiVoiceSettings', JSON.stringify(settings));
    
    // Update SpeechService settings
    const voice = voices.find(v => v.voiceURI === selectedVoice) || null;
    speechService.updateSettings({
      pitch,
      rate,
      volume,
      voice
    });
    
    toast.success("Voice settings saved successfully");
  };

  const handleSetExampleText = (example: string) => {
    setText(VoiceExample[example as keyof typeof VoiceExample]);
    setActiveExample(example);
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const recordingName = `Recording_${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '_')}`;
        setRecordings(prev => [...prev, { name: recordingName, blob: audioBlob }]);
      };
      
      mediaRecorderRef.current.start();
      toast.info("Recording started");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Failed to access microphone");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      toast.success("Recording completed");
    }
  };

  const handleDownloadRecording = (index: number) => {
    const recording = recordings[index];
    const url = recording.url || URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.wav`;
    a.click();
    
    // Only revoke if we just created the URL
    if (!recording.url) {
      URL.revokeObjectURL(url);
    } else {
      // Save URL for future use
      const updatedRecordings = [...recordings];
      updatedRecordings[index] = { ...recording, url };
      setRecordings(updatedRecordings);
    }
    
    toast.success(`Downloaded recording: ${recording.name}`);
  };

  const handlePlayRecording = (index: number) => {
    const recording = recordings[index];
    const url = recording.url || URL.createObjectURL(recording.blob);
    
    // Save URL for future use
    if (!recording.url) {
      const updatedRecordings = [...recordings];
      updatedRecordings[index] = { ...recording, url };
      setRecordings(updatedRecordings);
    }
    
    const audio = new Audio(url);
    audio.play();
  };

  const handleDownloadSpeech = () => {
    if (!text) {
      toast.error("Please enter some text to convert to speech first");
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.volume = volume;
    
    const voice = voices.find(v => v.voiceURI === selectedVoice);
    if (voice) {
      utterance.voice = voice;
    }
    
    // Use SpeechSynthesisRecorder (let's assume we implement this functionality)
    toast.info("Generating audio file...");
    
    // For now, we'll simulate this with a timeout
    setTimeout(() => {
      const fileName = `kami-voice-${new Date().toISOString().slice(0, 10)}`;
      
      // This is a placeholder - in reality, we'd need to implement a way to record audio output
      // from the speech synthesis engine, which is beyond the scope of this simple demo
      toast.success(`Audio generated: ${fileName}.mp3`);
      toast.info("Feature in development - full download capability coming soon!");
    }, 2000);
  };

  const toggleMusicPlayback = () => {
    if (!audioRef.current) return;
    
    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
        toast.error("Unable to play background music");
      });
    }
    
    setMusicPlaying(!musicPlaying);
  };

  const handleMusicVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setMusicVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const setCustomMusic = () => {
    if (customMusicUrl) {
      setBackgroundMusic(customMusicUrl);
      if (audioRef.current) {
        audioRef.current.src = customMusicUrl;
        audioRef.current.play().catch(err => {
          console.error("Error playing custom audio:", err);
          toast.error("Unable to play custom music. Check the URL and try again.");
          // Reset to default
          setBackgroundMusic(DEFAULT_MUSIC.url);
          audioRef.current.src = DEFAULT_MUSIC.url;
        });
      }
      setMusicPlaying(true);
    } else {
      toast.error("Please enter a valid music URL");
    }
  };

  const searchYoutubeMusic = () => {
    if (!youtubeSearchQuery) {
      toast.error("Please enter a search query");
      return;
    }
    
    toast.info(`Searching for "${youtubeSearchQuery}"...`);
    
    // In a real implementation, we would integrate with YouTube API here
    // For now, we'll just show a message
    setTimeout(() => {
      toast.info("YouTube search feature coming soon!");
    }, 1500);
  };

  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX />;
    if (volume < 0.33) return <Volume />;
    if (volume < 0.66) return <Volume1 />;
    return <Volume2 />;
  };

  // Render voice selection by categories
  const renderVoiceSelection = () => {
    const categorized = categorizeVoices(voices);
    
    return (
      <div className="space-y-4">
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger className="bg-cosmic border-cosmic-accent/30">
            <SelectValue placeholder="Select a voice" />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {Object.entries(categorized).map(([category, voiceList]) => (
              voiceList.length > 0 && (
                <div key={category} className="mb-2">
                  <div className="text-sm font-medium text-neon-cyan px-2 py-1 mb-1">{category}</div>
                  {voiceList.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI} className="pl-4">
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </div>
              )
            ))}
          </SelectContent>
        </Select>
        
        <div className="text-xs text-muted-foreground">
          {voices.length} voices available. Available voices depend on your browser and operating system.
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 bg-cosmic flex flex-col overflow-x-hidden">
      {/* Background music player (hidden) */}
      <audio ref={audioRef} className="hidden" />
      
      <motion.div 
        className="absolute top-20 right-6 z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMusicControls(!showMusicControls)}
          className="cosmic-button flex items-center gap-1.5 bg-cosmic/80 border border-neon-cyan/40"
        >
          <Music size={16} />
          <span>Music</span>
        </Button>
        
        <motion.div
          className="absolute top-full right-0 mt-2 p-3 rounded-md bg-cosmic-light/50 border border-cosmic-accent/30 backdrop-blur-md w-64"
          initial={{ opacity: 0, scale: 0.9, y: -10 }}
          animate={{ 
            opacity: showMusicControls ? 1 : 0,
            scale: showMusicControls ? 1 : 0.9,
            y: showMusicControls ? 0 : -10,
            pointerEvents: showMusicControls ? 'auto' : 'none',
          }}
          transition={{ duration: 0.2 }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-medium">{DEFAULT_MUSIC.title}</h4>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={toggleMusicPlayback}
              >
                {musicPlaying ? <Pause size={16} /> : <Play size={16} />}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <VolumeX size={14} />
              <Slider
                value={[musicVolume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleMusicVolumeChange}
                className="flex-grow"
              />
              <Volume2 size={14} />
            </div>
            
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <Input
                  placeholder="Music URL..."
                  value={customMusicUrl}
                  onChange={(e) => setCustomMusicUrl(e.target.value)}
                  className="h-7 text-sm bg-cosmic border-cosmic-accent/30"
                />
                <Button 
                  size="sm" 
                  className="h-7 px-2 bg-cosmic-light border-cosmic-accent/30"
                  onClick={setCustomMusic}
                >
                  <Upload size={14} />
                </Button>
              </div>
              
              <div className="flex gap-1.5">
                <Input
                  placeholder="Search YouTube..."
                  value={youtubeSearchQuery}
                  onChange={(e) => setYoutubeSearchQuery(e.target.value)}
                  className="h-7 text-sm bg-cosmic border-cosmic-accent/30"
                />
                <Button 
                  size="sm" 
                  className="h-7 px-2 bg-cosmic-light border-cosmic-accent/30"
                  onClick={searchYoutubeMusic}
                >
                  <Search size={14} />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      <motion.div 
        className="flex-grow container mx-auto px-4 py-6 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col">
          <motion.h1 
            className="text-3xl font-bold flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <span className="text-neon-magenta glow">Kami</span>
            <span className="text-neon-cyan glow">Voices</span>
            <span className="text-xs text-muted-foreground ml-2">by Rishab</span>
          </motion.h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Voice Settings */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <Card className="bg-cosmic-light/30 border-cosmic-accent/30 neon-border">
                <CardHeader>
                  <CardTitle className="text-neon-cyan glow-text">Voice Settings</CardTitle>
                  <CardDescription>Customize how the KamiAI voice sounds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Voice</label>
                    {renderVoiceSelection()}
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Pitch: {pitch.toFixed(1)}</label>
                    </div>
                    <Slider
                      value={[pitch]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={(value) => setPitch(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Speed: {rate.toFixed(1)}x</label>
                    </div>
                    <Slider
                      value={[rate]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={(value) => setRate(value[0])}
                    />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="block text-sm font-medium">Volume: {Math.round(volume * 100)}%</label>
                      <div>{getVolumeIcon()}</div>
                    </div>
                    <Slider
                      value={[volume]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(value) => setVolume(value[0])}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleSaveSettings}
                    className="w-full cosmic-button"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save as Default
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-cosmic-light/30 border-cosmic-accent/30 neon-border">
                <CardHeader>
                  <CardTitle className="text-neon-cyan glow-text">Record Your Voice</CardTitle>
                  <CardDescription>Create voice recordings for future use</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center gap-4">
                    <Button 
                      onClick={handleStartRecording} 
                      variant="outline"
                      className="flex-1 bg-cosmic border-cosmic-accent/30 hover:bg-cosmic-light/50 pulse"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                    <Button 
                      onClick={handleStopRecording} 
                      variant="outline"
                      className="flex-1 bg-cosmic border-cosmic-accent/30 hover:bg-cosmic-light/50"
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  </div>
                  
                  {recordings.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Your Recordings</h4>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {recordings.map((recording, index) => (
                          <motion.div 
                            key={index} 
                            className="flex items-center justify-between bg-cosmic-light/20 p-2 rounded-md"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                          >
                            <span className="truncate flex-1">{recording.name}</span>
                            <div className="flex gap-2">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handlePlayRecording(index)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDownloadRecording(index)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Text-to-Speech Player */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <Card className="bg-cosmic-light/30 border-cosmic-accent/30 neon-border">
                <CardHeader>
                  <CardTitle className="text-neon-magenta glow-text">Text to Speech</CardTitle>
                  <CardDescription>Enter text to be converted to speech</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {Object.keys(VoiceExample).map((example) => (
                      <motion.div
                        key={example}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant={activeExample === example ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSetExampleText(example)}
                          className={activeExample === example ? 
                            "bg-neon-cyan text-black hover:bg-neon-cyan/80" : 
                            "bg-cosmic border-cosmic-accent/30 hover:bg-cosmic-light/50"
                          }
                        >
                          {example.charAt(0) + example.slice(1).toLowerCase()}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                  
                  <Textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[200px] bg-cosmic-light/20 border-cosmic-accent/30"
                    placeholder="Enter text to convert to speech..."
                  />
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={handlePlay} 
                      className="flex-1 cosmic-button"
                      disabled={!text}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="mr-2 h-4 w-4" />
                          Stop Speaking
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Speak Text
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={handleDownloadSpeech}
                      className="bg-cosmic border-cosmic-accent/30 hover:bg-cosmic-light/50"
                      disabled={!text}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Audio
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-cosmic-light/30 border-cosmic-accent/30 neon-border">
                <CardHeader>
                  <CardTitle className="text-neon-cyan glow-text">Voice Tips</CardTitle>
                  <CardDescription>Get the most out of Kami Voices</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <motion.li 
                      className="flex gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.3 }}
                    >
                      <span className="text-neon-magenta">•</span>
                      <span>For more natural speech, add commas and periods to create pauses.</span>
                    </motion.li>
                    <motion.li 
                      className="flex gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      <span className="text-neon-magenta">•</span>
                      <span>Adjust the pitch and rate for different voice characters.</span>
                    </motion.li>
                    <motion.li 
                      className="flex gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                    >
                      <span className="text-neon-magenta">•</span>
                      <span>Different voices handle pronunciation differently - try several voices for best results.</span>
                    </motion.li>
                    <motion.li 
                      className="flex gap-2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.3 }}
                    >
                      <span className="text-neon-magenta">•</span>
                      <span>Voice availability depends on your operating system and browser.</span>
                    </motion.li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default KamiVoices;
