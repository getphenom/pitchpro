import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Map, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";

const FORMATIONS = [
  { name: "4-3-3", style: "Attacking", desc: "Balanced formation with 3 forwards. Great for wing play." },
  { name: "4-4-2", style: "Classic", desc: "Traditional setup with two strikers and solid midfield." },
  { name: "4-2-3-1", style: "Modern", desc: "Defensive mids shield the back, creative #10 behind striker." },
  { name: "3-5-2", style: "Wing-backs", desc: "Three center backs with attacking wing-backs." },
  { name: "4-1-4-1", style: "Control", desc: "Single pivot with two wide players and an attacking mid." },
];

const POSITION_ROLES = {
  goalkeeper: {
    roles: ["Shot Stopper", "Sweeper Keeper"],
    key_skills: ["Distribution", "Positioning", "Communication", "Shot stopping", "1v1 saves"],
    principles: [
      "Always be vocal — organize your defence",
      "Start your positioning from the center of the goal line",
      "Come off your line for through balls",
      "Distribute quickly to start counter-attacks",
    ],
  },
  center_back: {
    roles: ["Ball-Playing CB", "Stopper", "Sweeper"],
    key_skills: ["Heading", "Tackling", "Positioning", "Long passing", "Composure"],
    principles: [
      "Stay compact with your partner",
      "Don't dive in — jockey and wait",
      "Communicate with GK and full-backs constantly",
      "Play out from the back when safe",
    ],
  },
  full_back: {
    roles: ["Attacking FB", "Inverted FB", "Defensive FB"],
    key_skills: ["Crossing", "Overlapping runs", "1v1 defending", "Recovery speed", "Stamina"],
    principles: [
      "Track runners — don't get caught upfield",
      "Overlap when winger comes inside",
      "Deliver crosses to the near post zone",
      "Recover quickly after attacking runs",
    ],
  },
  defensive_mid: {
    roles: ["Destroyer", "Deep Playmaker", "Box-to-Box"],
    key_skills: ["Interceptions", "Tackling", "Passing range", "Positioning", "Game reading"],
    principles: [
      "Screen the back four — cut passing lanes",
      "Recycle possession with simple passes",
      "Drop between CBs to create a back 3 in build-up",
      "Win the ball back and transition quickly",
    ],
  },
  central_mid: {
    roles: ["Box-to-Box", "Mezzala", "Playmaker"],
    key_skills: ["Passing", "Shooting", "Vision", "Work rate", "Ball control"],
    principles: [
      "Arrive late in the box for goals",
      "Switch play with long diagonal passes",
      "Link defence and attack — always available",
      "Track back to help defend set pieces",
    ],
  },
  attacking_mid: {
    roles: ["Classic #10", "False 9", "Shadow Striker"],
    key_skills: ["Through balls", "Dribbling", "Shooting", "Creativity", "Movement"],
    principles: [
      "Find pockets of space between the lines",
      "Turn and face goal whenever possible",
      "Play the killer pass — look for runners",
      "Press the opponent's deepest midfielder",
    ],
  },
  winger: {
    roles: ["Traditional Winger", "Inverted Winger", "Inside Forward"],
    key_skills: ["Pace", "Dribbling", "Crossing", "1v1s", "Cutting inside"],
    principles: [
      "Stay wide to stretch the defence",
      "Take on your full-back — be direct",
      "Cut inside on your strong foot to shoot",
      "Track back to help your full-back defend",
    ],
  },
  striker: {
    roles: ["Target Man", "Poacher", "False 9", "Complete Forward"],
    key_skills: ["Finishing", "Movement", "Heading", "Hold-up play", "Composure"],
    principles: [
      "Always be on the shoulder of the last defender",
      "Make runs that defenders hate — curved, diagonal",
      "Be clinical — make the most of every chance",
      "Link play when the ball comes to feet",
    ],
  },
};

export default function Tactics() {
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [tacticalPlan, setTacticalPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  const profile = profiles?.[0];

  const generateTacticalPlan = async () => {
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a detailed tactical guide for a ${profile.age}-year-old ${POSITION_LABELS[profile.position]} at ${profile.skill_level} level.

Include:
1. Role description for their position
2. Key responsibilities in attack and defence
3. Movement patterns (with/without ball)
4. How to read the game from their position
5. Common mistakes to avoid
6. Pro player examples to study
7. Specific drills for tactical improvement

Make it practical and age-appropriate.`,
      response_json_schema: {
        type: "object",
        properties: {
          role_description: { type: "string" },
          attacking_duties: { type: "array", items: { type: "string" } },
          defensive_duties: { type: "array", items: { type: "string" } },
          movement_patterns: { type: "array", items: { type: "string" } },
          game_reading_tips: { type: "array", items: { type: "string" } },
          common_mistakes: { type: "array", items: { type: "string" } },
          pro_players_to_study: { type: "array", items: { type: "object", properties: { name: { type: "string" }, reason: { type: "string" } } } },
          tactical_drills: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" }, duration: { type: "string" } } } },
        },
      },
    });
    setTacticalPlan(result);
    setLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) return null;

  const posData = POSITION_ROLES[profile.position] || POSITION_ROLES.central_mid;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold">Tactical IQ</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master the {POSITION_LABELS[profile.position]} role
          </p>
        </div>

        {/* Position Overview */}
        <div className="rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/5 border border-orange-500/20 p-5">
          <h3 className="font-heading font-bold">{POSITION_LABELS[profile.position]}</h3>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {posData.roles.map((role, i) => (
              <span key={i} className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded-lg">
                {role}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Key Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {posData.key_skills.map((skill, i) => (
                <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-lg">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Principles */}
        <div className="space-y-2">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Key Principles
          </h3>
          {posData.principles.map((principle, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-xs text-primary font-bold">
                {i + 1}
              </div>
              <p className="text-sm text-foreground/90">{principle}</p>
            </motion.div>
          ))}
        </div>

        {/* Formations */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            Formations
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {FORMATIONS.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedFormation(selectedFormation === i ? null : i)}
                className={`rounded-xl bg-card border p-3 cursor-pointer transition-all
                  ${selectedFormation === i ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}
              >
                <p className="font-heading font-bold text-lg">{f.name}</p>
                <p className="text-xs text-primary">{f.style}</p>
                {selectedFormation === i && (
                  <p className="text-xs text-muted-foreground mt-2">{f.desc}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* AI Tactical Plan */}
        <div className="space-y-3">
          <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">
            AI Tactical Coach
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tacticalPlan ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-2">📋 Your Role</h4>
                <p className="text-sm text-muted-foreground">{tacticalPlan.role_description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                  <h4 className="font-semibold text-xs mb-2 text-green-400">⚔️ Attack</h4>
                  {tacticalPlan.attacking_duties?.map((d, i) => (
                    <p key={i} className="text-xs text-muted-foreground mb-1">• {d}</p>
                  ))}
                </div>
                <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                  <h4 className="font-semibold text-xs mb-2 text-blue-400">🛡️ Defence</h4>
                  {tacticalPlan.defensive_duties?.map((d, i) => (
                    <p key={i} className="text-xs text-muted-foreground mb-1">• {d}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-2">🏃 Movement Patterns</h4>
                {tacticalPlan.movement_patterns?.map((m, i) => (
                  <p key={i} className="text-xs text-muted-foreground mb-1">• {m}</p>
                ))}
              </div>

              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <h4 className="font-semibold text-xs mb-2 text-red-400">⚠️ Common Mistakes</h4>
                {tacticalPlan.common_mistakes?.map((m, i) => (
                  <p key={i} className="text-xs text-muted-foreground mb-1">• {m}</p>
                ))}
              </div>

              {tacticalPlan.pro_players_to_study?.length > 0 && (
                <div className="rounded-xl bg-card border border-border p-4">
                  <h4 className="font-semibold text-sm mb-3">⭐ Players to Study</h4>
                  {tacticalPlan.pro_players_to_study.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 mb-2">
                      <span className="text-primary text-xs font-bold">{p.name}:</span>
                      <p className="text-xs text-muted-foreground">{p.reason}</p>
                    </div>
                  ))}
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setTacticalPlan(null)}>
                Get New Analysis
              </Button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 p-6 text-center space-y-3">
              <Map className="w-10 h-10 text-orange-400 mx-auto" />
              <h4 className="font-heading font-bold">Tactical Deep Dive</h4>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Get a full tactical breakdown for your position.
              </p>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={generateTacticalPlan}>
                <Sparkles className="w-4 h-4 mr-2" /> Analyze My Position
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}