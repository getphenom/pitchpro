import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Star, Flame, Clock, Play, Image, ExternalLink, BookOpen, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import DrillEquipmentInfo from "@/components/training/DrillEquipmentInfo";

const CATEGORY_COLORS = {
  technical: { border: "border-green-500/30", bg: "bg-green-500/5", text: "text-green-400", icon: "⚽" },
  physical: { border: "border-red-500/30", bg: "bg-red-500/5", text: "text-red-400", icon: "💪" },
  tactical: { border: "border-orange-500/30", bg: "bg-orange-500/5", text: "text-orange-400", icon: "📋" },
};

export default function DrillDetailDialog({ open, onClose, drill, category, profile, favorites }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState(null);
  const [loadingTutorial, setLoadingTutorial] = useState(false);
  const [showResources, setShowResources] = useState(false);
  const [resources, setResources] = useState(null);
  const [loadingResources, setLoadingResources] = useState(false);
  const [expandedStep, setExpandedStep] = useState(null);
  const queryClient = useQueryClient();

  const isFavorited = favorites?.includes(drill?.name);

  const toggleFavorite = useMutation({
    mutationFn: async () => {
      const current = profile.favorite_drills || [];
      const updated = isFavorited
        ? current.filter((d) => d !== drill.name)
        : [...current, drill.name];
      return base44.entities.PlayerProfile.update(profile.id, { favorite_drills: updated });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
    },
  });

  const generateTutorial = async () => {
    if (tutorial) { setShowTutorial(!showTutorial); return; }
    setLoadingTutorial(true);
    setShowTutorial(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed, step-by-step tutorial for the soccer drill: "${drill.name}".

Description: ${drill.desc}
Duration: ${drill.duration}
Category: ${category}

Include:
- A brief intro (1 sentence about why this drill matters)
- What you need (equipment/space)
- 4-6 detailed steps with clear instructions
- Key tips for proper form/technique
- Common mistakes to avoid
- A final pro tip

Write for a young athlete (age 10-18). Keep it simple and encouraging.`,
      response_json_schema: {
        type: "object",
        properties: {
          intro: { type: "string" },
          what_you_need: { type: "array", items: { type: "string" } },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                step_number: { type: "number" },
                title: { type: "string" },
                instruction: { type: "string" },
                tip: { type: "string" },
              },
            },
          },
          common_mistakes: { type: "array", items: { type: "string" } },
          final_tip: { type: "string" },
        },
      },
    });

    setTutorial(result);
    setLoadingTutorial(false);
  };

  const generateResources = async () => {
    if (resources) { setShowResources(!showResources); return; }
    setLoadingResources(true);
    setShowResources(true);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Find the best free video tutorials, image guides, and learning resources for the soccer drill: "${drill.name}".

The drill is: ${drill.desc}
Category: ${category}

Return 3-4 high-quality resources with:
- YouTube video titles that actually exist (search your knowledge for well-known soccer training channels)
- Descriptions of what each resource covers
- Any notable soccer training channels that cover this type of drill

Be specific with real, well-known soccer training YouTube channels and video titles.`,
      response_json_schema: {
        type: "object",
        properties: {
          videos: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                channel: { type: "string" },
                description: { type: "string" },
                search_query: { type: "string" },
              },
            },
          },
          image_guides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
              },
            },
          },
          top_channels: {
            type: "array",
            items: { type: "string" },
          },
          quick_tip: { type: "string" },
        },
      },
    });

    setResources(result);
    setLoadingResources(false);
  };

  if (!open || !drill) return null;

  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.technical;

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
          className={`bg-card w-full sm:max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border-t sm:border ${colors.border}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-border flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-xl flex-shrink-0">
                {colors.icon}
              </div>
              <div>
                <h3 className="font-heading font-bold text-sm">{drill.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{category}</span>
                  <span className="text-[10px] flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" /> {drill.duration}
                  </span>
                  <span className="text-[10px] flex items-center gap-1 text-accent font-semibold">
                    <Flame className="w-3 h-3" /> {drill.xp} XP
                  </span>
                </div>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">{drill.desc}</p>

            {/* Equipment */}
            <DrillEquipmentInfo drillName={drill.name} profileId={profile?.id} className="mt-1" />

            {/* Action Buttons Row */}
            <div className="flex gap-2">
              <button
                onClick={() => generateTutorial()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  tutorial && showTutorial
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Step-by-Step
                {showTutorial ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => generateResources()}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  resources && showResources
                    ? "bg-accent/15 text-accent border border-accent/20"
                    : "bg-secondary hover:bg-secondary/80"
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                Videos & Links
                {showResources ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Tutorial Section */}
            <AnimatePresence>
              {showTutorial && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-1">
                    {loadingTutorial && (
                      <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Generating tutorial...</span>
                      </div>
                    )}

                    {tutorial && (
                      <>
                        <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                          <p className="text-sm">{tutorial.intro}</p>
                        </div>

                        {tutorial.what_you_need?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">
                              What You Need
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {tutorial.what_you_need.map((item, i) => (
                                <span key={i} className="text-[10px] bg-secondary rounded-full px-2 py-0.5">{item}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">
                            Steps
                          </h4>
                          <div className="space-y-1">
                            {tutorial.steps?.map((step, i) => (
                              <div key={i} className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
                                <button
                                  onClick={() => setExpandedStep(expandedStep === i ? null : i)}
                                  className="w-full flex items-center gap-2.5 p-2.5 text-left hover:bg-secondary transition-colors"
                                >
                                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                    <span className="text-[10px] font-bold text-primary">{step.step_number}</span>
                                  </div>
                                  <span className="text-xs font-medium flex-1">{step.title}</span>
                                  {expandedStep === i ? (
                                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                  )}
                                </button>
                                {expandedStep === i && (
                                  <div className="px-2.5 pb-2.5 space-y-1.5">
                                    <p className="text-xs text-muted-foreground pl-7.5">{step.instruction}</p>
                                    {step.tip && (
                                      <div className="ml-7.5 flex items-start gap-1 bg-accent/10 border border-accent/20 rounded p-1.5">
                                        <span className="text-[10px] text-accent font-medium">💡 Tip:</span>
                                        <span className="text-[10px] text-accent">{step.tip}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {tutorial.common_mistakes?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-destructive mb-1.5">
                              ⚠ Common Mistakes
                            </h4>
                            <div className="space-y-1">
                              {tutorial.common_mistakes.map((m, i) => (
                                <p key={i} className="text-[10px] text-muted-foreground flex gap-1.5">
                                  <span className="text-destructive font-bold flex-shrink-0">✕</span> {m}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {tutorial.final_tip && (
                          <div className="rounded-lg bg-accent/10 border border-accent/20 p-2.5">
                            <p className="text-xs font-medium text-accent">🏆 {tutorial.final_tip}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resources Section */}
            <AnimatePresence>
              {showResources && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-3 pt-1">
                    {loadingResources && (
                      <div className="flex items-center justify-center py-6 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        <span className="text-xs text-muted-foreground">Finding resources...</span>
                      </div>
                    )}

                    {resources && (
                      <>
                        {resources.quick_tip && (
                          <p className="text-xs text-muted-foreground italic">{resources.quick_tip}</p>
                        )}

                        {resources.videos?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                              <Play className="w-3 h-3" /> Video Tutorials
                            </h4>
                            <div className="space-y-1.5">
                              {resources.videos.map((v, i) => (
                                <a
                                  key={i}
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(v.search_query)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all group"
                                >
                                  <div className="w-7 h-7 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Play className="w-3.5 h-3.5 text-red-400" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium group-hover:text-primary transition-colors">{v.title}</p>
                                    <p className="text-[10px] text-muted-foreground">{v.channel} — {v.description}</p>
                                  </div>
                                  <ExternalLink className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {resources.image_guides?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5 flex items-center gap-1">
                              <Image className="w-3 h-3" /> Image Guides
                            </h4>
                            <div className="space-y-1.5">
                              {resources.image_guides.map((g, i) => (
                                <div key={i} className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                                  <p className="text-xs font-medium">{g.title}</p>
                                  <p className="text-[10px] text-muted-foreground">{g.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {resources.top_channels?.length > 0 && (
                          <div>
                            <h4 className="font-heading font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1.5">
                              Top Channels
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {resources.top_channels.map((ch, i) => (
                                <span key={i} className="text-[10px] bg-primary/10 text-primary rounded-full px-2 py-0.5">{ch}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border flex-shrink-0 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className={`flex-1 ${isFavorited ? "border-accent text-accent bg-accent/5" : ""}`}
              onClick={() => toggleFavorite.mutate()}
              disabled={toggleFavorite.isPending}
            >
              <Star className={`w-4 h-4 mr-1.5 ${isFavorited ? "fill-accent text-accent" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </Button>
            <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" onClick={onClose}>
              <CheckCircle2 className="w-4 h-4 mr-1.5" /> Done
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}