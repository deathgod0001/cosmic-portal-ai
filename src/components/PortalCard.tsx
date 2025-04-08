
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface PortalCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const PortalCard: React.FC<PortalCardProps> = ({
  title,
  description,
  icon,
  className,
  children
}) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      
      // Calculate rotation based on mouse position
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 25;
      const rotateY = (centerX - x) / 25;
      
      // Calculate glow position
      const glowX = (x / rect.width) * 100;
      const glowY = (y / rect.height) * 100;
      
      setRotation({ x: rotateX, y: rotateY });
      setGlowPosition({ x: glowX, y: glowY });
    }
  };
  
  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlowPosition({ x: 50, y: 50 });
  };
  
  return (
    <div 
      ref={cardRef}
      className={cn(
        "portal-card p-6 transition-all duration-300",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
    >
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none" 
        style={{
          background: `radial-gradient(circle at ${glowPosition.x}% ${glowPosition.y}%, rgba(217, 70, 239, 0.4), transparent 50%)`
        }}
      />
      
      <div className="relative z-10">
        {icon && (
          <div className="mb-4 w-12 h-12 bg-kami-cosmic/20 rounded-full flex items-center justify-center">
            {icon}
          </div>
        )}
        
        <h3 className="cosmic-text text-xl font-bold mb-2">{title}</h3>
        <p className="text-kami-ethereal/80 mb-4">{description}</p>
        
        {children}
      </div>
    </div>
  );
};

export default PortalCard;
