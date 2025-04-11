
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

declare global {
  interface Window {
    puter: any;
  }
}

const KamiImage = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt first");
      return;
    }
    
    setIsLoading(true);
    setGeneratedImage(null);
    
    try {
      // Check if puter.js is loaded
      if (!window.puter) {
        const script = document.createElement('script');
        script.src = 'https://js.puter.com/v2/';
        script.async = true;
        document.body.appendChild(script);
        
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }
      
      // Call puter.ai.txt2img function
      try {
        const response = await window.puter.ai.txt2img(
          prompt,
          {
            model: 'sd3:free',
            width: 512, 
            height: 512,
            guidance_scale: 7.5,
          }
        );
        
        // Handle the response
        if (response && response.src) {
          setGeneratedImage(response.src);
          toast.success("Image generated successfully!");
        } else {
          throw new Error("Failed to generate image");
        }
      } catch (error) {
        console.error("Image generation error:", error);
        toast.error("Failed to generate image. Please try again.");
      }
    } catch (error) {
      console.error("Error loading puter.js:", error);
      toast.error("Failed to load AI service. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `kami-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded successfully!");
  };

  const handleRegenerateImage = () => {
    handleGenerateImage();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <div className="relative">
          <Input
            placeholder="Describe the image you want to generate..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-cosmic-light/20 border-cosmic-accent/30"
            disabled={isLoading}
          />
          <Button 
            className="absolute right-1 top-1 bottom-1 cosmic-button"
            onClick={handleGenerateImage}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Generate"}
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          Try to be specific in your prompts for better results. Include details like style, lighting, and composition.
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-10 bg-cosmic-light/10 border border-cosmic-accent/20 rounded-lg min-h-[256px]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-neon-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-neon-magenta">Generating your cosmic vision...</p>
          </div>
        </div>
      ) : generatedImage ? (
        <motion.div 
          className="relative border border-cosmic-accent/40 rounded-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img 
            src={generatedImage} 
            alt={prompt} 
            className="w-full h-auto"
          />
          
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button 
              size="sm"
              variant="outline"
              className="bg-cosmic/80 border-neon-cyan/40 backdrop-blur-sm"
              onClick={handleRegenerateImage}
            >
              <RefreshCw size={16} className="mr-2" />
              Regenerate
            </Button>
            <Button 
              size="sm"
              variant="outline"
              className="bg-cosmic/80 border-neon-cyan/40 backdrop-blur-sm"
              onClick={handleDownloadImage}
            >
              <Download size={16} className="mr-2" />
              Download
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-center p-10 bg-cosmic-light/10 border border-cosmic-accent/20 rounded-lg min-h-[256px]">
          <p className="text-sm text-muted-foreground">Enter a prompt and click "Generate" to create an image</p>
        </div>
      )}
      
      <div className="text-sm">
        <h4 className="font-medium mb-2 text-neon-cyan">Prompt Tips:</h4>
        <ul className="list-disc pl-5 space-y-1 text-ethereal-white/80">
          <li>Include art style references like "oil painting", "digital art", or "photograph"</li>
          <li>Mention lighting conditions like "sunset", "dramatic lighting", or "neon lights"</li>
          <li>Specify camera angles like "close-up", "wide shot", or "aerial view"</li>
          <li>Add emotional qualities like "serene", "dystopian", or "whimsical"</li>
        </ul>
      </div>
    </div>
  );
};

export default KamiImage;
