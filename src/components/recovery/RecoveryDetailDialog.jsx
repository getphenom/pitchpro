import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwappableDetailDialog from "@/components/shared/SwappableDetailDialog";
import { RECOVERY_IMAGES } from "@/lib/exerciseImages";

export default function RecoveryDetailDialog({ open, onClose, exercise, profile, allExercises = [], onSwap }) {
  const [showGuide, setShowGuide] = useState(false);
  const [guide, setGuide] = useState(null);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const queryClient = useQueryClient();

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const current = profile.favorite_drills || [];
      const key = exercise.name;
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
      prompt: `Create a detailed how-to guide for the recovery exercise: "${exercise.name}".

Duration: ${exercise.duration}
Target: ${exercise.target}

Include:
- Step-by-step instructions on how to perform it correctly
- Proper form and technique cues
- Common mistakes and how to avoid them
- 1-2 YouTube video search queries for visual demonstrations
- Why this exercise is important for soccer player recovery

Write for a young athlete (age 10-18). Keep it simple and actionable.`,
      response_json_schema: {
        type: "object",
        properties: {
          intro: { type: "string" },
          instructions: { type: "array", items: { type: "object", properties: { step: { type: "number" }, instruction: { type: "string" } } } },
          form_tips: { type: "array", items: { type: "string" } },
          video_queries: { type: "array", items: { type: "string" } },
          common_mistakes: { type: "array", items: { type: "string" } },
          recovery_benefit: { type: "string" },
        },
      },
    });
    setGuide(result);
    setLoadingGuide(false);
  };

  if (!open || !exercise) return null;

  const alternatives = allExercises.filter((e) => e.name !== exercise.name);

  return (
    <SwappableDetailDialog
      open={open}
      onClose={onClose}
      item={{ ...exercise, icon: "🧘", title: exercise.name }}
      category="recovery"
      profile={profile}
      favorites={profile?.favorite_drills || []}
      onToggleFavorite={() => toggleFavorite.mutate()}
      alternatives={alternatives}
      onSwap={(alt) => onSwap?.(alt)}
      extraButtons={
        <div className="flex gap-2 pb-3">
          <button
            onClick={generateGuide}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${guide && showGuide ? "bg-teal-500/15 text-teal-400 border border-teal-500/20" : "bg-secondary hover:bg-secondary/80"}`}
          >
            <BookOpen className="w-3.5 h-3.5" /> How-To Guide
          </button>
        </div>
      }
    >
      {RECOVERY_IMAGES[exercise.name] && (
        <div className="w-full h-40 rounded-lg overflow-hidden -mt-1">
          <img src={RECOVERY_IMAGES[exercise.name]} alt={exercise.name} className="w-full h-full object-cover" />
        </div>
      )}
      <p className="text-sm text-muted-foreground leading-relaxed">Duration: {exercise.duration} · Target: {exercise.target}</p>

      <AnimatePresence>
        {showGuide && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 pt-1">
              {loadingGuide && (
                <div className="flex items-center justify-center py-4 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  <span className="text-xs text-muted-foreground">Creating guide...</span>
                </div>
              )}
              {guide && (
                <>
                  <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-3"><p className="text-sm">{guide.intro}</p></div>
                  {guide.instructions?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Step-by-Step</h4>
                      <div className="space-y-1">
                        {guide.instructions.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                            <div className="w-5 h-5 rounded-full bg-teal-500/10 flex items-center justify-center flex-shrink-0"><span className="text-[10px] font-bold text-teal-400">{s.step}</span></div>
                            <p className="text-xs">{s.instruction}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {guide.form_tips?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">Form Tips</h4>
                      {guide.form_tips.map((tip, i) => <p key={i} className="text-xs text-muted-foreground flex gap-1.5"><span className="text-teal-400">✓</span> {tip}</p>)}
                    </div>
                  )}
                  {guide.video_queries?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5 flex items-center gap-1"><Play className="w-3 h-3" /> Video Demonstrations</h4>
                      <div className="space-y-1">
                        {guide.video_queries.map((q, i) => (
                          <a key={i} href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50 border border-border hover:border-teal-500/30 transition-all text-xs">
                            <Play className="w-3 h-3 text-red-400 flex-shrink-0" /> {q}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {guide.common_mistakes?.length > 0 && (
                    <div>
                      <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-destructive mb-1.5">Mistakes to Avoid</h4>
                      {guide.common_mistakes.map((m, i) => <p key={i} className="text-[10px] text-muted-foreground flex gap-1"><span className="text-destructive">✕</span> {m}</p>)}
                    </div>
                  )}
                  {guide.recovery_benefit && <div className="rounded-lg bg-teal-500/10 border border-teal-500/20 p-2.5"><p className="text-xs font-medium text-teal-400">{guide.recovery_benefit}</p></div>}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SwappableDetailDialog>
  );
}