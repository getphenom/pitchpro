import { X, Star, CheckCircle2, Undo2, Dumbbell, Droplets, UtensilsCrossed, Brain, Map, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_META = {
  training: { label: "Training", icon: Dumbbell, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", tip: "Complete this drill with proper form. Quality over quantity — focus on technique." },
  hydration: { label: "Hydration", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", tip: "Sip water consistently throughout the day — don't chug it all at once. Aim for light-colored urine." },
  nutrition: { label: "Nutrition", icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", tip: "Log meals right after eating so you don't forget. Include protein, carbs, and veggies in each meal." },
  mental: { label: "Mental", icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20", tip: "Find a quiet place. Close your eyes and breathe deeply. Visualize yourself performing at your best." },
  tactical: { label: "Tactical", icon: Map, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", tip: "Watch pro matches and focus on players in your position. Take notes on their movement off the ball." },
  recovery: { label: "Recovery", icon: Timer, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", tip: "Recovery is when you actually get stronger. Don't skip stretching and sleep — they're part of training." },
};

const QUEST_DETAILS = {
  "Hydration Check": {
    why: "Proper hydration improves endurance, focus, and recovery. Even 2% dehydration can reduce performance by 10%.",
    how: [
      "Fill a water bottle and keep it visible throughout the day",
      "Drink a glass with each meal and snack",
      "Set a reminder on your phone every 2 hours",
      "Check your urine color — pale yellow is the goal",
      "Add a pinch of salt or electrolyte tablet after training",
    ],
    benefit: "Better energy, faster recovery, sharper focus on the pitch.",
  },
  "Fuel Up": {
    why: "Logging meals builds awareness. Athletes who track their food make better nutrition choices.",
    how: [
      "Log breakfast, lunch, dinner, and any snacks",
      "Include protein at every meal for muscle repair",
      "Add colorful vegetables for vitamins and minerals",
      "Choose whole grains for sustained energy",
      "Don't skip meals — your body needs consistent fuel",
    ],
    benefit: "Better energy levels, improved recovery, and stronger performance.",
  },
  "Mental Rep": {
    why: "Visualization primes your brain for success. Pro athletes use it before every game.",
    how: [
      "Sit in a quiet, comfortable spot",
      "Close your eyes and take 5 deep breaths",
      "Imagine yourself on the pitch — feel the grass, hear the crowd",
      "Visualize making a great pass, tackle, or save",
      "Feel the confidence and repeat positive affirmations",
    ],
    benefit: "Increased confidence, reduced anxiety, and better decision-making under pressure.",
  },
  "Tactical Study": {
    why: "Understanding your position separates good players from great ones. Knowledge is power on the pitch.",
    how: [
      "Watch highlight clips of a pro in your position",
      "Pause and rewind key moments — what were they thinking?",
      "Draw a simple diagram of where you should be in attack vs defense",
      "Write down 3 things you learned and will try next session",
    ],
    benefit: "Smarter positioning, better reading of the game, and fewer mistakes.",
  },
};

export default function ItemDetailDialog({ open, onClose, item, onAction }) {
  if (!open || !item) return null;

  const { title, description, xp, icon, category, completed } = item;
  const meta = CATEGORY_META[category];
  const details = QUEST_DETAILS[title];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card w-full sm:max-w-md max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border border-border"
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 flex-shrink-0 border-b border-border">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl flex-shrink-0">
                {icon || "⚽"}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg">{title}</h3>
                {meta && (
                  <span className={`text-[10px] uppercase tracking-wider font-medium flex items-center gap-1 ${meta.color}`}>
                    <meta.icon className="w-3 h-3" /> {meta.label} Quest
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
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

            {/* XP Badge */}
            <div className="flex items-center gap-3 rounded-xl bg-accent/10 border border-accent/20 p-3">
              <Star className="w-5 h-5 text-accent fill-accent/30" />
              <div>
                <p className="text-sm text-accent font-semibold">{xp} XP</p>
                {completed ? (
                  <p className="text-[11px] text-muted-foreground">Already earned</p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">Awarded on completion</p>
                )}
              </div>
            </div>

            {/* Detailed guide */}
            {details ? (
              <div className={`rounded-xl ${meta?.bg || "bg-secondary border-border"} p-4 space-y-3`}>
                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">Why This Matters</h4>
                  <p className="text-xs text-muted-foreground mt-1">{details.why}</p>
                </div>

                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">How To Do It</h4>
                  <div className="mt-1.5 space-y-1.5">
                    {details.how.map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">The Benefit</h4>
                  <p className="text-xs text-muted-foreground mt-1">{details.benefit}</p>
                </div>
              </div>
            ) : category === "training" ? (
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 space-y-3">
                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">Why This Matters</h4>
                  <p className="text-xs text-muted-foreground mt-1">Position-specific drills build muscle memory and game-relevant skills. Consistent practice is how pros separate themselves.</p>
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">How To Do It</h4>
                  <div className="mt-1.5 space-y-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">1</span></div>
                      <p className="text-xs text-muted-foreground">Read the drill description carefully and visualize the movement</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">2</span></div>
                      <p className="text-xs text-muted-foreground">Start slowly — focus on proper technique, not speed</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">3</span></div>
                      <p className="text-xs text-muted-foreground">Gradually increase intensity once form is consistent</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5"><span className="text-[10px] font-bold text-primary">4</span></div>
                      <p className="text-xs text-muted-foreground">Complete all reps with maximum effort on the last set</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">The Benefit</h4>
                  <p className="text-xs text-muted-foreground mt-1">This drill directly improves your in-game performance. Do it consistently and you'll see results on match day.</p>
                </div>
              </div>
            ) : null}

            {/* General tip */}
            {meta && (
              <div className="rounded-xl bg-secondary/50 border border-border p-3 flex items-start gap-2">
                <Star className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{meta.tip}</p>
              </div>
            )}
          </div>

          {/* Action */}
          <div className="p-5 border-t border-border flex-shrink-0">
            <Button
              className={`w-full font-semibold ${
                completed
                  ? "bg-secondary hover:bg-secondary/80 text-foreground"
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              }`}
              onClick={() => { onAction?.(item); onClose(); }}
            >
              {completed ? (
                <>
                  <Undo2 className="w-4 h-4 mr-2" /> Undo Quest
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Quest — {xp} XP
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}