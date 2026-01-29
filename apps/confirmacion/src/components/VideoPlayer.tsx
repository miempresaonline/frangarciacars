import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Minimize
} from 'lucide-react';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnmutedOnce, setHasUnmutedOnce] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const settingsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      video.muted = true;
      setIsMuted(true);
      video.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
      });
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).webkitCurrentFullScreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const vol = parseFloat(e.target.value);
    video.volume = vol;
    setVolume(vol);
    if (vol === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.muted) {
      if (!hasUnmutedOnce) {
        video.currentTime = 0;
        setHasUnmutedOnce(true);
      }
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        video.volume = 0.5;
        setVolume(0.5);
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        } else if ((video as any).mozRequestFullScreen) {
          await (video as any).mozRequestFullScreen();
        } else if ((video as any).msRequestFullscreen) {
          await (video as any).msRequestFullscreen();
        }

        if (window.screen.orientation && window.screen.orientation.lock) {
          try {
            await window.screen.orientation.lock('landscape');
          } catch {
            console.log('Orientation lock not supported');
          }
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).webkitCancelFullScreen) {
          await (document as any).webkitCancelFullScreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }

        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    if (window.innerWidth >= 640) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSettings(false);
        }
      }, 3000);
    }
  };

  const handleTouchStart = () => {
    if (window.innerWidth < 640) {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    if (!showSettings) {
      if (settingsTimeoutRef.current) {
        clearTimeout(settingsTimeoutRef.current);
      }
      settingsTimeoutRef.current = setTimeout(() => {
        setShowSettings(false);
      }, 3000);
    }
  };

  const handleSettingsInteraction = () => {
    if (settingsTimeoutRef.current) {
      clearTimeout(settingsTimeoutRef.current);
    }
    settingsTimeoutRef.current = setTimeout(() => {
      setShowSettings(false);
    }, 3000);
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden fade-in shadow-lg"
      style={{
        animationDelay: '0.2s'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => window.innerWidth >= 640 && isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
    >
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-[#1F59E7] rounded-full animate-spin"></div>
          </div>
        )}

        <video
          ref={videoRef}
          className="w-full h-full"
          onClick={togglePlay}
          playsInline
          autoPlay
          muted
        >
          <source
            src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/1121.mp4"
            type="video/mp4"
          />
          Tu navegador no soporta el elemento de video.
        </video>

        <div
          className={`absolute bottom-0 left-0 right-0 transition-opacity duration-300 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute bottom-0 left-0 right-0 px-2 pb-2 sm:px-4 sm:pb-3 pointer-events-auto bg-gradient-to-t from-black/90 via-black/60 to-transparent pt-8">
            <input
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={currentTime}
              onChange={handleProgressChange}
              className="w-full h-1 bg-transparent rounded-lg appearance-none cursor-pointer mb-1.5 sm:mb-2 progress-slider"
              style={{
                background: `linear-gradient(to right, #1F59E7 0%, #1F59E7 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) ${(currentTime / duration) * 100}%, rgba(255,255,255,0.3) 100%)`
              }}
            />

            <div className="flex items-center justify-between gap-2 text-[10px] sm:text-xs text-white/90 mb-1.5 sm:mb-2 font-medium">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform" fill="white" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform ml-0.5" fill="white" />
                  )}
                </button>

                <div className="flex items-center gap-1 sm:gap-2 group">
                  <button
                    onClick={toggleMute}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="hidden sm:block w-16 h-1 bg-transparent rounded-lg appearance-none cursor-pointer volume-slider"
                    style={{
                      background: `linear-gradient(to right, #1F59E7 0%, #1F59E7 ${volume * 100}%, rgba(255,255,255,0.3) ${volume * 100}%, rgba(255,255,255,0.3) 100%)`
                    }}
                  />
                </div>

              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <div className="relative">
                  <button
                    onClick={handleSettingsClick}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-200"
                    aria-label="Configuración"
                  >
                    <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </button>

                  {showSettings && (
                    <div
                      className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-800 overflow-hidden min-w-[160px] sm:min-w-[180px]"
                      onMouseEnter={handleSettingsInteraction}
                      onMouseMove={handleSettingsInteraction}
                      onTouchStart={handleSettingsInteraction}
                    >
                      <div className="px-3 sm:px-4 py-2 border-b border-gray-800">
                        <p className="text-xs text-gray-400 font-medium">Velocidad</p>
                      </div>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => changePlaybackRate(rate)}
                          className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 text-left text-xs sm:text-sm hover:bg-white/10 transition-colors ${
                            playbackRate === rate ? 'text-[#1F59E7] bg-white/5' : 'text-white'
                          }`}
                        >
                          {rate === 1 ? 'Normal' : `${rate}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-all duration-200"
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  ) : (
                    <Maximize className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .progress-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .progress-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .progress-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .progress-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
        }

        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.3);
        }

        .volume-slider::-moz-range-thumb {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #FFFFFF;
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .volume-slider::-moz-range-thumb:hover {
          transform: scale(1.3);
        }
      `}</style>
    </div>
  );
}
