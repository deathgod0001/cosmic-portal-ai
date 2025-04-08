
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MagicButton from './MagicButton';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    { name: 'Home', path: '/home' },
    { name: 'KamiChat', path: '/chat' },
    { name: 'KamiQuest', path: '/quest' }
  ];
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link 
            to="/home" 
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 rounded-full bg-cosmic-gradient flex items-center justify-center overflow-hidden group-hover:animate-pulse-glow">
              <span className="text-white text-xl font-bold">神</span>
            </div>
            <span className="cosmic-text font-bold text-2xl">KamiAI</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative font-medium transition-colors duration-300 ${
                    isActive 
                      ? 'cosmic-text' 
                      : 'text-kami-ethereal hover:text-white'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-cosmic-gradient" />
                  )}
                </Link>
              );
            })}
          </div>
          
          {/* CTA Button */}
          <div className="hidden md:block">
            <MagicButton size="sm">
              Begin Journey
            </MagicButton>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-full bg-kami-void focus:outline-none focus:ring-2 focus:ring-kami-cosmic"
            >
              <span className="sr-only">Open menu</span>
              <div className="w-6 h-6 flex flex-col justify-between items-center">
                <span className={`block h-0.5 w-full bg-cosmic-gradient rounded transition-transform duration-300 ${
                  isOpen ? 'rotate-45 translate-y-2.5' : ''
                }`} />
                <span className={`block h-0.5 w-full bg-cosmic-gradient rounded transition-opacity duration-300 ${
                  isOpen ? 'opacity-0' : ''
                }`} />
                <span className={`block h-0.5 w-full bg-cosmic-gradient rounded transition-transform duration-300 ${
                  isOpen ? '-rotate-45 -translate-y-2.5' : ''
                }`} />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden glassmorphism fixed inset-x-0 top-20 transition-transform duration-300 origin-top z-40 ${
        isOpen ? 'scale-y-100' : 'scale-y-0'
      }`}>
        <div className="px-4 pt-2 pb-4 space-y-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 px-4 rounded-lg ${
                  isActive 
                    ? 'cosmic-text bg-kami-void/50' 
                    : 'text-kami-ethereal hover:bg-kami-void/30'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
          
          <div className="pt-2">
            <MagicButton className="w-full">
              Begin Journey
            </MagicButton>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
