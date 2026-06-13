import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, ChevronDown, ChevronUp, Sparkles, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwappableDetailDialog from "@/components/shared/SwappableDetailDialog";

export default function MentalDetailDialog({ open, onClose, exercise, profile, allExercises = [], onSwap }) {
  const [showGuide, setShowGuide] = useState(false);
  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const current = profile.favorite_drills || [];
      const key = exercise.title;
      const updated = current.includes(key)
        ? current.filter((d) => d !== key)
        : [...current, key];
      return base44.entities.PlayerProfile.update(profile.id, { favorite_drills: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  const generateGuide = async () => {
    if (guide) { setShowGuide(!showGuide); return; }
    setLoadingGuide(true);
    setShowGuide(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed guide and video resource recommendations for the mental performance exercise: "${exercise.title}".

Description: ${exercise.description}
Steps: ${exercise.steps?.join(", ")}

Include:
- Why this exercise works (the science behind it, in simple terms)
- 2-3 recommended YouTube videos or channels for guided sessions
- A pro athlete example of someone who uses this technique
- Additional tips to get the most out of this exercise
- Common mistakes when doing mental training

Write for a young soccer player (age 10-18). Keep it motivating and simple.`,
      response_json_schema: {
        type: "object",
        properties: {
          why_it_works: { type: "string" },
          videos: { type: "array", items: { type: "object", properties: { title: { type: "string" }, channel: { type: "string" }, description: { type: "string" }, search_query: { type: "string" } } } },
          pro_example: { type: "string" },
          extra_tips: { type: "array", items: { type: "string" } },
          common_mistakes: { type: "array", items: { type: "string" } },
        },
      },
    });
    setGuide(result);
    setLoadingGuide(false);
  };

  if (!open || !exercise) return null;

  const alternatives = allExercises.filter((e) => e.id !== exercise.id);

  return (
    <SwappableDetailDialog
      open={open}
      onClose={onClose}
      item={{ ...exercise, icon: exercise.icon, title: exercise.title }}
      category="mental"
      profile={profile}
      favorites={profile?.favorite_drills || []}
      onToggleFavorite={() => toggleFavorite.mutate()}
      alternatives={alternatives.map((e) => ({ name: e.title, title: e.title, xp: e.xp, ...e }))}
      onSwap={(alt) => { const found = allExercises.find((e) => e.title === alt.title); if (found) onSwap?.(found); }}
      extraButtons={
        <div className="flex gap-2 pb-3">
          <button
            onClick={generateGuide}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${guide && showGuide ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/20" : "bg-secondary hover:bg-secondary/80"}`}
          >
            <Sparkles className="w-3.5 h-3.5" /> In-Depth Guide
          </button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed">{exercise.description}</p>

      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">{exercise.duration}</span>
        <span className="text-accent font-semibold">+{exercise.xp} XP</span>
      </div>

      {exercise.steps?.length > 0 && (
        <div>
          <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Quick Steps</h4>
          <div className="space-y-1">
            {exercise.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                <div className="w-5 h-5 rounded-full bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-cyan-400">{i + 1}</span>
                </div>
                <p className="text-xs">{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              {loadingGuide && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span className="text-xs text-muted-foreground">Creating guide...</span>
                </div>
              )}
              {guide && (
                <>
                  <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3">
                    <h4 className="text-xs font-semibold text-cyan-400 mb-1">Why It Works</h4>
                    <p className="text-sm">{guide.why_it_works}</p>
                  </div>
                  {guide.pro_example && <div className="rounded-lg bg-accent/10 border border-accent/20 p-2.5"><p className="text-xs font-medium">🌟 Pro Example: {guide.pro_example}</p></div>}
                  {guide.videos?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5 flex items-center gap-1"><Play className="w-3 h-3" /> Recommended Videos</h4>
                      <div className="space-y-1.5">
                        {guide.videos.map((v, i) => (
                          <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search_query)}`} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 p-2 rounded-lg bg-secondary/50 border border-border hover:border-cyan-500/30 transition-all group">
                            <div className="w-6 h-6 rounded bg-red-500/10 flex items-center justify-center flex-shrink-0"><Play className="w-3 h-3 text-red-400" /></div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium">{v.title}</p>
                              <p className="text-[10px] text-muted-foreground">{v.channel}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {guide.extra_tips?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Pro Tips</h4>
                      {guide.extra_tips.map((tip, i) => <p key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-cyan-400">💡</span> {tip}</p>)}
                    </div>
                  )}
                  {guide.common_mistakes?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-destructive mb-1.5">Common Mistakes</h4>
                      {guide.common_mistakes.map((m, i) => <p key={i} className="text-[10px] text-muted-foreground flex gap-1"><span className="text-destructive">✕</span> {m}</p>)}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SwappableDetailDialog>
  );
}