import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface LiveMatchTimerProps {
  matchDate: string;
  status: string;
  className?: string;
}

export const LiveMatchTimer = ({ matchDate, status, className = "" }: LiveMatchTimerProps) => {
  const [elapsed, setElapsed] = useState<string>('0:00');

  useEffect(() => {
    if (status !== 'live') {
      setElapsed('0:00');
      return;
    }

    const startTime = new Date(matchDate).getTime();
    
    const updateTimer = () => {
      const now = Date.now();
      const diff = now - startTime;
      
      if (diff < 0) {
        setElapsed('0:00');
        return;
      }

      // Calculate actual elapsed seconds  
      const totalSeconds = Math.floor(diff / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      // Display format MM:SS (limit to 90 minutes max for a soccer match)
      const displayMinutes = Math.min(minutes, 90);
      setElapsed(`${displayMinutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [matchDate, status]);

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