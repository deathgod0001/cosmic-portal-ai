
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { useNavigate } from 'react-router-dom';

const LoadingScreen = () => {
  const loadingRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressTextRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    let progress = 0;
    const duration = 3; // seconds to complete loading
    const interval = 30; // update interval in ms
    const step = 100 / (duration * 1000 / interval);
    
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + step, 100);
      
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress}%`;
      }
      
      if (progressTextRef.current) {
        progressTextRef.current.textContent = `${Math.floor(progress)}%`;
      }
      
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Animate out loading screen
        gsap.to(loadingRef.current, {
          opacity: 0,
          duration: 0.8,
          delay: 0.5,
          onComplete: () => {
            navigate('/home');
          }
        });
      }
    }, interval);
    
    return () => clearInterval(progressInterval);
  }, [navigate]);
  
  return (
    <div 
      ref={loadingRef} 
      className="fixed inset-0 z-50 flex items-center justify-center bg-kami-void"
    >
      <div className="flex flex-col items-center w-full max-w-md p-8">
        <div className="w-40 h-40 mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-cosmic-gradient animate-rotate-slow"></div>
          <div className="absolute inset-1 rounded-full bg-kami-void flex items-center justify-center">
            <span className="cosmic-text text-4xl font-bold">神</span>
          </div>
        </div>
        
        <h1 className="cosmic-text text-3xl font-bold mb-2">KamiAI</h1>
        <p className="text-kami-ethereal text-sm mb-8">Initializing Transcendental Portal</p>
        
        <div className="w-full bg-kami-void/50 h-2 rounded-full mb-2 overflow-hidden">
          <div 
            ref={progressBarRef}
            className="h-full bg-cosmic-gradient rounded-full"
            style={{ width: '0%' }}  
          ></div>
        </div>
        
        <div className="flex justify-between w-full text-sm text-kami-ethereal/80">
          <span>Loading Experience</span>
          <span ref={progressTextRef}>0%</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
