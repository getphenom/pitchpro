import { Check, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function QuestCard({ quest, onPress, disabled = false }) {
  const { title, description, xp, category, completed, icon } = quest;

  const categoryStyles = {
    training: "bg-green-600/10 border-green-500/30",
    nutrition: "bg-amber-600/10 border-amber-500/30",
    mental: "bg-cyan-600/10 border-cyan-500/30",
    tactical: "bg-orange-600/10 border-orange-500/30",
    recovery: "bg-purple-600/10 border-purple-500/30",
    hydration: "bg-blue-600/10 border-blue-500/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl border bg-card p-4 transition-all cursor-pointer
        ${completed ? "opacity-60 border-primary/30" : categoryStyles[category] || categoryStyles.training}
        ${disabled ? "opacity-40 pointer-events-none" : "hover:border-primary/40 hover:shadow-md"}`}
      onClick={() => !disabled && onPress?.()}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${completed ? "grayscale" : ""}`}>
          {icon || "⚽"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
            {title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-accent/15 border border-accent/20 text-accent px-2.5 py-1 rounded-lg flex-shrink-0">
          <Star className="w-3 h-3 fill-accent/30" />
          <span className="text-xs font-bold">{xp}</span>
        </div>
      </div>
      {completed && (
        <div className="absolute top-3 right-3">
          <Check className="w-4 h-4 text-primary" />
        </div>
      )}
    </motion.div>
  );
}