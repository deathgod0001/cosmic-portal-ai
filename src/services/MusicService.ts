type MusicSource = {
  type: 'local' | 'youtube' | 'uploaded';
  url: string;
  title: string;
};

type MusicSettings = {
  volume: number;
  autoplay: boolean;
  loop: boolean;
  currentSource: MusicSource | null;
  recentTracks: MusicSource[];
};

type MusicEventType = 'play' | 'pause' | 'end' | 'volumeChange' | 'trackChange';

class MusicService {
  private static instance: MusicService;
  private audio: HTMLAudioElement | null = null;
  private settings: MusicSettings = {
    volume: 0.5,
    autoplay: false,
    loop: true,
    currentSource: null,
    recentTracks: [],
  };
  private eventListeners: Record<MusicEventType, Function[]> = {
    play: [],
    pause: [],
    end: [],
    volumeChange: [],
    trackChange: [],
  };
  
  private constructor() {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('kamiMusicSettings');
    if (savedSettings) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      } catch (error) {
        console.error("Error loading music settings:", error);
      }
    }
    
    // Initialize audio element
    this.initAudio();
  }
  
  private initAudio() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
      this.audio.volume = this.settings.volume;
      this.audio.loop = this.settings.loop;
      
      // Add event listeners
      this.audio.addEventListener('ended', () => this.triggerEvent('end'));
      this.audio.addEventListener('play', () => this.triggerEvent('play'));
      this.audio.addEventListener('pause', () => this.triggerEvent('pause'));
      
      // If we have a saved track, try to load it
      if (this.settings.currentSource) {
        this.loadTrack(this.settings.currentSource);
        if (this.settings.autoplay) {
          this.play();
        }
      }
    }
  }
  
  public static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }
  
  public addEventListener(event: MusicEventType, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].push(callback);
    }
  }
  
  public removeEventListener(event: MusicEventType, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }
  
  private triggerEvent(event: MusicEventType, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }
  
  public loadTrack(source: MusicSource) {
    if (!this.audio) return;
    
    // Save current track to recent tracks if it exists
    if (this.settings.currentSource && 
        this.settings.recentTracks.findIndex(t => t.url === this.settings.currentSource?.url) === -1) {
      this.settings.recentTracks.unshift(this.settings.currentSource);
      // Keep only the last 10 tracks
      this.settings.recentTracks = this.settings.recentTracks.slice(0, 10);
    }
    
    this.settings.currentSource = source;
    this.audio.src = source.url;
    this.audio.load();
    this.saveSettings();
    this.triggerEvent('trackChange', source);
  }
  
  public play() {
    if (this.audio && this.settings.currentSource) {
      this.audio.play()
        .catch(error => {
          console.error("Error playing audio:", error);
        });
    }
  }
  
  public pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }
  
  public toggle() {
    if (!this.audio) return;
    
    if (this.audio.paused) {
      this.play();
    } else {
      this.pause();
    }
  }
  
  public getSettings(): MusicSettings {
    return { ...this.settings };
  }
  
  public updateSettings(newSettings: Partial<MusicSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Apply settings to audio element
    if (this.audio) {
      if (newSettings.volume !== undefined) {
        this.audio.volume = newSettings.volume;
        this.triggerEvent('volumeChange', newSettings.volume);
      }
      
      if (newSettings.loop !== undefined) {
        this.audio.loop = newSettings.loop;
      }
    }
    
    this.saveSettings();
  }
  
  public getCurrentTime(): number {
    return this.audio ? this.audio.currentTime : 0;
  }
  
  public getDuration(): number {
    return this.audio ? this.audio.duration : 0;
  }
  
  public isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false;
  }
  
  public seekTo(time: number) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }
  
  // YouTube API integration
  public async searchYouTube(query: string): Promise<{ title: string, videoId: string }[]> {
    try {
      // Note: This would typically use an API key, but for demo purposes we're simulating results
      // In a real app, you would use the YouTube Data API
      return [
        { title: "Daylight - Sample Track", videoId: "sample1" },
        { title: "Morning Light - Ambient Music", videoId: "sample2" },
        { title: "Cosmic Dreams - Space Ambient", videoId: "sample3" },
      ];
    } catch (error) {
      console.error("Error searching YouTube:", error);
      return [];
    }
  }
  
  public getYouTubeURL(videoId: string): string {
    // This is a simplified approach - in a real app you'd need to use proper YouTube embedding or APIs
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
  
  private saveSettings() {
    try {
      localStorage.setItem('kamiMusicSettings', JSON.stringify(this.settings));
    } catch (error) {
      console.error("Error saving music settings:", error);
    }
  }
}

export default MusicService;
