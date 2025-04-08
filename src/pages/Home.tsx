
import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import ThreeJSBackground from '@/components/ThreeJSBackground';
import MagicButton from '@/components/MagicButton';
import PortalCard from '@/components/PortalCard';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';

const Home: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Animate hero section
    if (heroRef.current) {
      const tl = gsap.timeline();
      
      tl.fromTo(
        heroRef.current.querySelector('.hero-title'),
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }
      );
      
      tl.fromTo(
        heroRef.current.querySelector('.hero-subtitle'),
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
        '-=0.6'
      );
      
      tl.fromTo(
        heroRef.current.querySelectorAll('.hero-button'),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power2.out' },
        '-=0.4'
      );
    }
    
    // Animate cards
    if (cardsRef.current) {
      gsap.fromTo(
        cardsRef.current.querySelectorAll('.animate-card'),
        { opacity: 0, y: 50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 80%',
          }
        }
      );
    }
  }, []);
  
  return (
    <>
      <ThreeJSBackground />
      
      <div className="min-h-screen cosmos-bg">
        <Navigation />
        
        {/* Hero Section */}
        <section 
          ref={heroRef}
          className="min-h-screen flex flex-col justify-center pt-20 px-4 md:px-8"
        >
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="hero-title text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              <span className="cosmic-text">Enter the</span>
              <br />
              <span className="relative">
                Transcendental Portal
                <span className="absolute inset-0 blur-lg opacity-50 bg-cosmic-gradient rounded-full"></span>
              </span>
            </h1>
            
            <p className="hero-subtitle text-lg md:text-xl text-kami-ethereal/80 max-w-2xl mx-auto mb-8">
              A hyper-intelligent AI fusion of ethereal magic and futuristic anime artistry, 
              crafted to transcend reality and redefine imagination.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 justify-center hero-button">
              <Link to="/chat">
                <MagicButton size="lg">
                  Experience KamiChat
                </MagicButton>
              </Link>
              
              <Link to="/quest" className="hero-button">
                <MagicButton 
                  size="lg"
                  variant="celestial"
                >
                  Begin KamiQuest
                </MagicButton>
              </Link>
            </div>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center animate-bounce">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-kami-ethereal" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 9l-7 7-7-7" 
              />
            </svg>
          </div>
        </section>
        
        {/* Features Section */}
        <section 
          ref={cardsRef}
          className="py-16 px-4 md:px-8"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="cosmic-text text-3xl md:text-4xl font-bold text-center mb-12">
              Magical Dimensions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <PortalCard 
                className="animate-card"
                title="KamiChat"
                description="Engage with hyper-intelligent AI using multiple models, from GPT-4o to Claude and Llama. Export chat histories and experience context-aware conversations."
                icon={
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-kami-cosmic" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
                    />
                  </svg>
                }
              >
                <Link to="/chat">
                  <MagicButton className="w-full">
                    Begin Conversation
                  </MagicButton>
                </Link>
              </PortalCard>
              
              <PortalCard 
                className="animate-card"
                title="KamiQuest"
                description="Embark on an odyssey of knowledge. Find answers and insights beyond what conventional search can provide, with source verification and deep exploration."
                icon={
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 text-kami-cosmic" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                }
              >
                <Link to="/quest">
                  <MagicButton 
                    className="w-full"
                    variant="celestial"
                  >
                    Begin Quest
                  </MagicButton>
                </Link>
              </PortalCard>
            </div>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="py-8 px-4 md:px-8 border-t border-kami-cosmic/20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="mb-4">
              <span className="cosmic-text font-bold text-xl">KamiAI</span>
            </div>
            
            <p className="text-sm text-kami-ethereal/60">
              A transcendental fusion of hyper-intelligent AI, ethereal magic, and futuristic anime artistry.
              <br />
              Envisioned by the mind of Rishab.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
