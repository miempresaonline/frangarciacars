import { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings
} from 'lucide-react';

export default function VideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const hasUnmutedOnceRef = useRef(false);

  const controlsTimeoutRef = useRef<number>();
  const volumeSliderTimeoutRef = useRef<number>();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
      video.volume = volume;
      video.muted = true;

      video.play().catch(() => {
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

    if (!hasInteracted) {
      setHasInteracted(true);
      if (isMuted) {
        video.currentTime = 0;
        video.muted = false;
        setIsMuted(false);
        hasUnmutedOnceRef.current = true;
      }
    }

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

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    const vol = parseFloat(e.target.value);

    const wasActuallyMuted = video.muted || volume === 0;
    if (wasActuallyMuted && vol > 0 && !hasUnmutedOnceRef.current) {
      video.currentTime = 0;
      hasUnmutedOnceRef.current = true;
    }

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

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    if (isMuted) {
      if (!hasUnmutedOnceRef.current) {
        video.currentTime = 0;
        hasUnmutedOnceRef.current = true;
      }
      video.muted = false;
      const newVolume = volume > 0 ? volume : 0.5;
      video.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const toggleVolumeSlider = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    if (isMuted) {
      if (!hasUnmutedOnceRef.current) {
        video.currentTime = 0;
        hasUnmutedOnceRef.current = true;
      }
      video.muted = false;
      setIsMuted(false);
    }

    setShowVolumeSlider(!showVolumeSlider);
    if (!showVolumeSlider) {
      if (volumeSliderTimeoutRef.current) {
        clearTimeout(volumeSliderTimeoutRef.current);
      }
      volumeSliderTimeoutRef.current = setTimeout(() => {
        setShowVolumeSlider(false);
      }, 3000);
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );

    if (!isCurrentlyFullscreen) {
      try {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen();
        } else if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
      } catch (err) {
        console.log('Error entering fullscreen:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).webkitCancelFullScreen) {
          (document as any).webkitCancelFullScreen();
        } else if ((document as any).mozCancelFullScreen) {
          (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      } catch (err) {
        console.log('Error exiting fullscreen:', err);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if ((e.nativeEvent as any).sourceCapabilities?.firesTouchEvents) {
      return;
    }
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handleTouchStart = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handleControlInteraction = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };


  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden fade-in"
      style={{
        animationDelay: '0.3s',
        boxShadow: '0 40px 80px -20px rgba(46, 103, 240, 0.5), 0 20px 40px -10px rgba(46, 103, 240, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
    >
      <div className="relative aspect-video bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl overflow-hidden" style={{ boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.5)' }}>
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
            src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/1122.mp4"
            type="video/mp4"
          />
          Tu navegador no soporta el elemento de video.
        </video>

        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Controles inferiores */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pb-1 pt-3 px-3 sm:p-4 pointer-events-auto"
            onMouseMove={handleControlInteraction}
            onTouchStart={handleControlInteraction}
          >
            {/* Barra de progreso minimalista en la parte inferior */}
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={(e) => {
                handleProgressChange(e);
                handleControlInteraction();
              }}
              className="w-full h-0.5 sm:h-1 bg-gray-700/50 rounded-full appearance-none cursor-pointer progress-bar mb-2 sm:mb-3"
              style={{
                background: `linear-gradient(to right, #2E67F0 0%, #2E67F0 ${(currentTime / duration) * 100}%, rgba(55, 65, 81, 0.5) ${(currentTime / duration) * 100}%, rgba(55, 65, 81, 0.5) 100%)`
              }}
            />
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-3">
                <button
                  onClick={(e) => {
                    togglePlay();
                    handleControlInteraction();
                  }}
                  className="w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 group"
                  aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="white" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform ml-0.5" fill="white" />
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={(e) => {
                      toggleVolumeSlider();
                      handleControlInteraction();
                    }}
                    className="w-9 h-9 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 sm:hidden"
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      toggleMute();
                      handleControlInteraction();
                    }}
                    className="hidden sm:flex w-9 h-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-white" />
                    )}
                  </button>

                  {/* Slider de volumen vertical para móvil */}
                  {showVolumeSlider && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black/90 backdrop-blur-sm rounded-xl sm:hidden"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                      }}
                      onClick={handleControlInteraction}
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => {
                          handleVolumeChange(e);
                          handleControlInteraction();
                          if (volumeSliderTimeoutRef.current) {
                            clearTimeout(volumeSliderTimeoutRef.current);
                          }
                          volumeSliderTimeoutRef.current = setTimeout(() => {
                            setShowVolumeSlider(false);
                          }, 3000);
                        }}
                        className="h-24 w-1 appearance-none cursor-pointer slider-vertical"
                        style={{
                          writingMode: 'bt-lr',
                          WebkitAppearance: 'slider-vertical',
                          background: `linear-gradient(to top, #2E67F0 0%, #2E67F0 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                        }}
                      />
                      <div className="text-xs text-white/80 text-center mt-2 font-medium">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </div>
                    </div>
                  )}
                </div>

                {/* Barra de volumen solo en desktop */}
                <div className="hidden sm:flex items-center gap-2 group">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      handleVolumeChange(e);
                      handleControlInteraction();
                    }}
                    className="w-0 group-hover:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 slider"
                    style={{
                      background: `linear-gradient(to right, #2E67F0 0%, #2E67F0 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                    }}
                  />
                </div>

                {/* Tiempo en móvil */}
                <span className="text-xs text-white/80 font-medium sm:hidden">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                {/* Tiempo en desktop */}
                <span className="hidden sm:block text-xs text-white/80 font-medium mr-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Botón de configuración */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      setShowSettings(!showSettings);
                      handleControlInteraction();
                    }}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                    aria-label="Configuración"
                  >
                    <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>

                  {/* Menú de configuración */}
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/90 backdrop-blur-sm rounded-xl overflow-hidden z-50"
                      style={{
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                        minWidth: '120px',
                        maxHeight: '280px',
                        overflowY: 'auto'
                      }}
                      onClick={handleControlInteraction}
                    >
                      <div className="p-1.5 sm:p-2">
                        <div className="text-xs text-white/60 font-medium px-2 py-1">Velocidad</div>
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => handlePlaybackRateChange(rate)}
                            className={`w-full text-left px-2.5 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
                              playbackRate === rate
                                ? 'bg-[#2E67F0] text-white font-medium'
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            {rate === 1 ? 'Normal' : `${rate}x`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    toggleFullscreen();
                    handleControlInteraction();
                  }}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200"
                  aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                >
                  {isFullscreen ? (
                    <Minimize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  ) : (
                    <Maximize className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb,
        .progress-bar::-webkit-slider-thumb,
        .slider-vertical::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2E67F0, #4A7FFF);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(46, 103, 240, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2);
        }

        .slider::-webkit-slider-thumb:hover,
        .progress-bar::-webkit-slider-thumb:hover,
        .slider-vertical::-webkit-slider-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 12px rgba(46, 103, 240, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .slider::-moz-range-thumb,
        .progress-bar::-moz-range-thumb,
        .slider-vertical::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2E67F0, #4A7FFF);
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(46, 103, 240, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2);
        }

        .slider::-moz-range-thumb:hover,
        .progress-bar::-moz-range-thumb:hover,
        .slider-vertical::-moz-range-thumb:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 12px rgba(46, 103, 240, 0.6), 0 0 0 3px rgba(255, 255, 255, 0.3);
        }

        .slider-vertical {
          writing-mode: bt-lr;
          -webkit-appearance: slider-vertical;
          width: 6px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
