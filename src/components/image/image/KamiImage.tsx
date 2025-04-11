
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, RefreshCw, Download, X } from 'lucide-react';
import { toast } from 'sonner';

const KamiImage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<HTMLImageElement | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description for the image");
      return;
    }

    setIsGenerating(true);

    try {
      // Ensure puter.js is loaded
      if (!window.puter) {
        // Load puter.js script if not already loaded
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://js.puter.com/v2/';
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load puter.js"));
          document.body.appendChild(script);
        });
      }

      const imageElement = await window.puter.ai.txt2img(prompt);
      setGeneratedImage(imageElement);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    setGeneratedImage(null);
    setPrompt('');
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage.src;
    link.download = `kami-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded successfully!");
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Describe the image you want to generate..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-cosmic-light/30 border-cosmic-accent/30"
          disabled={isGenerating || !!generatedImage}
        />
        <Button
          onClick={generatedImage ? handleReset : generateImage}
          disabled={isGenerating || (!prompt.trim() && !generatedImage)}
          className="cosmic-button whitespace-nowrap"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : generatedImage ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              New Image
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>

      {generatedImage && (
        <motion.div
          className="relative rounded-lg overflow-hidden border border-cosmic-accent/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="bg-cosmic/80 hover:bg-cosmic-light/50"
              onClick={handleDownload}
            >
              <Download size={16} />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-cosmic/80 hover:bg-cosmic-light/50"
              onClick={handleReset}
            >
              <X size={16} />
            </Button>
          </div>
          <div className="flex justify-center p-4">
            <img
              src={generatedImage.src}
              alt={prompt}
              className="max-w-full max-h-[400px] rounded-md"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default KamiImage;
