import { Check, Star, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function QuestCard({ quest, onPress, disabled = false }) {
  const { title, description, xp, category, completed, icon } = quest;

  const categoryColors = {
    training: "from-green-500/20 to-green-600/10 border-green-500/30",
    nutrition: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
    mental: "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30",
    tactical: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
    recovery: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    hydration: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative rounded-xl border bg-gradient-to-br p-4 transition-all cursor-pointer
        ${completed ? "opacity-60 border-primary/30 from-primary/10 to-primary/5" : categoryColors[category] || categoryColors.training}
        ${disabled ? "opacity-40 pointer-events-none" : ""}`}
      onClick={() => !disabled && onPress?.()}
    >
      <div className="flex items-start gap-3">
        <div className={`text-2xl ${completed ? "grayscale" : ""}`}>
          {icon || "⚽"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className={`font-semibold text-sm ${completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {title}
            </h4>
            {completed && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
        </div>
        <div className="flex items-center gap-1 bg-accent/20 text-accent px-2 py-1 rounded-lg flex-shrink-0">
          <Star className="w-3 h-3" />
          <span className="text-xs font-bold">{xp}</span>
        </div>
      </div>
    </motion.div>
  );
}