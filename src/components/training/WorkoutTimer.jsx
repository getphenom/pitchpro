import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Play, Pause, RotateCcw, ChevronDown, ChevronUp, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PRESETS = [
  { label: "15s", seconds: 15 },
  { label: "30s", seconds: 30 },
  { label: "45s", seconds: 45 },
  { label: "60s", seconds: 60 },
  { label: "90s", seconds: 90 },
  { label: "2m", seconds: 120 },
  { label: "3m", seconds: 180 },
  { label: "5m", seconds: 300 },
];

export default function WorkoutTimer() {
  const [duration, setDuration] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = () => {
    if (isRunning) return;
    if (finished) setFinished(false);
    setIsRunning(true);
  };

  const pause = () => {
    setIsRunning(false);
    clearTimer();
  };

  const reset = () => {
    clearTimer();
    setIsRunning(false);
    setFinished(false);
    setRemaining(duration);
  };

  const selectPreset = (secs) => {
    clearTimer();
    setIsRunning(false);
    setFinished(false);
    setDuration(secs);
    setRemaining(secs);
  };

  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearTimer();
            setIsRunning(false);
            setFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return clearTimer;
  }, [isRunning, remaining, clearTimer]);

  useEffect(() => {
    if (finished && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [finished]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const progress = duration > 0 ? ((duration - remaining) / duration) * 100 : 0;

  return (
    <div className="rounded-xl bg-card border border-border overflow-hidden">
      {/* Header / collapsed state */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isRunning ? "bg-green-500/15" : finished ? "bg-accent/15" : "bg-primary/15"}`}>
            <Timer className={`w-4 h-4 ${isRunning ? "text-green-400 animate-pulse" : finished ? "text-accent" : "text-primary"}`} />
          </div>
          <div className="text-left">
            <span className="text-xs font-medium">Rest Timer</span>
            <span className={`ml-2 font-heading font-bold text-lg tabular-nums ${
              finished ? "text-accent" : isRunning ? "text-green-400" : "text-foreground"
            }`}>
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {finished && (
            <span className="text-[10px] bg-accent/15 text-accent px-2 py-0.5 rounded-full font-medium">
              Time's up!
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Hidden audio for completion sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CAf39/f4B/f3+AgH9/f3+Af39/gIB/f39/gH9/f4CA" />

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              {/* Progress ring */}
              <div className="flex items-center justify-center">
                <div className="relative w-24 h-24">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                    <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                    <circle
                      cx="48" cy="48" r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      className={finished ? "text-accent" : isRunning ? "text-green-400" : "text-primary"}
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-heading font-bold text-xl tabular-nums ${
                      finished ? "text-accent" : isRunning ? "text-green-400" : "text-foreground"
                    }`}>
                      {mins}:{secs.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {isRunning ? (
                  <button
                    onClick={pause}
                    className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/25 transition-colors"
                  >
                    <Pause className="w-5 h-5 text-amber-400" />
                  </button>
                ) : (
                  <button
                    onClick={start}
                    className="w-12 h-12 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center hover:bg-green-500/25 transition-colors"
                  >
                    <Play className="w-5 h-5 text-green-400 ml-0.5" />
                  </button>
                )}
                <button
                  onClick={reset}
                  className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.seconds}
                    onClick={() => selectPreset(preset.seconds)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      duration === preset.seconds && !isRunning
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary hover:bg-primary/15 hover:text-primary text-muted-foreground"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}