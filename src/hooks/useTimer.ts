import { useEffect, useRef, useState } from "react";

export interface TimerControls {
  seconds: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  toggle: () => void;
}

/**
 * useTimer(countMode, initialSeconds)
 * - countMode 'down': counts down from initialSeconds, stops at 0 and calls onComplete.
 * - countMode 'up': stopwatch starting at initialSeconds.
 */
export function useTimer(
  countMode: "down" | "up",
  initialSeconds: number,
  onComplete?: () => void,
): TimerControls {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeRef = useRef(onComplete);
  completeRef.current = onComplete;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    setSeconds(initialSeconds);
    clear();
    setIsRunning(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => {
        if (countMode === "up") return prev + 1;
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          completeRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [isRunning, countMode]);

  useEffect(() => clear, []);

  const start = () => setIsRunning(true);
  const pause = () => {
    clear();
    setIsRunning(false);
  };
  const toggle = () => (isRunning ? pause() : start());
  const reset = () => {
    clear();
    setSeconds(initialSeconds);
    setIsRunning(false);
  };

  return { seconds, isRunning, start, pause, reset, toggle };
}
