import { useEffect, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

interface LiveMatchTimerProps {
  matchDate: string;
  status: string;
  className?: string;
}

export const LiveMatchTimer = ({ matchDate, status, className = "" }: LiveMatchTimerProps) => {
const [elapsed, setElapsed] = useState<string>('0:00');
const startTimeRef = useRef<number | null>(null);

useEffect(() => {
  if (status === 'live') {
    // Reset and start from 0 at kickoff or when a new match goes live
    startTimeRef.current = Date.now();
    setElapsed('0:00');

    const updateTimer = () => {
      if (!startTimeRef.current) return;
      const diff = Date.now() - startTimeRef.current;
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const displayMinutes = Math.min(minutes, 45); // each half up to 45:00
      setElapsed(`${displayMinutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  } else {
    // Reset when match is not live or when switching matches
    startTimeRef.current = null;
    setElapsed('0:00');
  }
}, [status, matchDate]);

  if (status !== 'live') {
    return null;
  }

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      <Clock className="h-4 w-4" />
      <span className="font-mono text-sm font-medium">{elapsed}</span>
    </div>
  );
};