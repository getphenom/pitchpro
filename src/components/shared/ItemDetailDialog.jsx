import { useState } from "react";
import { X, Star, CheckCircle2, Undo2, Dumbbell, Droplets, UtensilsCrossed, Brain, Map, Timer, Info, Lightbulb, Circle, ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_META = {
  training: { label: "Training", icon: Dumbbell, color: "text-green-400", bg: "bg-green-500/10 border-green-500/20" },
  hydration: { label: "Hydration", icon: Droplets, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  nutrition: { label: "Nutrition", icon: UtensilsCrossed, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  mental: { label: "Mental", icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  tactical: { label: "Tactical", icon: Map, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  recovery: { label: "Recovery", icon: Timer, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

const QUEST_GUIDES = {
  "Shot Stopping Drill": {
    what: "Shot stopping is the goalkeeper's most important skill — reacting quickly to block shots from any angle using your hands, body, or feet.",
    steps: [
      "Set up 6 cones in an arc 8-12 yards from goal",
      "Have a partner or wall to rebound shots back at you",
      "Start in ready position: knees bent, weight forward, hands at chest height",
      "Rep 1-5: Dive low to your left — push off your outside foot, hands lead the body",
      "Rep 6-10: Dive low to your right — same technique, mirror side",
      "Rep 11-15: High saves — jump and extend, catch or parry over the bar",
      "Rep 16-20: Mix directions — partner calls left or right as they shoot",
    ],
    tip: "Always watch the ball, not the shooter's eyes. The ball never lies.",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&q=80",
  },
  "Distribution Practice": {
    what: "Distribution is how a goalkeeper starts attacks — accurate throws, goal kicks, and punts that find teammates and launch counter-attacks.",
    steps: [
      "Mark 3 targets at different distances: 20yd, 35yd, and 50yd downfield",
      "Rep 1-5: Roll the ball underarm to the 20yd target — low, fast, accurate",
      "Rep 6-10: Overarm throws to the 35yd target — step into the throw",
      "Rep 11-15: Goal kicks from the 6-yard box to the 50yd target — follow through",
      "Bonus: Practice drop kicks (punts) if your league allows them",
    ],
    tip: "Think of yourself as the first attacker. A quick, accurate distribution can start a goal.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80",
  },
  "Finishing Drill": {
    what: "Finishing is the art of putting the ball in the net. Great strikers place shots precisely rather than just blasting them — it's about placement, composure, and timing.",
    steps: [
      "Set up 10 balls at the edge of the penalty box (18 yards) in a semi-circle",
      "Start with your dominant foot: place each shot low into the corners — aim for the side netting",
      "Rep 1-10: Right foot, far post — open your hips, strike with the inside of your foot",
      "Rep 11-20: Left foot, near post — keep your head down, ankle locked",
      "Rep 21-30: First-touch finishes — toss the ball up, control, and shoot in one motion",
      "Mix it up: try curling shots, chips, and driven low shots",
    ],
    tip: "The goal doesn't move. Pick your spot before you shoot and don't look at the keeper.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
  },
  "Movement Runs": {
    what: "Strikers create space through intelligent movement. Curved runs, checking runs, and blind-side runs pull defenders out of position and open passing lanes.",
    steps: [
      "Set up 3 cones as defenders in a line across the penalty box",
      "Start 5 yards behind the defensive line — you're timing your run to stay onside",
      "Rep 1-5: Diagonal runs — sprint from right to left behind the cones, call for the ball",
      "Rep 6-10: Check-to-spin — jog toward the ball, then spin and sprint behind the defense",
      "Rep 11-15: Blind-side runs — start behind the defender's back, bend your run to appear in space",
      "Add a partner: have them pass the ball into space for you to run onto",
    ],
    tip: "Check your shoulder before every run. Know where the defender and the ball are.",
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80",
  },
  "1v1 Dribbling": {
    what: "1v1 dribbling is beating a defender with skill and speed. Wingers use body feints, stepovers, and changes of direction to create separation and attacking opportunities.",
    steps: [
      "Set up a defender cone 10 yards ahead, then another cone (the goal line) 15 yards beyond it",
      "Start at walking pace: approach the cone, perform a move, and accelerate past it",
      "Rep 1-5: Body feint — drop your shoulder one way, push the ball the other way",
      "Rep 6-10: Stepover — circle your foot over the ball, then exit with the outside of your other foot",
      "Rep 11-15: La Croqueta (Iniesta) — quick inside-outside touch to shift the ball past the defender",
      "Speed it up: try all moves at full pace with a real partner defending",
    ],
    tip: "The key isn't the move itself — it's the change of pace AFTER the move. Explode away.",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80",
  },
  "Crossing Practice": {
    what: "Crossing delivers the ball from wide areas into the penalty box. A good cross curves away from the keeper and into the path of attacking runners.",
    steps: [
      "Position yourself near the corner flag on your preferred side",
      "Mark 3 target zones in the box: near post, penalty spot, and far post",
      "Rep 1-7: Driven cross to near post — low, whipped with pace, strike with laces",
      "Rep 8-14: Lofted cross to penalty spot — lean back slightly, strike underneath the ball",
      "Rep 15-20: Curled cross to far post — use inside of foot, wrap around the ball",
      "For each cross, aim to land the ball in the target zone",
    ],
    tip: "Look up before you cross. Identify where your teammates are (or would be) — don't just blast it blindly.",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
  },
  "Heading Practice": {
    what: "Defensive heading clears crosses and set pieces away from danger. It's about timing your jump, using your forehead (not the top of your head), and directing the ball up and away.",
    steps: [
      "Stand in the center of the penalty area facing a partner or wall",
      "Have balls served (thrown or kicked) at head height from 15 yards",
      "Rep 1-5: Standing headers — plant feet, use neck muscles, head through the bottom half of the ball for height",
      "Rep 6-10: Jumping headers — time your jump so you meet the ball at your highest point",
      "Rep 11-15: Directional headers — aim to your left, then right, calling your target aloud",
      "Rep 16-20: Under pressure — have someone lightly challenge you from behind (safe pressure)",
    ],
    tip: "Attack the ball — don't wait for it to hit you. Keep your eyes open and mouth closed.",
    image: "https://images.unsplash.com/photo-1489944440613-453fc6b48ac9?w=600&q=80",
  },
  "Long Passing Drill": {
    what: "Long passing switches the point of attack and breaks defensive lines. Center backs who can play accurate 40-yard diagonals are invaluable for building from the back.",
    steps: [
      "Set up a 10x10 yard target zone 35-40 yards away",
      "Start with a stationary ball — strike through the center with your laces for a driven pass",
      "Rep 1-5: Right foot, driven pass into the target zone — follow through toward the target",
      "Rep 6-10: Left foot, driven pass — develop both feet, even if weaker",
      "Rep 11-15: Lofted diagonal — strike underneath the ball with your instep, like a golf wedge",
      "Rep 16-20: Under pressure — receive a pass, take one touch, then hit the long ball",
    ],
    tip: "Plant your standing foot next to the ball pointing at your target. Your body shape determines accuracy.",
    image: "https://images.unsplash.com/photo-1600679472829-3044539ce8ed?w=600&q=80",
  },
  "Overlapping Runs": {
    what: "An overlapping run is when a fullback sprints past the winger on the outside to receive the ball in space. It creates 2v1 situations and is one of the most dangerous attacking moves in soccer.",
    steps: [
      "Start 5 yards behind a cone (your winger) near the sideline at midfield",
      "The winger cuts inside with the ball — that's your cue to overlap",
      "Rep 1-5: Sprint past the winger on the outside, staying wide near the touchline",
      "Rep 6-10: Overlap + cross — receive a pass and deliver a first-time cross into the box",
      "Rep 11-15: Underlap instead — cut inside the winger, receive the ball centrally, and shoot or pass",
    ],
    tip: "Time your run so you don't arrive too early (offside) or too late (defender recovers). Communicate — yell overlap so your winger knows.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80",
  },
  "Defensive 1v1": {
    what: "Jockeying is the fundamental defensive technique — staying between your opponent and the goal while delaying their attack. You don't dive in; you stay patient, balanced, and force them into a mistake. Think of it like a basketball defender staying in front of their man.",
    steps: [
      "Understand the stance: knees bent, body sideways at a 45-degree angle, on your toes (not heels)",
      "Rep 1-3: Shadow jockeying — have a partner dribble slowly side to side while you mirror them without tackling",
      "Rep 4-7: Forward jockeying — partner dribbles forward, you backpedal in your jockey stance, staying 2-3 feet away",
      "Rep 8-12: The tackle — when the attacker takes a heavy touch, step across with your front foot and win the ball",
      "Rep 13-15: Full speed — partner attacks at game pace, you jockey, wait for the moment, and tackle",
      "Key rule: Never go to ground unless you're 100% sure you'll win the ball. Stay on your feet.",
    ],
    tip: "Watch the ball, not the player's feet or body. The ball is what you need to win.",
    image: "https://images.unsplash.com/photo-1566577134770-3d85ec1e55a8?w=600&q=80",
  },
  "Interception Drill": {
    what: "Intercepting passes is about reading the game, anticipating where the ball is going, and stepping into the passing lane before the receiver. Defensive midfielders are the masters of this.",
    steps: [
      "Set up 3 attackers spread 15 yards apart in a triangle, with you in the middle",
      "The attackers pass the ball among themselves — your job is to intercept",
      "Round 1 (5 min): Stay centrally, read body shapes, and step into passing lanes",
      "Round 2 (5 min): Attackers pass faster — you must anticipate rather than react",
      "Round 3 (5 min): After intercepting, quickly play a pass to a target player outside the triangle (transition!)",
      "Track your interceptions — aim for 5+ per round",
    ],
    tip: "Watch the passer's plant foot — it tells you where the ball is going before it's struck.",
    image: "https://images.unsplash.com/photo-1553778263-73a83baba209?w=600&q=80",
  },
  "Ball Recovery": {
    what: "Ball recovery is winning possession back immediately after your team loses it — the 6-second rule. Press, tackle, or force a bad pass within seconds of the turnover.",
    steps: [
      "Start 30 yards from goal — have a partner dribble toward you",
      "As soon as you lose a simulated possession, sprint to close down the ball carrier",
      "Rep 1-5: Angle your run to cut off their forward passing option — make them go sideways or backward",
      "Rep 6-10: Arrive with controlled intensity — don't fly past them, slow down on approach",
      "Rep 11-15: Win the ball and immediately play a forward pass to a target",
      "Rep 16-20: If you can't win it cleanly, force them into a bad touch and have a teammate clean up",
    ],
    tip: "The first 3 seconds after losing the ball are when the opponent is most vulnerable. React instantly.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=80",
  },
  "Passing Combinations": {
    what: "Quick one-two passing combinations break defensive lines through speed of play. Central midfielders use wall passes, third-man runs, and give-and-gos to progress the ball.",
    steps: [
      "Set up 4 cones in a diamond: 10 yards between each cone, you start at the bottom",
      "Pass to the right cone (partner), sprint forward, receive the return pass at the top cone",
      "Rep 1-5: Basic wall pass — pass, move, receive, then switch to the left side",
      "Rep 6-10: Third-man combination — pass to A, A passes to B, you've already moved to receive from B",
      "Rep 11-15: One-touch only — no extra touches, keep the ball moving at speed",
      "Rep 16-20: Add a passive defender who tries to intercept — forces sharper passing and movement",
    ],
    tip: "The ball moves faster than any player. One-touch passing is your best weapon — think before you receive.",
    image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=600&q=80",
  },
  "Box-to-Box Runs": {
    what: "Box-to-box midfielders cover every blade of grass — defending in their own box one moment and arriving in the opponent's box the next. It requires elite stamina and timing.",
    steps: [
      "Mark two lines 50 yards apart (penalty box to penalty box)",
      "Rep 1-5: Shuttle runs with the ball — dribble from box to box at 70% pace, turn, repeat",
      "Rep 6-10: Sprint without the ball — 100% effort between boxes, jog back as recovery",
      "Rep 11-15: Arrive in the box — sprint from midfield, receive a pass inside the box, and finish",
      "Rep 16-20: Defend then attack — start with a defensive action (tackle cone), then explode forward 40 yards",
    ],
    tip: "Pick your moments. You can't sprint box-to-box every attack — learn when to go and when to hold.",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&q=80",
  },
  "Through Ball Practice": {
    what: "A through ball splits the defense with a weighted pass into space behind the back line. Attacking midfielders must judge weight (pace), angle, and timing perfectly.",
    steps: [
      "Set up two cones as center backs 10 yards apart, with a target zone 15 yards behind them",
      "Start 25 yards from the target zone with a partner making runs",
      "Rep 1-5: Ground through ball — use the inside of your foot, pass into the space behind the defenders for your runner",
      "Rep 6-10: Outside-of-the-foot through ball — disguise the pass, use the outside to bend it around a defender",
      "Rep 11-15: Chipped through ball — loft it over the defensive line (use when the ground pass is blocked)",
      "Rep 16-20: With a recovering defender — play the pass before the defender catches your runner",
    ],
    tip: "The weight is everything. Too soft = intercepted. Too hard = runs out of play. Imagine rolling the ball onto a dime.",
    image: "https://images.unsplash.com/photo-1553778263-73a83baba209?w=600&q=80",
  },
  "Turn & Shoot": {
    what: "Turning with the ball under pressure and getting a shot off quickly is a hallmark of elite attacking midfielders and strikers. It's about your first touch setting up the shot.",
    steps: [
      "Stand with your back to goal at the edge of the penalty box (the D)",
      "Have a partner pass the ball firmly into your feet from 10 yards away",
      "Rep 1-5: Open-body turn — receive on your back foot, open your hips, and shoot in one fluid motion",
      "Rep 6-10: Inside turn — let the ball run across your body, turn inside, and shoot with your other foot",
      "Rep 11-15: Flick and spin — flick the ball around an imaginary defender with the outside of your foot, spin, and finish",
      "Count your goals: aim for 8+ out of 15 on target",
    ],
    tip: "Check over your shoulder before you receive the ball. Know where the goal and defender are before your first touch.",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&q=80",
  },
  "Hydration Check": {
    what: "Proper hydration improves endurance, focus, and recovery. Even 2% dehydration can reduce performance by 10% — that's the difference between a good game and a great one.",
    steps: [
      "Fill a water bottle first thing in the morning and keep it visible all day",
      "Drink a full glass of water with every meal and snack",
      "Set a reminder on your phone to drink every 2 hours",
      "Check your urine color at midday — pale yellow = hydrated, dark = drink more now",
      "After training: add electrolytes (pinch of salt or sports drink) to replace what you lost in sweat",
    ],
    tip: "Don't chug everything at once — sip consistently throughout the day. Your body absorbs water better in small, frequent amounts.",
  },
  "Fuel Up": {
    what: "Logging meals builds nutritional awareness. Athletes who track their food consistently make better choices, recover faster, and perform better.",
    steps: [
      "Log your breakfast within 30 minutes of eating — include protein, carbs, and fruit",
      "Log your lunch — aim for lean protein, whole grains, and colorful vegetables",
      "Log your dinner — include carbs to fuel tomorrow's training",
      "Log any snacks — fruit, nuts, or yogurt are great between meals",
      "At the end of the day, scan your log — did you eat a rainbow of foods?",
    ],
    tip: "Don't skip meals. Your body is a high-performance engine — it needs consistent fuel, not feast-or-famine.",
  },
  "Mental Rep": {
    what: "Visualization primes your brain for success. The same neural pathways fire whether you physically perform an action or vividly imagine it. Pro athletes use this before every competition.",
    steps: [
      "Find a quiet spot — sit comfortably, no phone, no distractions (5 min setup)",
      "Close your eyes and take 5 slow, deep breaths — inhale for 4 counts, exhale for 6",
      "Picture yourself on the pitch — feel the grass under your boots, hear the sounds of the game",
      "Visualize one specific play: a perfect tackle, a clean pass, a composed finish",
      "See it in first person — through your own eyes — not like watching a video of yourself",
      "Repeat a positive phrase: I am prepared. I am confident. I am ready.",
    ],
    tip: "Do this daily for 5 minutes. It feels strange at first but becomes powerful with consistency — just like physical training.",
  },
  "Tactical Study": {
    what: "Understanding your position tactically separates good players from great ones. Watching and analyzing how the pros play your position builds your soccer IQ.",
    steps: [
      "Find a 5-10 minute highlight video of a professional who plays your position",
      "Watch it once normally, then watch it again — this time pausing every 30 seconds",
      "Ask yourself: Where are they positioned when their team has the ball? Where when they don't?",
      "Notice their movement OFF the ball — that's where 90% of the game happens",
      "Write down 3 specific things you saw that you want to try in your next game",
      "Before your next session, review your 3 notes and commit to trying them",
    ],
    tip: "Don't just watch the ball — watch your position. Pause the video and predict where the player will move next.",
  },
};

export default function ItemDetailDialog({ open, onClose, item, onAction }) {
  const [completedSteps, setCompletedSteps] = useState({});
  const [showTips, setShowTips] = useState(false);
  const [sessionNotes, setSessionNotes] = useState("");

  if (!open || !item) return null;

  const { title, description, xp, icon, category, completed } = item;
  const meta = CATEGORY_META[category];
  const guide = QUEST_GUIDES[title];

  const toggleStep = (i) => {
    setCompletedSteps((prev) => ({ ...prev, [i]: !prev[i] }));
  };

  const completedCount = guide?.steps ? guide.steps.filter((_, i) => completedSteps[i]).length : 0;
  const totalSteps = guide?.steps?.length || 0;

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
          className="bg-card w-full sm:max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden border border-border"
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
                <p className="text-[11px] text-muted-foreground">{completed ? "Already earned" : "Awarded on completion"}</p>
              </div>
            </div>

            {/* What is this? */}
            {guide?.what && (
              <div className={`rounded-xl ${meta?.bg || "bg-secondary border-border"} p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">What Is This?</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{guide.what}</p>
              </div>
            )}

            {/* Image */}
            {guide?.image && (
              <div className="rounded-xl overflow-hidden border border-border">
                <img
                  src={guide.image}
                  alt={title}
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
              </div>
            )}

            {/* Actionable Steps */}
            {guide?.steps && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                    Action Steps ({completedCount}/{totalSteps})
                  </h4>
                </div>
                <div className="space-y-1">
                  {guide.steps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => toggleStep(i)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-all ${
                        completedSteps[i]
                          ? "bg-green-500/10 border border-green-500/20"
                          : "bg-secondary/40 border border-transparent hover:border-border"
                      }`}
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {completedSteps[i] ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground/40" />
                        )}
                      </div>
                      <p className={`text-xs leading-relaxed ${completedSteps[i] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {step}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Pro Tip */}
            {guide?.tip && (
              <button
                onClick={() => setShowTips(!showTips)}
                className="w-full rounded-xl bg-accent/5 border border-accent/20 p-3 text-left hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-accent" />
                    <span className="text-xs font-semibold text-accent">Pro Tip</span>
                  </div>
                  {showTips ? (
                    <ChevronUp className="w-4 h-4 text-accent/60" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-accent/60" />
                  )}
                </div>
                {showTips && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-xs text-muted-foreground mt-2 leading-relaxed"
                  >
                    {guide.tip}
                  </motion.p>
                )}
              </button>
            )}
          </div>

          {/* Session Notes (training quests only) */}
          {!completed && category === "training" && (
            <div className="px-5 pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                <label className="text-xs font-heading font-bold uppercase tracking-wider text-muted-foreground">
                  Session Notes
                </label>
              </div>
              <Textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="How did this session feel? Energy level, soreness, technique notes..."
                className="h-20 text-xs resize-none"
              />
            </div>
          )}

          {/* Action */}
          <div className="p-5 border-t border-border flex-shrink-0">
            <Button
              className={`w-full font-semibold ${
                completed
                  ? "bg-secondary hover:bg-secondary/80 text-foreground"
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              }`}
              onClick={() => { onAction?.(item, sessionNotes); onClose(); }}
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