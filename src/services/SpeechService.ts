
type VoiceSettings = {
  pitch: number;
  rate: number;
  volume: number;
  voice: SpeechSynthesisVoice | null;
};

type SpeechEventType = 'end' | 'start' | 'pause' | 'resume' | 'error';
type SpeechEventCallback = () => void;

class SpeechService {
  private static instance: SpeechService;
  private synth: SpeechSynthesis;
  private isSpeaking: boolean = false;
  private settings: VoiceSettings = {
    pitch: 1,
    rate: 1,
    volume: 1,
    voice: null,
  };
  private utterance: SpeechSynthesisUtterance | null = null;
  private eventListeners: Map<SpeechEventType, SpeechEventCallback[]> = new Map();

  private constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoiceSettings();
    
    // Initialize event listener collections
    this.eventListeners.set('start', []);
    this.eventListeners.set('end', []);
    this.eventListeners.set('pause', []);
    this.eventListeners.set('resume', []);
    this.eventListeners.set('error', []);
    
    // Event handlers for speech synthesis changes
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.stop(); // Ensure speech stops when navigating away
      });
    }
  }

  public static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  public speak(text: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!text) {
        resolve(false);
        return;
      }
      
      // First stop any existing speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.utterance = utterance;
      
      utterance.pitch = this.settings.pitch;
      utterance.rate = this.settings.rate;
      utterance.volume = this.settings.volume;
      
      if (this.settings.voice) {
        utterance.voice = this.settings.voice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        this.dispatchEvent('start');
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.utterance = null;
        this.dispatchEvent('end');
        resolve(true);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.isSpeaking = false;
        this.utterance = null;
        this.dispatchEvent('error');
        reject(event);
      };

      this.synth.speak(utterance);
    });
  }

  public stop(): void {
    if (this.isSpeaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.utterance = null;
      this.dispatchEvent('end');
    }
  }

  public pause(): void {
    if (this.isSpeaking) {
      this.synth.pause();
      this.dispatchEvent('pause');
    }
  }

  public resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
      this.dispatchEvent('resume');
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public updateSettings(settings: Partial<VoiceSettings>): void {
    this.settings = { ...this.settings, ...settings };
    
    // Update current utterance if there is one
    if (this.utterance) {
      if (settings.pitch !== undefined) this.utterance.pitch = settings.pitch;
      if (settings.rate !== undefined) this.utterance.rate = settings.rate;
      if (settings.volume !== undefined) this.utterance.volume = settings.volume;
      if (settings.voice !== undefined) this.utterance.voice = settings.voice;
    }
    
    this.saveVoiceSettings();
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public getSpeakingStatus(): boolean {
    return this.isSpeaking;
  }

  // Event handling methods
  public addEventListener(eventType: SpeechEventType, callback: SpeechEventCallback): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(callback);
    this.eventListeners.set(eventType, listeners);
  }

  public removeEventListener(eventType: SpeechEventType, callback: SpeechEventCallback): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const updatedListeners = listeners.filter(cb => cb !== callback);
    this.eventListeners.set(eventType, updatedListeners);
  }

  private dispatchEvent(eventType: SpeechEventType): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => callback());
  }

  private loadVoiceSettings(): void {
    try {
      const savedSettings = localStorage.getItem('kamiVoiceSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        // We can't serialize the voice object, so we need to get it again
        let voice = null;
        if (parsedSettings.voiceURI) {
          setTimeout(() => {
            const voices = this.synth.getVoices();
            voice = voices.find(v => v.voiceURI === parsedSettings.voiceURI) || null;
            this.settings.voice = voice;
          }, 100);
        }
        
        this.settings = {
          ...this.settings,
          pitch: parsedSettings.pitch || 1,
          rate: parsedSettings.rate || 1,
          volume: parsedSettings.volume || 1,
        };
      }
    } catch (error) {
      console.error('Error loading voice settings:', error);
    }
  }

  private saveVoiceSettings(): void {
    try {
      const settingsToSave = {
        ...this.settings,
        voiceURI: this.settings.voice?.voiceURI || null,
      };
      localStorage.setItem('kamiVoiceSettings', JSON.stringify(settingsToSave));
    } catch (error) {
      console.error('Error saving voice settings:', error);
    }
  }
}

export default SpeechService;
