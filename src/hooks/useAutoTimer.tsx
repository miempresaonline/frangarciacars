import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UseAutoTimerProps {
  reviewId: string;
  enabled: boolean;
}

export function useAutoTimer({ reviewId, enabled }: UseAutoTimerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const initialSecondsRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !reviewId) return;

    const initTimer = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('total_time_seconds')
          .eq('id', reviewId)
          .single();

        if (error) throw error;

        initialSecondsRef.current = data.total_time_seconds || 0;
        startTimeRef.current = Date.now();

        intervalRef.current = setInterval(async () => {
          const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const totalSeconds = initialSecondsRef.current + elapsedSeconds;

          await supabase
            .from('reviews')
            .update({
              total_time_seconds: totalSeconds,
              updated_at: new Date().toISOString()
            })
            .eq('id', reviewId);
        }, 10000);
      } catch (err) {
        console.error('Error initializing auto timer:', err);
      }
    };

    initTimer();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);

        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const totalSeconds = initialSecondsRef.current + elapsedSeconds;

        supabase
          .from('reviews')
          .update({
            total_time_seconds: totalSeconds,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewId)
          .then(() => {
            console.log('Auto timer saved on cleanup');
          })
          .catch((err) => {
            console.error('Error saving timer on cleanup:', err);
          });
      }
    };
  }, [reviewId, enabled]);

  return null;
}
