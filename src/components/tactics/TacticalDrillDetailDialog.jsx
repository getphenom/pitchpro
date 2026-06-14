import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Play, BookOpen, CheckCircle2, Star, Video, Edit3, Save, Upload, ExternalLink, Flame, Clock, X, ArrowRightLeft, User, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLevel } from "@/lib/gameData";
import SwappableDetailDialog from "@/components/shared/SwappableDetailDialog";

const today = format(new Date(), "yyyy-MM-dd");

export default function TacticalDrillDetailDialog({ open, onClose, drill, category, profile, allDrills, onSwap }) {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorial, setTutorial] = useState(null);
  const [loadingTutorial, setLoadingTutorial] = useState(false);
  const [notes, setNotes] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [completed, setCompleted] = useState(false);
  const queryClient = useQueryClient();

  const isFavorite = profile?.favorite_drills?.includes(drill?.name);

  useEffect(() => {
    if (!drill) return;
    setShowTutorial(false);
    setTutorial(null);
    setNotes("");
    setVideoUrl("");
    setCompleted(false);
  }, [drill?.name]);

  const generateTutorial = async () => {
    if (tutorial) { setShowTutorial(!showTutorial); return; }
    setLoadingTutorial(true);
    setShowTutorial(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Create a detailed step-by-step tutorial for the tactical drill "${drill.name}" for a ${profile?.age}-year-old soccer player (${profile?.position}, ${profile?.skill_level} level).

Description: ${drill.desc}
${drill.detail ? 'Additional detail: ' + drill.detail : ''}

Include:
1. Setup (diagram-like description of positioning)
2. Step-by-step execution (numbered steps)
3. Coaching points (3-5 key tips)
4. Common mistakes to avoid
5. Progression ideas (make it harder)
6. A YouTube search term to find a related video tutorial`,
        response_json_schema: {
          type: "object",
          properties: {
            setup: { type: "string" },
            steps: { type: "array", items: { type: "object", properties: { step_number: { type: "number" }, instruction: { type: "string" }, duration: { type: "string" } } } },
            coaching_points: { type: "array", items: { type: "string" } },
            common_mistakes: { type: "array", items: { type: "string" } },
            progressions: { type: "array", items: { type: "string" } },
            youtube_search: { type: "string" },
          },
        },
      });
      setTutorial(result);
    } catch {} finally { setLoadingTutorial(false); }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setVideoUrl(result.file_url);
    } catch {} finally { setUploadingVideo(false); }
  };

  const completeDrill = async () => {
    const logs = await base44.entities.DailyLog.filter({ date: today });
    let log = logs?.[0];
    const entry = { category: category || "tactical", drill_name: drill.name, completed: true, xp_earned: drill.xp || 0, notes: notes || undefined, video_url: videoUrl || undefined };

    if (log) {
      const existing = log.training_completed || [];
      await base44.entities.DailyLog.update(log.id, {
        training_completed: [...existing, entry],
        xp_earned_today: (log.xp_earned_today || 0) + (drill.xp || 0),
      });
    } else {
      await base44.entities.DailyLog.create({
        player_id: profile.id,
        date: today,
        training_completed: [entry],
        xp_earned_today: drill.xp || 0,
      });
    }

    if (profile) {
      await base44.entities.PlayerProfile.update(profile.id, {
        xp: (profile.xp || 0) + (drill.xp || 0),
      });
    }

    setCompleted(true);
    queryClient.invalidateQueries({ queryKey: ["daily-log"] });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
    queryClient.invalidateQueries({ queryKey: ["all-training-logs"] });
  };

  const toggleFavorite = async () => {
    const favs = profile?.favorite_drills || [];
    const updated = favs.includes(drill.name)
      ? favs.filter((f) => f !== drill.name)
      : [...favs, drill.name];
    await base44.entities.PlayerProfile.update(profile.id, { favorite_drills: updated });
    queryClient.invalidateQueries({ queryKey: ["profiles"] });
  };

  const actions = (
    <div className="flex items-center gap-1.5">
      <button
        onClick={toggleFavorite}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isFavorite ? "bg-accent/20 text-accent" : "bg-secondary text-muted-foreground hover:text-accent"
        }`}
      >
        <Star className={`w-4 h-4 ${isFavorite ? "fill-accent" : ""}`} />
      </button>
      <Button size="sm" variant="outline" onClick={() => showTutorial ? setShowTutorial(false) : generateTutorial()}>
        <BookOpen className="w-3.5 h-3.5 mr-1" /> {showTutorial ? "Hide Tutorial" : "Tutorial"}
      </Button>
    </div>
  );

  return (
    <SwappableDetailDialog
      open={open}
      onClose={onClose}
      item={drill}
      title={drill?.name}
      subtitle={`${category || "Tactical"} · ${drill?.duration || ""} · ${drill?.xp || 0} XP`}
      icon={<span className="text-2xl">{drill?.icon || "📋"}</span>}
      primaryColor="bg-orange-500/15 text-orange-400"
      profile={profile}
      allItems={allDrills}
      onSwap={onSwap}
      swapContext={`${category || "tactical"} drill for a ${profile?.position} player`}
      actions={actions}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{drill?.desc}</p>
        {drill?.detail && (
          <div className="rounded-lg bg-secondary/30 border border-border p-3">
            <p className="text-xs text-muted-foreground">{drill.detail}</p>
          </div>
        )}

        {/* Tutorial */}
        <AnimatePresence>
          {showTutorial && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <div className="space-y-4 pt-2">
                {loadingTutorial ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : tutorial ? (
                  <>
                    <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
                      <h4 className="text-xs font-semibold text-orange-400 mb-1">📐 Setup</h4>
                      <p className="text-xs text-muted-foreground">{tutorial.setup}</p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold">📋 Step-by-Step</h4>
                      {tutorial.steps?.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/30">
                          <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary font-bold flex-shrink-0">{s.step_number}</span>
                          <div>
                            <p className="text-xs">{s.instruction}</p>
                            {s.duration && <p className="text-[10px] text-muted-foreground">{s.duration}</p>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
                      <h4 className="text-xs font-semibold text-green-400 mb-1">💡 Coaching Points</h4>
                      {tutorial.coaching_points?.map((cp, i) => (<p key={i} className="text-xs text-muted-foreground">• {cp}</p>))}
                    </div>

                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                      <h4 className="text-xs font-semibold text-red-400 mb-1">⚠️ Common Mistakes</h4>
                      {tutorial.common_mistakes?.map((m, i) => (<p key={i} className="text-xs text-muted-foreground">• {m}</p>))}
                    </div>

                    {tutorial.progressions?.length > 0 && (
                      <div className="rounded-lg bg-secondary/30 border border-border p-3">
                        <h4 className="text-xs font-semibold mb-1">📈 Progressions</h4>
                        {tutorial.progressions.map((p, i) => (<p key={i} className="text-xs text-muted-foreground">• {p}</p>))}
                      </div>
                    )}

                    {tutorial.youtube_search && (
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(tutorial.youtube_search)}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-400 hover:underline">
                        <ExternalLink className="w-3 h-3" /> Watch on YouTube: "{tutorial.youtube_search}"
                      </a>
                    )}
                  </>
                ) : null}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes & Video */}
        <div className="space-y-3 border-t border-border pt-4">
          <h4 className="text-xs font-semibold flex items-center gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Session Notes</h4>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="What did you learn? What went well? What needs work?"
            className="w-full bg-secondary border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
          />

          <div>
            {videoUrl ? (
              <div className="flex items-center gap-2 text-xs text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Video uploaded
                <button onClick={() => setVideoUrl("")} className="text-muted-foreground hover:text-red-400"><X className="w-3 h-3" /></button>
              </div>
            ) : (
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {uploadingVideo ? "Uploading..." : "Upload technique video"}
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>
            )}
          </div>
        </div>

        {/* Complete Button */}
        <Button
          className={`w-full ${completed ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"}`}
          onClick={completeDrill}
          disabled={completed}
        >
          {completed ? (
            <><CheckCircle2 className="w-4 h-4 mr-2" /> Drill Completed — +{drill?.xp || 0} XP</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Mark as Done — {drill?.xp || 0} XP</>
          )}
        </Button>
      </div>
    </SwappableDetailDialog>
  );
}