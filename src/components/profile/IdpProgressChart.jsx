import { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2, TrendingUp, Target } from "lucide-react";

const SKILL_LABELS = {
  pace: { label: "Pace", icon: "⚡", color: "#3b82f6" },
  shooting: { label: "Shooting", icon: "💥", color: "#ef4444" },
  passing: { label: "Passing", icon: "🎯", color: "#22c55e" },
  dribbling: { label: "Dribbling", icon: "🔄", color: "#a855f7" },
  defending: { label: "Defending", icon: "🛡️", color: "#f97316" },
  physical: { label: "Physical", icon: "💪", color: "#ec4899" },
  mental: { label: "Mental", icon: "🧠", color: "#8b5cf6" },
  tactical: { label: "Tactical", icon: "📋", color: "#14b8a6" },
};

export default function IdpProgressChart({ profile }) {
  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["idp-plans", profile?.id],
    queryFn: () => base44.entities.DevelopmentPlan.filter({ player_id: profile.id, plan_type: "annual" }, "-created_date", 1),
    enabled: !!profile,
  });

  const plan = plans?.[0];
  const targets = plan?.skill_targets || {};
  const current = profile?.stats || {};

  const skills = useMemo(() => {
    return Object.entries(SKILL_LABELS).map(([key, meta]) => {
      const cur = current[key] || 50;
      const tgt = targets[key];
      const progress = tgt ? Math.min(100, Math.round((cur / tgt) * 100)) : null;
      const diff = tgt ? cur - tgt : null;
      return { key, ...meta, current: cur, target: tgt, progress, diff };
    });
  }, [current, targets]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="rounded-xl bg-card border border-dashed border-primary/20 p-5 text-center">
        <Target className="w-6 h-6 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground font-medium mb-1">No IDP targets yet</p>
        <p className="text-xs text-muted-foreground mb-3">
          Generate your Individual Development Plan to see skill targets
        </p>
        <a
          href="/development"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <TrendingUp className="w-3.5 h-3.5" /> Go to IDP / LTDP
        </a>
      </div>
    );
  }

  const hasTargets = skills.some((s) => s.target != null);
  if (!hasTargets) {
    return (
      <div className="rounded-xl bg-card border border-border p-5 text-center">
        <p className="text-sm text-muted-foreground">No skill targets set in your IDP.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card border border-border p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-accent" />
        <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
          IDP Skill Progression
        </h3>
      </div>

      <div className="space-y-3">
        {skills.map((skill, i) => {
          if (skill.target == null) return null;
          const isAhead = skill.diff >= 0;
          const barColor = isAhead ? "#22c55e" : skill.progress >= 80 ? "#facc15" : skill.progress >= 50 ? "#f97316" : "#ef4444";

          return (
            <motion.div
              key={skill.key}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{skill.icon}</span>
                  <span className="text-xs font-medium">{skill.label}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="font-mono text-muted-foreground">{skill.current}</span>
                  <span className="text-muted-foreground/50">→</span>
                  <span className="font-mono font-bold" style={{ color: skill.color }}>
                    {skill.target}
                  </span>
                  {skill.diff !== null && (
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded-md ${
                        isAhead ? "bg-green-500/15 text-green-400" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAhead ? `+${skill.diff}` : skill.diff}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                {/* Current position marker */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, skill.progress)}%` }}
                  transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ backgroundColor: barColor }}
                />
                {/* 100% target line */}
                {skill.progress < 100 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                    style={{ left: "100%" }}
                  />
                )}
              </div>

              {/* Progress label */}
              <p className="text-[10px] text-muted-foreground text-right">
                {skill.progress >= 100
                  ? "Target reached! 🎉"
                  : `${skill.progress}% to target`}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}