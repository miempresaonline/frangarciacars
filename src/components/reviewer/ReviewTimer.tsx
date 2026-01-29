import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReviewTimerProps {
  reviewId: string;
  timerType: 'driving' | 'total';
  label: string;
}

export function ReviewTimer({ reviewId, timerType, label }: ReviewTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pausedSeconds, setPausedSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);

  useEffect(() => {
    loadSavedTime();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [reviewId, timerType]);

  const loadSavedTime = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          timerType === 'driving'
            ? 'driving_time_seconds'
            : 'total_time_seconds, paused_time_seconds'
        )
        .eq('id', reviewId)
        .single();

      if (error) throw error;

      if (timerType === 'driving') {
        setSeconds(data.driving_time_seconds || 0);
      } else {
        setSeconds(data.total_time_seconds || 0);
        setPausedSeconds(data.paused_time_seconds || 0);
      }
    } catch (err) {
      console.error('Error loading saved time:', err);
    }
  };

  const startTimer = () => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    startTimeRef.current = Date.now() - seconds * 1000;

    intervalRef.current = setInterval(() => {
      const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(currentSeconds);
    }, 1000);
  };

  const pauseTimer = () => {
    if (!isRunning || isPaused) return;

    setIsPaused(true);
    pauseStartRef.current = Date.now();

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    saveTime(seconds);
  };

  const resumeTimer = () => {
    if (!isPaused) return;

    const pauseDuration = Math.floor((Date.now() - pauseStartRef.current) / 1000);
    setPausedSeconds((prev) => prev + pauseDuration);

    setIsPaused(false);
    startTimeRef.current = Date.now() - seconds * 1000;

    intervalRef.current = setInterval(() => {
      const currentSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(currentSeconds);
    }, 1000);
  };

  const stopTimer = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRunning(false);
    setIsPaused(false);

    await saveTime(seconds);

    if (timerType === 'driving') {
      try {
        const { data } = await supabase
          .from('reviews')
          .select('total_time_seconds')
          .eq('id', reviewId)
          .single();

        if (data) {
          await supabase
            .from('reviews')
            .update({
              total_time_seconds: (data.total_time_seconds || 0) + seconds
            })
            .eq('id', reviewId);
        }
      } catch (err) {
        console.error('Error updating total time:', err);
      }
    }
  };

  const saveTime = async (currentSeconds: number) => {
    try {
      const updates: any = {};

      if (timerType === 'driving') {
        updates.driving_time_seconds = currentSeconds;
      } else {
        updates.total_time_seconds = currentSeconds;
        updates.paused_time_seconds = pausedSeconds;
      }

      const { error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', reviewId);

      if (error) throw error;
    } catch (err) {
      console.error('Error saving time:', err);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock size={24} className="text-[#0029D4]" />
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
      </div>

      <div className="text-center mb-6">
        <div className="text-5xl font-mono font-bold text-gray-900 mb-2">
          {formatTime(seconds)}
        </div>
        {timerType === 'total' && pausedSeconds > 0 && (
          <div className="text-sm text-gray-500">
            Tiempo en pausa: {formatTime(pausedSeconds)}
          </div>
        )}
        {isRunning && (
          <div className="mt-2">
            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              {isPaused ? 'En Pausa' : 'En Marcha'}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {!isRunning ? (
          <button
            onClick={startTimer}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
          >
            <Play size={20} />
            Iniciar
          </button>
        ) : (
          <>
            {!isPaused ? (
              <button
                onClick={pauseTimer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition"
              >
                <Pause size={20} />
                Pausar
              </button>
            ) : (
              <button
                onClick={resumeTimer}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                <Play size={20} />
                Reanudar
              </button>
            )}
            <button
              onClick={stopTimer}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
            >
              <Square size={20} />
              Detener
            </button>
          </>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Los tiempos se guardan automáticamente
      </div>
    </div>
  );
}
