
import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { 
  Sheet, SheetContent, SheetDescription, 
  SheetHeader, SheetTitle, SheetTrigger 
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Settings, Volume2, Palette, BrainCircuit, KeyRound, Bell, Shield, Music, User } from 'lucide-react';
import { toast } from 'sonner';
import SpeechService from '@/services/SpeechService';
import BackgroundSettings from './BackgroundSettings';

type SettingsState = {
  // Appearance settings
  theme: 'dark' | 'light' | 'system';
  animationsEnabled: boolean;
  accentColor: string;
  fontSize: number;
  
  // Voice settings
  voiceEnabled: boolean;
  selectedVoice: string;
  speechRate: number;
  speechPitch: number;
  speechVolume: number;
  
  // AI settings
  rememberChat: boolean;
  modelContext: 'full' | 'recent' | 'summary';
  defaultModel: string;
  autoGenerateImages: boolean;
  
  // Privacy settings
  saveHistory: boolean;
  collectAnalytics: boolean;
  shareImprovementData: boolean;
  
  // Notification settings
  soundEnabled: boolean;
  desktopNotifications: boolean;
  
  // Accessibility settings
  highContrast: boolean;
  reducedMotion: boolean;
  
  // Advanced settings
  debugMode: boolean;
  apiEndpoint: string;
};

const defaultSettings: SettingsState = {
  // Appearance settings
  theme: 'dark',
  animationsEnabled: true,
  accentColor: '#9b87f5',
  fontSize: 16,
  
  // Voice settings
  voiceEnabled: true,
  selectedVoice: '',
  speechRate: 1,
  speechPitch: 1,
  speechVolume: 1,
  
  // AI settings
  rememberChat: true,
  modelContext: 'full',
  defaultModel: 'gpt-4o',
  autoGenerateImages: false,
  
  // Privacy settings
  saveHistory: true,
  collectAnalytics: true,
  shareImprovementData: false,
  
  // Notification settings
  soundEnabled: true,
  desktopNotifications: false,
  
  // Accessibility settings
  highContrast: false,
  reducedMotion: false,
  
  // Advanced settings
  debugMode: false,
  apiEndpoint: 'https://api.puter.com/',
};

const KamiSettings: React.FC = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('appearance');
  
  const speechService = SpeechService.getInstance();
  
  const applyThemeChanges = (settings: SettingsState) => {
    // Apply theme
    document.documentElement.classList.toggle('dark-theme', settings.theme === 'dark');
    document.documentElement.classList.toggle('light-theme', settings.theme === 'light');
    
    // Apply system theme if selected
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark-theme', prefersDark);
      document.documentElement.classList.toggle('light-theme', !prefersDark);
    }
    
    // Apply high contrast if enabled
    document.documentElement.classList.toggle('high-contrast', settings.highContrast);
    
    // Apply reduced motion if enabled
    document.documentElement.classList.toggle('reduced-motion', settings.reducedMotion);
    
    // Set accent color CSS variables
    document.documentElement.style.setProperty('--accent-color', settings.accentColor);
    document.documentElement.style.setProperty('--primary-rgb', hexToRgb(settings.accentColor));
    
    // Set font size
    document.documentElement.style.fontSize = `${settings.fontSize}px`;
  };
  
  const hexToRgb = (hex: string) => {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Return RGB values
    return isNaN(r) || isNaN(g) || isNaN(b) ? '155 135 245' : `${r} ${g} ${b}`;
  };
  
  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('kamiSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        
        // Apply theme changes immediately
        applyThemeChanges({ ...defaultSettings, ...parsedSettings });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
    
    // Load available voices
    const loadVoices = () => {
      const availableVoices = speechService.getVoices();
      setVoices(availableVoices);
      
      // Set default voice if not already set
      if (!settings.selectedVoice && availableVoices.length > 0) {
        const defaultVoice = availableVoices.find(voice => voice.default)?.voiceURI || availableVoices[0].voiceURI;
        handleSettingChange('selectedVoice', defaultVoice);
      }
    };
    
    // Load voices immediately and also when they become available
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);
  
  useEffect(() => {
    localStorage.setItem('kamiSettings', JSON.stringify(settings));
    
    // Update voice settings
    const selectedVoiceObj = voices.find(voice => voice.voiceURI === settings.selectedVoice);
    speechService.updateSettings({
      pitch: settings.speechPitch,
      rate: settings.speechRate,
      volume: settings.speechVolume,
      voice: selectedVoiceObj || null
    });
    
    // Apply theme changes
    applyThemeChanges(settings);
    
  }, [settings, voices]);
  
  const handleSettingChange = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Show toast for theme changes
    if (key === 'theme') {
      toast.success(`Theme changed to ${value}`);
    } else if (key === 'accentColor') {
      toast.success('Accent color updated');
    }
  };
  
  const resetSettings = () => {
    setSettings(defaultSettings);
    toast.success('Settings reset to defaults');
  };
  
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'kami-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Settings exported successfully');
  };
  
  const testVoice = () => {
    const testPhrase = "Hello! This is a test of the Kami voice system.";
    speechService.speak(testPhrase);
    toast.info('Testing voice...');
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => setIsOpen(true)}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:max-w-lg overflow-y-auto bg-cosmic border-cosmic-accent/30">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>KamiAI Settings</span>
          </SheetTitle>
          <SheetDescription>
            Customize your KamiAI experience with these settings.
          </SheetDescription>
        </SheetHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="appearance" className="text-xs sm:text-sm">Appearance</TabsTrigger>
            <TabsTrigger value="voice" className="text-xs sm:text-sm">Voice</TabsTrigger>
            <TabsTrigger value="music" className="text-xs sm:text-sm">Music</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs sm:text-sm">AI</TabsTrigger>
            <TabsTrigger value="misc" className="text-xs sm:text-sm">More</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex flex-col gap-2">
                <Label>Theme</Label>
                <Select
                  value={settings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value as 'dark' | 'light' | 'system')}
                >
                  <SelectTrigger className="bg-cosmic-light/30 border-cosmic-accent/30">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Animations</Label>
                <Switch
                  checked={settings.animationsEnabled}
                  onCheckedChange={(checked) => handleSettingChange('animationsEnabled', checked)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                    className="w-12 h-10 p-1 bg-cosmic-light/30 border-cosmic-accent/30"
                  />
                  <Input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                    className="flex-grow bg-cosmic-light/30 border-cosmic-accent/30"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label>Font Size: {settings.fontSize}px</Label>
                </div>
                <Slider
                  min={12}
                  max={24}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value) => handleSettingChange('fontSize', value[0])}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label>Enable Voice</Label>
                <Switch
                  checked={settings.voiceEnabled}
                  onCheckedChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Voice</Label>
                <Select
                  value={settings.selectedVoice}
                  onValueChange={(value) => handleSettingChange('selectedVoice', value)}
                  disabled={!settings.voiceEnabled}
                >
                  <SelectTrigger className="bg-cosmic-light/30 border-cosmic-accent/30">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {voices.map((voice) => (
                      <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label>Speech Rate: {settings.speechRate.toFixed(1)}x</Label>
                </div>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.speechRate]}
                  onValueChange={(value) => handleSettingChange('speechRate', value[0])}
                  disabled={!settings.voiceEnabled}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label>Pitch: {settings.speechPitch.toFixed(1)}</Label>
                </div>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[settings.speechPitch]}
                  onValueChange={(value) => handleSettingChange('speechPitch', value[0])}
                  disabled={!settings.voiceEnabled}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <Label>Volume: {Math.round(settings.speechVolume * 100)}%</Label>
                </div>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={[settings.speechVolume]}
                  onValueChange={(value) => handleSettingChange('speechVolume', value[0])}
                  disabled={!settings.voiceEnabled}
                />
              </div>
              
              <Button 
                onClick={testVoice}
                disabled={!settings.voiceEnabled}
                className="mt-2"
              >
                Test Voice
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="music" className="pt-4">
            <BackgroundSettings />
          </TabsContent>
          
          <TabsContent value="ai" className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label>Remember Chat History</Label>
                <Switch
                  checked={settings.rememberChat}
                  onCheckedChange={(checked) => handleSettingChange('rememberChat', checked)}
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Context Mode</Label>
                <Select
                  value={settings.modelContext}
                  onValueChange={(value) => handleSettingChange('modelContext', value as 'full' | 'recent' | 'summary')}
                >
                  <SelectTrigger className="bg-cosmic-light/30 border-cosmic-accent/30">
                    <SelectValue placeholder="Select context mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full History</SelectItem>
                    <SelectItem value="recent">Recent Messages</SelectItem>
                    <SelectItem value="summary">Summarized History</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex flex-col gap-2">
                <Label>Default AI Model</Label>
                <Select
                  value={settings.defaultModel}
                  onValueChange={(value) => handleSettingChange('defaultModel', value)}
                >
                  <SelectTrigger className="bg-cosmic-light/30 border-cosmic-accent/30">
                    <SelectValue placeholder="Select default model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="claude-3-7-sonnet">Claude 3.7</SelectItem>
                    <SelectItem value="meta-llama/llama-3.3-70b-instruct">Llama 3.3</SelectItem>
                    <SelectItem value="deepseek-reasoner">DeepSeek Reasoner</SelectItem>
                    <SelectItem value="google/gemini-2.5-pro-exp-03-25:free">Gemini 2.5 Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Auto-Generate Images</Label>
                <Switch
                  checked={settings.autoGenerateImages}
                  onCheckedChange={(checked) => handleSettingChange('autoGenerateImages', checked)}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="misc" className="space-y-4 pt-4">
            <Tabs defaultValue="privacy">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="privacy">Privacy</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>
              
              <TabsContent value="privacy" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>Save Chat History Locally</Label>
                    <Switch
                      checked={settings.saveHistory}
                      onCheckedChange={(checked) => handleSettingChange('saveHistory', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Allow Analytics</Label>
                    <Switch
                      checked={settings.collectAnalytics}
                      onCheckedChange={(checked) => handleSettingChange('collectAnalytics', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Share Data for Improvement</Label>
                    <Switch
                      checked={settings.shareImprovementData}
                      onCheckedChange={(checked) => handleSettingChange('shareImprovementData', checked)}
                    />
                  </div>
                  
                  <Button variant="outline" className="mt-2" onClick={() => toast.success("Cache and browsing data cleared")}>
                    Clear All Data
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="accessibility" className="space-y-4 pt-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <Label>High Contrast Mode</Label>
                    <Switch
                      checked={settings.highContrast}
                      onCheckedChange={(checked) => handleSettingChange('highContrast', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Reduced Motion</Label>
                    <Switch
                      checked={settings.reducedMotion}
                      onCheckedChange={(checked) => handleSettingChange('reducedMotion', checked)}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="about" className="space-y-4 pt-4">
                <div className="grid gap-4 text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <h3 className="text-xl font-bold mb-2">
                      <span className="text-neon-magenta">Kami</span>
                      <span className="text-neon-cyan">AI</span>
                    </h3>
                    <p className="text-sm opacity-80 mb-4">Version 1.0.0</p>
                  </motion.div>
                  
                  <p className="text-sm opacity-70">
                    Created by <span className="font-bold text-neon-cyan">Rishab</span>
                  </p>
                  
                  <div className="flex gap-2 justify-center mt-4">
                    <Button variant="outline" onClick={resetSettings}>
                      Reset All Settings
                    </Button>
                    <Button variant="outline" onClick={exportSettings}>
                      Export Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default KamiSettings;
