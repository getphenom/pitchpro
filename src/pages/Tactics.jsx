import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Map, Sparkles, ChevronRight, BookOpen, Clock, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TutorialModal from "@/components/shared/TutorialModal";
import { POSITION_LABELS } from "@/lib/gameData";
import { motion } from "framer-motion";
import TacticalCoachChat from "@/components/agents/TacticalCoachChat";

const TACTICAL_LIBRARY = {
  possession: {
    label: "Possession",
    icon: "🔄",
    color: "from-orange-500/20 to-orange-600/5 border-orange-500/20",
    desc: "Keep the ball and control the game",
    drills: [
      { name: "Positional Rondo", duration: "15 min", xp: 25, desc: "4v2 possession in a 10x10 grid — focus on creating triangles and passing angles", icon: "🔄", detail: "Set up a 10x10 yard square. 4 attackers keep the ball from 2 defenders. Key rules: maximum 2 touches, must create triangles, defenders switch after 60 seconds. Progress to 5v2 or add a neutral player." },
      { name: "Build-Up Pattern", duration: "15 min", xp: 25, desc: "Practice playing out from the back through thirds", icon: "🏗️", detail: "Start with GK rolling to CB. CB plays to CM who has checked into space. CM turns and plays to ST. ST lays off to overlapping FB. Walk through each pattern at half speed, then full speed with passive defenders." },
      { name: "Third Man Run", duration: "15 min", xp: 25, desc: "Combination play using a third man — pass, move, find the free player", icon: "🏃", detail: "Player A passes to B who lays off to C. A has already moved to receive from C. Key coaching point: the third man must time their movement to arrive as the ball does. Practice with 3 groups of 3 rotating." },
      { name: "Switch of Play", duration: "10 min", xp: 20, desc: "Quickly transfer the ball from one side to the other to exploit space", icon: "↔️", detail: "Set up two wide zones 30 yards apart. Ball starts on one side, 3 quick passes then a diagonal switch to the opposite wide player. The receiving player must control and play forward within 2 touches. Defenders shift to simulate game pressure." },
      { name: "Overload to Isolate", duration: "15 min", xp: 25, desc: "Create numerical superiority on one side, then switch to isolate the 1v1", icon: "⚖️", detail: "4v3 in one half of the pitch. After 5 passes, the ball is switched to a waiting winger on the far side for a 1v1. The winger has 5 seconds to beat their defender and cross or shoot." },
    ],
  },
  defending: {
    label: "Defending",
    icon: "🛡️",
    color: "from-red-500/20 to-red-600/5 border-red-500/20",
    desc: "Stay compact and win the ball back",
    drills: [
      { name: "Defensive Shape", duration: "10 min", xp: 20, desc: "Maintain compact defensive block, shift as the ball moves", icon: "🛡️", detail: "Set up 8 defenders in a 4-4-2 shape. Coach moves the ball slowly across the width. Defenders must shift as a unit — nearest player presses, others cover. Keep distances between players under 10 yards. Add attackers for realism." },
      { name: "Pressing Trigger Drill", duration: "10 min", xp: 20, desc: "Identify pressing cues and press as a unit — 3 triggers", icon: "🎯", detail: "3 pressing triggers: 1) heavy touch, 2) back pass, 3) receiver facing own goal. When trigger occurs, nearest player presses at full speed while teammates squeeze the space. Practice each trigger 5 times. Add counter-attack finish." },
      { name: "1v1 Jockeying", duration: "10 min", xp: 15, desc: "Stay on your feet, delay the attacker, force them wide", icon: "🥋", detail: "Defender starts 10 yards from attacker. Key technique: side-on stance, knees bent, weight on toes, eyes on ball. Force attacker onto their weaker foot. Don't dive in — wait for the heavy touch. Practice both left and right sides." },
      { name: "Recovery Runs", duration: "10 min", xp: 20, desc: "Sprint back to get goal-side when your team loses possession", icon: "💨", detail: "Start in attacking positions. On coach's whistle (simulating a turnover), all players sprint to get behind the ball within 5 seconds. Use poles to mark recovery lines. Track who recovers fastest. Add counter-attack threat to make it realistic." },
      { name: "Zonal Marking Set Piece", duration: "10 min", xp: 15, desc: "Defend corners and free kicks using zonal positioning", icon: "🧱", detail: "Assign 5 zones across the 6-yard box. Each defender owns their zone — attack the ball if it enters, hold if it doesn't. GK commands the 6-yard box. Practice against 5 different corner deliveries: near post, far post, short, driven, lofted." },
    ],
  },
  transitions: {
    label: "Transitions",
    icon: "⚡",
    color: "from-yellow-500/20 to-yellow-600/5 border-yellow-500/20",
    desc: "Attack and defend in the moments that decide games",
    drills: [
      { name: "Transition Sprint", duration: "10 min", xp: 20, desc: "Attack-to-defence transitions — sprint back after losing possession", icon: "⚡", detail: "3 attackers vs 2 defenders + GK. Attackers shoot, then immediately become defenders as 3 new attackers enter. Original defenders become attackers going the other way. Practice both offensive-to-defensive and defensive-to-offensive transitions." },
      { name: "Counter-Attack Drill", duration: "15 min", xp: 30, desc: "Win the ball and break at speed — 3v2 with recovering defender", icon: "💨", detail: "Defenders win possession in their own third. Within 3 touches, the ball must reach the halfway line. 3 attackers break against 2 defenders with 1 recovering. Must get a shot off within 8 seconds of winning possession." },
      { name: "Shadow Play", duration: "15 min", xp: 20, desc: "Walk through attacking patterns without opposition", icon: "👥", detail: "Full 11v0 shadow play. Walk through 3 attacking patterns: 1) building from GK, 2) middle third combination, 3) final third crossing/finishing. Every player learns their movement relative to the ball. Speed up gradually — half pace, 3/4 pace, full pace." },
      { name: "6-Second Rule", duration: "10 min", xp: 20, desc: "Win the ball back within 6 seconds of losing it", icon: "⏱️", detail: "After losing possession, the nearest 2-3 players immediately press to win it back. If not recovered within 6 seconds, drop into defensive shape. This is the 'gegenpress' principle. Count out loud. Award 1 point for recovery within 6 seconds." },
    ],
  },
  set_pieces: {
    label: "Set Pieces",
    icon: "🎯",
    color: "from-purple-500/20 to-purple-600/5 border-purple-500/20",
    desc: "Master the dead ball situations",
    drills: [
      { name: "Corner Kick Routines", duration: "15 min", xp: 25, desc: "Practice 3 different corner routines — near post, far post, short", icon: "🏴", detail: "Routine 1 (Near Post): Runner attacks front post, flick-on to back post runner. Routine 2 (Far Post): 3 players line up at penalty spot, break in different directions. Routine 3 (Short): Play short, receive return pass, cross from better angle. 5 reps each." },
      { name: "Free Kick Patterns", duration: "15 min", xp: 25, desc: "Direct and indirect free kick setups from scoring range", icon: "🎯", detail: "Direct FK (20-25 yards): 3-man wall deception — 2 dummy runs, 1 shooter. Indirect FK (inside box): 2 options — layoff for shot or chip to back post. Practice with a full wall (4-5 players) and GK. 5 reps each scenario." },
      { name: "Throw-In Combinations", duration: "10 min", xp: 15, desc: "Quick throw-in routines to keep possession or create chances", icon: "🤲", detail: "Pattern 1: Throw to feet, return pass, switch play. Pattern 2: Runner checks short, spins, receives long throw down the line. Pattern 3: Flick-on at near post from long throw into the box. Practice both attacking and defensive thirds." },
    ],
  },
  game_scenarios: {
    label: "Scenarios",
    icon: "🎮",
    color: "from-blue-500/20 to-blue-600/5 border-blue-500/20",
    desc: "Practice specific match situations",
    drills: [
      { name: "Protect the Lead", duration: "10 min", xp: 20, desc: "Game management when winning — keep the ball, waste time smartly", icon: "🔒", detail: "Simulate leading by 1 goal with 10 minutes left. 8v8 in a 60x40 area. Leading team must complete 10 consecutive passes to 'see out the game'. Trailing team presses high. No long clearances — must play through pressure." },
      { name: "Chasing the Game", duration: "10 min", xp: 20, desc: "How to play when losing — take risks, play direct, press higher", icon: "🔥", detail: "Simulate trailing by 1 goal with 10 minutes left. Trailing team plays with high defensive line, direct passes, and quick shots. GK becomes an extra outfield player. Must score within the 10-minute window. Practice emergency tactics: 3 up front, long throws." },
      { name: "Playing with 10 Men", duration: "10 min", xp: 15, desc: "Adjust shape and strategy after a red card", icon: "🔴", detail: "Simulate a red card after 60 minutes. 10v11 for the remaining time. Adjust to a 4-4-1 or 4-3-2 shape. Focus: stay compact, conserve energy, hit on the counter. 10-man team must survive 15 minutes without conceding." },
    ],
  },
};

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
  const [tutorialItem, setTutorialItem] = useState(null);
  const [activeTab, setActiveTab] = useState("possession");
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);

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

  if (!profile) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-3">
        <Map className="w-12 h-12 text-muted-foreground/30 mx-auto" />
        <p className="text-sm text-muted-foreground">Complete your profile first to unlock tactical training.</p>
      </div>
    </div>
  );

  const posData = POSITION_ROLES[profile.position] || POSITION_ROLES.central_mid;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <TutorialModal
          open={!!tutorialItem}
          onClose={() => setTutorialItem(null)}
          item={tutorialItem}
          context={`This is a tactical drill for a ${POSITION_LABELS[profile.position]}. Include detailed setup instructions, coaching points, and progression ideas.`}
          triggerLabel={tutorialItem?.name || "Tutorial"}
        />

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

        {/* Tactical Library */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : showAIAnalysis && tacticalPlan ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setShowAIAnalysis(false)} className="text-xs">
              ← Back to Library
            </Button>

            <div className="rounded-xl bg-card border border-border p-4">
              <h4 className="font-semibold text-sm mb-2">📋 Your Role</h4>
              <p className="text-sm text-muted-foreground">{tacticalPlan.role_description}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                <h4 className="font-semibold text-xs mb-2 text-green-400">⚔️ Attack</h4>
                {tacticalPlan.attacking_duties?.map((d, i) => (<p key={i} className="text-xs text-muted-foreground mb-1">• {d}</p>))}
              </div>
              <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-4">
                <h4 className="font-semibold text-xs mb-2 text-blue-400">🛡️ Defence</h4>
                {tacticalPlan.defensive_duties?.map((d, i) => (<p key={i} className="text-xs text-muted-foreground mb-1">• {d}</p>))}
              </div>
            </div>

            <div className="rounded-xl bg-card border border-border p-4">
              <h4 className="font-semibold text-sm mb-2">🏃 Movement Patterns</h4>
              {tacticalPlan.movement_patterns?.map((m, i) => (<p key={i} className="text-xs text-muted-foreground mb-1">• {m}</p>))}
            </div>

            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <h4 className="font-semibold text-xs mb-2 text-red-400">⚠️ Common Mistakes</h4>
              {tacticalPlan.common_mistakes?.map((m, i) => (<p key={i} className="text-xs text-muted-foreground mb-1">• {m}</p>))}
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

            {tacticalPlan.tactical_drills?.length > 0 && (
              <div className="rounded-xl bg-card border border-border p-4">
                <h4 className="font-semibold text-sm mb-3">⚽ Drills</h4>
                {tacticalPlan.tactical_drills.map((drill, i) => (
                  <div key={i} onClick={() => setTutorialItem(drill)} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-border cursor-pointer hover:border-primary/30 group">
                    <div className="flex items-center justify-between"><p className="text-sm font-medium group-hover:text-primary transition-colors">{drill.name}</p><span className="text-xs text-muted-foreground">{drill.duration}</span></div>
                    <p className="text-xs text-muted-foreground mt-1">{drill.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm tracking-wider uppercase text-muted-foreground">Tactical Library</h3>
              <Button variant="outline" size="sm" className="text-xs" onClick={async () => { setShowAIAnalysis(true); if (!tacticalPlan) await generateTacticalPlan(); }}>
                <Sparkles className="w-3.5 h-3.5 mr-1" /> AI Analysis
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-card border border-border rounded-lg p-1 gap-1 flex-wrap h-auto">
                {Object.entries(TACTICAL_LIBRARY).map(([key, cat]) => (
                  <TabsTrigger key={key} value={key}
                    className="flex-1 min-w-[60px] text-xs py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=inactive]:bg-transparent data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-secondary transition-all">
                    <span className="mr-1">{cat.icon}</span> {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(TACTICAL_LIBRARY).map(([key, cat]) => (
                <TabsContent key={key} value={key} className="space-y-3 mt-4">
                  <div className={`rounded-xl border bg-gradient-to-br p-4 ${cat.color}`}>
                    <h3 className="font-semibold text-sm">{cat.label} Drills</h3>
                    <p className="text-xs text-muted-foreground mt-1">{cat.desc} — {cat.drills.length} drills</p>
                  </div>
                  <div className="space-y-2">
                    {cat.drills.map((drill, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => setTutorialItem(drill)}
                        className="p-4 rounded-xl bg-card border border-border hover:border-orange-500/30 transition-all cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">{drill.icon}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm group-hover:text-orange-400 transition-colors">{drill.name}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{drill.desc}</p>
                            <span className="text-[10px] text-muted-foreground mt-1 group-hover:text-primary transition-colors inline-flex items-center gap-0.5">
                              <BookOpen className="w-3 h-3" /> Tap for tutorial
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{drill.duration}</div>
                            <div className="flex items-center gap-1 text-xs text-accent font-semibold"><Flame className="w-3 h-3" />{drill.xp} XP</div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}

        {/* Tactical Coach Agent */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-card border border-orange-500/20 p-5"
        >
          <TacticalCoachChat profile={profile} />
        </motion.div>
      </div>
    </div>
  );
}