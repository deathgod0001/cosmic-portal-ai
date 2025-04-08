
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface MagicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'celestial' | 'azure';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
  rippleEffect?: boolean;
}

const MagicButton = React.forwardRef<HTMLButtonElement, MagicButtonProps>(({
  variant = 'default',
  size = 'md',
  children,
  className,
  rippleEffect = true,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (rippleEffect) {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const ripple = {
        x,
        y,
        id: Date.now()
      };
      
      setRipples((prevRipples) => [...prevRipples, ripple]);
      
      // Clean up ripples
      setTimeout(() => {
        setRipples((prevRipples) => 
          prevRipples.filter((r) => r.id !== ripple.id)
        );
      }, 1000); // Match animation duration
    }
    
    if (props.onClick) {
      props.onClick(event);
    }
  };
  
  const variantClasses = {
    default: 'bg-cosmic-gradient text-white',
    celestial: 'bg-gradient-to-r from-kami-celestial to-kami-cosmic text-white',
    azure: 'bg-gradient-to-r from-kami-cosmic to-kami-azure text-white',
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-6',
    lg: 'h-14 px-8 text-lg',
  };
  
  return (
    <button
      ref={ref}
      className={cn(
        "relative rounded-full font-medium transition-all duration-300 focus:outline-none magic-button",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      {children}
    </button>
  );
});

MagicButton.displayName = 'MagicButton';

export default MagicButton;
