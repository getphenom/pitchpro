import { useState } from "react";
import { X, Star, RefreshCw, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SwappableDetailDialog({
  open, onClose, item, category, profile, favorites, onToggleFavorite,
  alternatives = [], onSwap, children,
  extraButtons,
}) {
  const [showAlts, setShowAlts] = useState(false);

  if (!open || !item) return null;

  const isFavorited = favorites?.some(
    (f) => (typeof f === "string" ? f === item.name || f === item.title : f.name === item.name || f.name === item.title)
  );
  const catColors = {
    training: "border-green-500/30 bg-green-500/5",
    nutrition: "border-amber-500/30 bg-amber-500/5",
    mental: "border-cyan-500/30 bg-cyan-500/5",
    recovery: "border-teal-500/30 bg-teal-500/5",
    tactical: "border-orange-500/30 bg-orange-500/5",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-card w-full sm:max-w-lg max-h-[85vh] rounded-2xl flex flex-col overflow-hidden border ${catColors[category] || "border-border"}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-start gap-3">
              {item.icon && <span className="text-2xl">{typeof item.icon === "string" ? item.icon : "⚽"}</span>}
              <div>
                <h3 className="font-heading font-bold text-sm">{item.name || item.title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{category}</span>
                  {item.duration && <span className="text-[10px] text-muted-foreground">{item.duration}</span>}
                  {item.xp && <span className="text-[10px] text-accent font-semibold">+{item.xp} XP</span>}
                  {item.calories && <span className="text-[10px] text-primary font-semibold">{item.calories} kcal</span>}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Children content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {children}
          </div>

          {/* Alternatives */}
          {alternatives.length > 0 && (
            <div className="px-4 border-t border-border flex-shrink-0">
              <button
                onClick={() => setShowAlts(!showAlts)}
                className="w-full flex items-center justify-between py-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> Swap for something else ({alternatives.length} options)
                </span>
                {showAlts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <AnimatePresence>
                {showAlts && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3 space-y-1 max-h-40 overflow-y-auto">
                      {alternatives.map((alt, i) => (
                        <button
                          key={i}
                          onClick={() => onSwap?.(alt)}
                          className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                        >
                          <RefreshCw className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="text-xs">{alt.name || alt.title}</span>
                          {alt.xp && <span className="text-[10px] text-accent ml-auto">+{alt.xp}</span>}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Extra buttons row */}
          {extraButtons && <div className="px-4 pb-1 flex-shrink-0">{extraButtons}</div>}

          {/* Footer */}
          <div className="p-4 border-t border-border flex-shrink-0 flex gap-2">
            <button
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium border transition-all ${
                isFavorited ? "border-accent text-accent bg-accent/5" : "border-border hover:border-accent/50"
              }`}
              onClick={() => onToggleFavorite?.(item)}
            >
              <Star className={`w-3.5 h-3.5 ${isFavorited ? "fill-accent text-accent" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </button>
            <button
              className="flex-1 py-2.5 rounded-lg text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              onClick={onClose}
            >
              Done
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}