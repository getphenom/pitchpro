import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pullDistance = useRef(0);
  const indicatorRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY > 5) return;
    startY.current = e.touches[0].clientY;
    setPulling(true);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling) return;
    const dist = Math.max(0, e.touches[0].clientY - startY.current);
    pullDistance.current = dist;
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = `translateY(${Math.min(dist / 3, 20)}px)`;
      indicatorRef.current.style.opacity = Math.min(dist / 60, 1);
    }
  }, [pulling]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling) return;
    setPulling(false);

    if (pullDistance.current > 60 && !refreshing) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = "translateY(-30px)";
          indicatorRef.current.style.opacity = "0";
        }
      }
    } else {
      if (indicatorRef.current) {
        indicatorRef.current.style.transform = "translateY(-30px)";
        indicatorRef.current.style.opacity = "0";
      }
    }
    pullDistance.current = 0;
    startY.current = 0;
  }, [pulling, refreshing, onRefresh]);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      <div
        ref={indicatorRef}
        className="absolute left-1/2 -translate-x-1/2 top-0 z-10 pointer-events-none opacity-0"
        style={{ transform: "translateY(-30px)" }}
      >
        <motion.div
          animate={refreshing ? { y: 16 } : {}}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 text-primary ${refreshing ? "animate-spin" : ""}`} />
          <span className="text-xs font-medium text-muted-foreground">
            {refreshing ? "Refreshing..." : "Pull to refresh"}
          </span>
        </motion.div>
      </div>
      {children}
    </div>
  );
}