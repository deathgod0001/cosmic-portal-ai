
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Play, Square, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechService from '@/services/SpeechService';

interface KamiVoiceProps {
  text: string;
}

const KamiVoice: React.FC<KamiVoiceProps> = ({ text }) => {
  const speechService = SpeechService.getInstance();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [volume, setVolume] = useState(speechService.getSettings().volume);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSpeech = async () => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      setIsPreparing(true);
      try {
        const success = await speechService.speak(text);
        setIsSpeaking(success);
      } catch (error) {
        console.error("Speech error:", error);
      } finally {
        setIsPreparing(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    speechService.updateSettings({ volume: newVolume });
  };

  useEffect(() => {
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
    };

    // Add event listener for speech end
    speechService.addEventListener('end', handleSpeechEnd);
    
    // Check speech status periodically
    const checkSpeechStatus = setInterval(() => {
      if (isSpeaking && !speechService.getSpeakingStatus()) {
        setIsSpeaking(false);
      }
    }, 500);
    
    return () => {
      // Clean up
      speechService.removeEventListener('end', handleSpeechEnd);
      clearInterval(checkSpeechStatus);
      if (isSpeaking) {
        speechService.stop();
      }
    };
  }, [isSpeaking]);

  return (
    <AnimatePresence>
      <motion.div 
        className={`flex items-center gap-2 ${isExpanded ? 'w-52' : 'w-auto'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSpeech}
            disabled={isPreparing}
            className={`bg-cosmic-light/20 border-cosmic-accent/30 transition-all ${
              isSpeaking 
                ? 'text-neon-magenta hover:text-neon-magenta/80 glow' 
                : 'text-neon-cyan hover:text-neon-cyan/80'
            }`}
          >
            {isPreparing ? (
              <Loader2 size={16} className="animate-spin mr-2" />
            ) : isSpeaking ? (
              <Square size={16} className="mr-2" />
            ) : (
              <Play size={16} className="mr-2" />
            )}
            <span>Kami Voice</span>
          </Button>
        </motion.div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-0 h-8 w-8 rounded-full hover:bg-cosmic-light/30"
        >
          {volume > 0 ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </Button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="flex-grow"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                className="w-full"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default KamiVoice;
