import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Watch } from 'lucide-react';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if splash has already been shown this session
    const splashShown = sessionStorage.getItem('timeora_splash_shown');
    
    if (splashShown) {
      // Splash already shown, go directly to account type selection
      navigate('/choose', { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      sessionStorage.setItem('timeora_splash_shown', 'true');
      navigate('/choose', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0b0b0d]">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(45,212,191,0.3) 0%, transparent 70%)',
            animation: 'splashPulse 2s ease-in-out infinite'
          }}
        />
      </div>

      {/* Logo container */}
      <div 
        className="relative flex flex-col items-center space-y-6"
        style={{ animation: 'splashFadeIn 0.8s ease-out' }}
      >
        {/* Watch icon with border animation */}
        <div className="relative">
          <div 
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{
              border: '2px solid rgba(45,212,191,0.4)',
              animation: 'splashBorderPulse 1.5s ease-in-out infinite'
            }}
          >
            <Watch size={44} className="text-[#2dd4bf]" />
          </div>
          {/* Rotating ring */}
          <div 
            className="absolute inset-0 w-24 h-24 rounded-full"
            style={{
              border: '2px solid transparent',
              borderTopColor: '#2dd4bf',
              animation: 'splashSpin 1.5s linear infinite'
            }}
          />
        </div>

        {/* Brand name */}
        <div className="text-center">
          <h1 
            className="font-['Cinzel'] tracking-[0.4em] text-4xl sm:text-5xl font-bold text-white"
            style={{ animation: 'splashTextFadeIn 1s ease-out 0.3s both' }}
          >
            TIMEORA
          </h1>
          <p 
            className="text-[11px] uppercase tracking-[0.5em] text-[#2dd4bf] mt-2 font-medium"
            style={{ animation: 'splashTextFadeIn 1s ease-out 0.6s both' }}
          >
            Geneve
          </p>
        </div>

        {/* Loading indicator */}
        <div 
          className="flex items-center space-x-2 mt-4"
          style={{ animation: 'splashTextFadeIn 1s ease-out 0.9s both' }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-[#2dd4bf] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes splashPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.15; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.25; }
        }
        @keyframes splashFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashBorderPulse {
          0%, 100% { border-color: rgba(45,212,191,0.3); }
          50% { border-color: rgba(45,212,191,0.7); }
        }
        @keyframes splashSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes splashTextFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
