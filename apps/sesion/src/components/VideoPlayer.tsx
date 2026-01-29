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

interface VideoPlayerProps {
  onVideoStart?: () => void;
}

export default function VideoPlayer({ onVideoStart }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handlePreviewTimeUpdate = () => {
      if (previewVideo && previewVideo.currentTime >= 5) {
        previewVideo.currentTime = 0;
        previewVideo.play().catch(() => {});
      }
    };

    const handlePreviewEnded = () => {
      if (previewVideo) {
        previewVideo.currentTime = 0;
        previewVideo.play().catch(() => {});
      }
    };

    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).webkitCurrentFullScreenElement
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    if (previewVideo) {
      previewVideo.addEventListener('timeupdate', handlePreviewTimeUpdate);
      previewVideo.addEventListener('ended', handlePreviewEnded);
      previewVideo.play().catch(() => {});
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      if (previewVideo) {
        previewVideo.removeEventListener('timeupdate', handlePreviewTimeUpdate);
        previewVideo.removeEventListener('ended', handlePreviewEnded);
      }
    };
  }, []);

  const startVideo = () => {
    const video = videoRef.current;
    const previewVideo = previewVideoRef.current;
    if (!video) return;

    if (previewVideo) {
      previewVideo.pause();
      previewVideo.currentTime = 0;
    }

    setHasStarted(true);
    video.currentTime = 0;
    video.volume = 0.5;
    setVolume(0.5);
    setIsMuted(false);
    video.play().then(() => {
      setIsPlaying(true);
      if (onVideoStart) {
        onVideoStart();
      }
    }).catch((error) => {
      console.error('Error playing video:', error);
      setIsPlaying(false);
    });
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video || !hasStarted) return;

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
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isMuted) {
      video.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      video.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container || !video) return;

    try {
      if (!isFullscreen) {
        if (video.requestFullscreen) {
          await video.requestFullscreen();
        } else if ((video as any).webkitRequestFullscreen) {
          await (video as any).webkitRequestFullscreen();
        } else if ((video as any).webkitEnterFullscreen) {
          (video as any).webkitEnterFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
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
      className="relative w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden fade-in border border-gray-200/50 sm:border-2 shadow-xl sm:shadow-2xl"
      style={{
        animationDelay: '0.2s',
        boxShadow: '0 20px 40px -12px rgba(31, 89, 231, 0.12), 0 0 0 1px rgba(31, 89, 231, 0.04), 0 8px 20px -5px rgba(0, 0, 0, 0.08)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="w-16 h-16 border-4 border-gray-700 border-t-[#1F59E7] rounded-full animate-spin"></div>
          </div>
        )}

        <video
          ref={previewVideoRef}
          className={`w-full h-full ${hasStarted ? 'hidden' : 'block'}`}
          playsInline
          loop
          muted
        >
          <source
            src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/1120.mp4"
            type="video/mp4"
          />
        </video>

        <video
          ref={videoRef}
          className={`w-full h-full ${hasStarted ? 'block' : 'hidden'}`}
          onClick={togglePlay}
          playsInline
        >
          <source
            src="https://hrsmkynojqkefoubxwqn.supabase.co/storage/v1/object/public/fotos%20coches/1120.mp4"
            type="video/mp4"
          />
          Tu navegador no soporta el elemento de video.
        </video>

        {!hasStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <button
              onClick={startVideo}
              className="group relative focus:outline-none focus:ring-4 focus:ring-[#1F59E7]/50 rounded-full"
              aria-label="Ver vídeo"
              type="button"
            >
              <div className="relative flex flex-col items-center gap-3 sm:gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center rounded-full bg-white shadow-2xl border-4 border-white/30 group-hover:scale-110 group-active:scale-105 transition-all duration-300">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-[#1F59E7] ml-1" fill="#1F59E7" />
                </div>
                <span className="text-white text-base sm:text-lg lg:text-xl font-bold tracking-wide uppercase" style={{fontFamily: "'Outfit', sans-serif"}}>Ver Vídeo</span>
              </div>
            </button>
          </div>
        )}

        {hasStarted && (
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-6">
              <div className="flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 backdrop-blur-sm transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
                    type="button"
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" fill="white" />
                    ) : (
                      <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform ml-0.5" fill="white" />
                    )}
                  </button>

                  <div className="hidden sm:flex items-center gap-2 group">
                    <button
                      onClick={toggleMute}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label={isMuted ? 'Activar sonido' : 'Silenciar'}
                      type="button"
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      )}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-0 group-hover:w-16 sm:group-hover:w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer transition-all duration-300 slider"
                      aria-label="Control de volumen"
                      style={{
                        background: `linear-gradient(to right, #1F59E7 0%, #1F59E7 ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%, #374151 100%)`
                      }}
                    />
                  </div>

                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <div className="relative hidden sm:block">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="Configuración"
                      type="button"
                    >
                      <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full right-0 mb-2 bg-black/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-800 overflow-hidden min-w-[160px] sm:min-w-[180px]">
                        <div className="px-3 sm:px-4 py-2 border-b border-gray-800">
                          <p className="text-xs text-gray-400 font-medium">Velocidad</p>
                        </div>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            type="button"
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
                    className="flex w-8 h-8 sm:w-9 sm:h-9 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    type="button"
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
        )}
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1F59E7;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #1F59E7;
          cursor: pointer;
          border: none;
          transition: transform 0.2s;
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
