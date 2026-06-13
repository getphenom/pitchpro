import { useState } from "react";
import { X, Star, Zap, CheckCircle2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export default function ItemDetailDialog({ open, onClose, item, onAction }) {
  if (!open || !item) return null;

  const { title, description, xp, icon, category, completed } = item;

  const categoryColors = {
    training: "border-green-500/30 bg-green-500/5",
    nutrition: "border-amber-500/30 bg-amber-500/5",
    mental: "border-cyan-500/30 bg-cyan-500/5",
    tactical: "border-orange-500/30 bg-orange-500/5",
    recovery: "border-purple-500/30 bg-purple-500/5",
    hydration: "border-blue-500/30 bg-blue-500/5",
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-card w-full sm:max-w-md max-h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border-t sm:border ${categoryColors[category] || "border-border"}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="text-3xl">{icon || "⚽"}</div>
              <div>
                <h3 className="font-heading font-bold text-lg">{title}</h3>
                {category && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5 block">
                    {category} Quest
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            {xp && (
              <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 p-3">
                <Star className="w-4 h-4 text-accent" />
                <span className="text-sm text-accent font-semibold">{xp} XP</span>
                {completed && <span className="text-xs text-muted-foreground">(earned)</span>}
              </div>
            )}
          </div>

          {/* Action */}
          <div className="p-5 border-t border-border flex-shrink-0">
            <Button
              className={`w-full ${completed ? "bg-secondary hover:bg-secondary/80 text-foreground" : "bg-primary hover:bg-primary/90"}`}
              onClick={() => { onAction?.(item); onClose(); }}
            >
              {completed ? (
                <>
                  <Undo2 className="w-4 h-4 mr-2" /> Undo Quest
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Quest
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}