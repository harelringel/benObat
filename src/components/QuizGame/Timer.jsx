import React, { useEffect, useState } from 'react';

const Timer = ({ seconds, onExpire, isActive = true }) => {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onExpire && onExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire && onExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onExpire]);

  const percentage = (timeLeft / seconds) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Color based on time left
  const getColor = () => {
    if (percentage > 50) return '#10B981'; // green
    if (percentage > 25) return '#F59E0B'; // yellow/gold
    return '#EF4444'; // red
  };

  const isPulse = timeLeft <= 10;

  return (
    <div className={`relative flex items-center justify-center ${isPulse ? 'animate-pulse' : ''}`}>
      <svg className="transform -rotate-90" width="120" height="120">
        {/* Background circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="60"
          cy="60"
          r="45"
          stroke={getColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold" style={{ color: getColor() }}>
          {timeLeft}
        </span>
        <span className="text-sm text-gray-300">שניות</span>
      </div>
    </div>
  );
};

export default Timer;
