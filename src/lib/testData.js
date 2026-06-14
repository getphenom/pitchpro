export const TEST_HOW_TO = {
  // ── Sprint Tests ──
  "20m Sprint": {
    what_it_measures: "Explosive acceleration over short distances — critical for beating opponents to the ball.",
    instructions: [
      { step: "Set up two cones exactly 20 meters apart on flat ground." },
      { step: "Start in a 2-point stance behind the first cone." },
      { step: "On your mark, explode forward at maximum speed." },
      { step: "Sprint through the finish cone — don't slow down early." },
      { step: "Record time. Rest 2-3 minutes between attempts. Take best of 3." },
    ],
    scoring: "Under 3.3s is excellent. Under 4.0s is good for young players.",
    affects: "Pace",
    common_mistakes: ["Starting too upright — stay low for the first 5-10m", "Slowing down before the finish line — sprint THROUGH it", "Looking at the timer person instead of straight ahead"],
  },
  "30m Sprint": {
    what_it_measures: "Acceleration and early top speed — the most common sprint distance in soccer match analysis.",
    instructions: [
      { step: "Mark exactly 30 meters with cones." },
      { step: "Start in a 2-point or 3-point stance." },
      { step: "Explode forward driving your knees high and pumping your arms." },
      { step: "Sprint full speed through the finish. Do NOT decelerate early." },
      { step: "Record time. Best of 3 attempts with full recovery (3 min rest)." },
    ],
    scoring: "Under 4.1s is elite. 4.5s is good. Over 5.5s needs work.",
    affects: "Pace",
    common_mistakes: ["Failing to drive knees high enough — limits stride length", "Tensing shoulders and neck — stay relaxed above the waist", "Taking too many short steps — focus on powerful pushes"],
  },
  "40-Yard Dash": {
    what_it_measures: "Pure sprint speed — the gold standard for measuring a player's pace over 40 yards (36.6m).",
    instructions: [
      { step: "Mark exactly 40 yards with cones or tape." },
      { step: "Start in a 3-point stance for maximum explosion." },
      { step: "Drive hard for 10 yards staying low, then gradually rise." },
      { step: "Maintain top speed through the finish line." },
      { step: "Best of 3 runs with full recovery between each." },
    ],
    scoring: "Under 4.4s is elite. 4.7s is good. Over 5.5s needs work.",
    affects: "Pace",
    common_mistakes: ["Popping up too early — stay low and drive for the first 10 yards", "Over-striding (reaching too far) — keep your feet under your hips", "Holding breath — breathe rhythmically throughout"],
  },

  // ── Agility Tests ──
  "T-Test Agility": {
    what_it_measures: "Multi-directional agility — your ability to change direction quickly while maintaining control.",
    instructions: [
      { step: "Set 4 cones in a T shape: cone A (bottom center), cone B (top center, 10 yards from A), cone C (top left, 5 yards from B), cone D (top right, 5 yards from B)." },
      { step: "Start at cone A. Sprint forward to cone B and touch it with your right hand." },
      { step: "Shuffle left to cone C and touch it with your left hand." },
      { step: "Shuffle right across to cone D (passing B) and touch with right hand." },
      { step: "Shuffle back to cone B, touch with left hand." },
      { step: "Backpedal to cone A. Stop the clock when you cross the line." },
    ],
    scoring: "Under 9.5s is elite. Under 10.5s is excellent. Over 14s needs work.",
    affects: "Physical",
    common_mistakes: ["Crossing feet while shuffling — keep them apart and slide", "Not touching the cones — you must make contact at each point", "Turning instead of shuffling in the lateral phase"],
  },
  "5-0-5 Agility": {
    what_it_measures: "Change-of-direction speed — the ability to decelerate, turn, and re-accelerate. Crucial for defending and attacking 1v1s.",
    instructions: [
      { step: "Set 3 cones: Start line, turning line 15 yards away, and finish line back at the start." },
      { step: "Start at the middle cone. Sprint 15 yards to the turning line." },
      { step: "Plant and pivot 180°, then sprint back through the start/finish line." },
      { step: "Timer starts when you cross the first timing gate and stops when you return." },
      { step: "Best of 3 attempts with full recovery." },
    ],
    scoring: "Under 2.3s is excellent. Under 2.5s is good. Over 3.0s needs work.",
    affects: "Pace",
    common_mistakes: ["Taking too many steps to turn — plant with one foot and explode back", "Decelerating too late — start slowing 2-3 steps before the turn", "Turning on the same foot every time — alternate to build both sides"],
  },

  // ── Jump Tests ──
  "Vertical Jump": {
    what_it_measures: "Lower body explosive power — directly relates to heading ability, goalkeeping reach, and overall athleticism.",
    instructions: [
      { step: "Stand flat-footed against a wall. Reach up with one arm and mark your standing reach height." },
      { step: "Chalk your fingertips or use a measuring device on the wall." },
      { step: "From a standing position, bend your knees and explode upward as high as you can." },
      { step: "Touch the wall at the peak of your jump. Measure the difference between standing reach and jump height." },
      { step: "Best of 3 attempts. No running start — this is a standing vertical jump." },
    ],
    scoring: "30+ inches is elite. 24+ is excellent. Under 10 inches needs work.",
    affects: "Physical",
    common_mistakes: ["Taking a step before jumping — this is a STANDING vertical", "Not using arms to generate momentum — swing them up as you jump", "Landing with locked knees — land softly with bent knees"],
  },
  "Standing Broad Jump": {
    what_it_measures: "Horizontal explosive power — reflects your ability to burst forward off one or both feet.",
    instructions: [
      { step: "Stand behind a line with feet shoulder-width apart." },
      { step: "Bend your knees, swing your arms back, then explode forward." },
      { step: "Jump as far forward as possible, landing on both feet." },
      { step: "Measure from the start line to the back of your heels where you land." },
      { step: "Best of 3 attempts. You must stick the landing — falling backward counts from where your hands touch." },
    ],
    scoring: "90+ inches is elite. 80+ is excellent. Under 60 inches needs work.",
    affects: "Physical",
    common_mistakes: ["Not swinging arms forcefully enough — arm drive is 30% of the jump", "Taking off from one foot — use both feet equally", "Landing too far forward and falling — hold the landing for 1 second"],
  },

  // ── Strength Tests ──
  "Push-ups (1 min)": {
    what_it_measures: "Upper body strength endurance — important for shielding, shoulder-to-shoulder duels, and throw-in power.",
    instructions: [
      { step: "Start in a plank position with hands slightly wider than shoulder-width." },
      { step: "Lower your body until your chest is about 2 inches from the ground." },
      { step: "Keep your body in a straight line — no sagging hips or piked hips." },
      { step: "Push back up to full arm extension. That's one rep." },
      { step: "Complete as many as you can in 60 seconds with proper form. You can rest in the up position." },
    ],
    scoring: "60+ reps is elite. 40+ is good. Under 15 needs work.",
    affects: "Physical",
    common_mistakes: ["Not going low enough — chest must nearly touch the ground", "Elbows flaring out — keep them at about 45° from your body", "Holding your breath — breathe in on the way down, out on the way up"],
  },
  "Bench Press (bodyweight)": {
    what_it_measures: "Upper body pushing strength relative to your body weight — bench your own weight for max reps.",
    instructions: [
      { step: "Load the bar to your current body weight. Always have a spotter." },
      { step: "Lie on the bench, grip the bar slightly wider than shoulder-width." },
      { step: "Unrack the bar and lower it to your chest with control (about 1-2 seconds)." },
      { step: "Press the bar back up to full arm extension. That's one rep." },
      { step: "Complete as many reps as possible with proper form. No bouncing off the chest." },
    ],
    scoring: "15+ reps is excellent. 10+ is good. Under 5 needs work.",
    affects: "Physical",
    common_mistakes: ["Bouncing the bar off your chest — lower with control, touch lightly", "Uneven pressing — keep the bar level throughout the movement", "Not using a spotter — always have someone ready to help"],
  },

  // ── Endurance Tests ──
  "Yo-Yo Intermittent L1": {
    what_it_measures: "Aerobic fitness and repeated sprint ability — the gold standard soccer fitness test.",
    instructions: [
      { step: "Set two cones 20 meters apart. You'll need the Yo-Yo audio track (available on YouTube)." },
      { step: "Run 20m when the beep sounds, then 20m back before the next beep." },
      { step: "After each out-and-back, you get 10 seconds of active recovery (jog 5m and back)." },
      { step: "The beeps get progressively faster. Keep going until you can't reach the line twice in a row." },
      { step: "Your score is the level and shuttle number when you stop." },
    ],
    scoring: "Level 19+ is elite. Level 16+ is good. Under Level 10 needs work.",
    affects: "Physical",
    common_mistakes: ["Starting too fast — pace yourself, the test gets harder quickly", "Not reaching the line before the beep — you must touch the line on every shuttle", "Turning too wide — pivot sharply at each end to save energy and time"],
  },
  "Yo-Yo Intermittent L2": {
    what_it_measures: "Higher-intensity version for advanced players — starts faster and increases speed more quickly.",
    instructions: [
      { step: "Set two cones 20 meters apart. Use the Yo-Yo IR2 audio track." },
      { step: "Run 20m out, 20m back when the beep sounds. 10 seconds active recovery between shuttles." },
      { step: "The L2 test starts at a higher speed than L1 and increases more rapidly." },
      { step: "Stop when you fail to reach the line twice in a row." },
      { step: "Record your final level. This is very challenging — give it everything." },
    ],
    scoring: "Level 22+ is elite. Level 19+ is good. Under Level 14 needs work.",
    affects: "Physical",
    common_mistakes: ["Underestimating the difficulty — this is much harder than L1", "Not using the recovery period effectively — stay moving, don't stop", "Giving up mentally too soon — push through the discomfort"],
  },

  // ── Flexibility ──
  "Sit & Reach": {
    what_it_measures: "Lower back and hamstring flexibility — helps prevent injuries and improves range of motion.",
    instructions: [
      { step: "Sit on the floor with legs straight out in front, feet flat against a box or wall." },
      { step: "Place a ruler or measuring tape between your legs, starting at your heels (0 mark)." },
      { step: "Slowly reach forward with both hands, one on top of the other, palms down." },
      { step: "Reach as far as possible without bouncing. Hold for 2 seconds at your furthest point." },
      { step: "Measure how many inches past (or before) your toes you reached. Best of 3." },
    ],
    scoring: "8+ inches past toes is excellent. 6+ is good. Under 2 needs work.",
    affects: "Physical",
    common_mistakes: ["Bouncing to reach further — use a slow, steady stretch only", "Bending knees to cheat — keep legs completely straight", "Not warming up first — do light jogging and dynamic stretches before testing"],
  },

  // ── Beep Test ──
  "Beep Test": {
    what_it_measures: "Aerobic capacity through progressive shuttle runs. Same concept as Yo-Yo but continuous running.",
    instructions: [
      { step: "Mark two lines 20 meters apart. Use the official beep test audio." },
      { step: "Run from one line to the other before each beep sounds." },
      { step: "The beeps get faster each level. Turn and run back on each beep." },
      { step: "If you fail to reach the line before the beep twice in a row, the test is complete." },
      { step: "Record your final level and shuttle number." },
    ],
    scoring: "Level 13+ is excellent. Level 10+ is good. Under Level 7 needs work.",
    affects: "Physical",
    common_mistakes: ["Turning too early (before the beep) — wait for the beep at each line", "Using too much energy on turns — pivot efficiently", "Starting at a sprint — the early levels are a warm-up pace"],
  },

  // ── GK Tests ──
  "Shot Handling": {
    what_it_measures: "Ability to catch and control shots from various angles and distances.",
    instructions: [
      { step: "Position yourself in goal. Have a partner or coach take 10 shots from 12-18 yards." },
      { step: "Shots should vary: low, medium height, to your left, to your right." },
      { step: "Focus on clean catches — no rebounds. Count a save if you hold the ball or parry it safely wide." },
      { step: "Your score = number of clean saves out of 10." },
      { step: "Repeat monthly to track improvement." },
    ],
    scoring: "9/10 is elite. 7/10 is good. Under 4/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Palming balls back into danger — push wide, not forward", "Not getting your body behind the ball — use the 'W' hand shape", "Closing eyes on impact — watch the ball all the way into your hands"],
  },
  "Distribution Accuracy": {
    what_it_measures: "How accurately you can distribute the ball to teammates — throws, rolls, and kicks.",
    instructions: [
      { step: "Set up 3 target zones: short (10 yards), medium (25 yards), long (40+ yards)." },
      { step: "Short: Roll the ball to a cone-sized target. 3 attempts." },
      { step: "Medium: Throw or side-volley to a larger target zone. 3 attempts." },
      { step: "Long: Punt or goal kick to a cone. 4 attempts." },
      { step: "Score 1 point for each target hit. Max 10." },
    ],
    scoring: "8/10 is elite. 7/10 is good. Under 3/10 needs work.",
    affects: "Passing",
    common_mistakes: ["Rushing — take your time on restarts", "Not following through on kicks — point your plant foot at the target", "Overthrowing short passes — a simple roll is often best"],
  },
  "Reaction Save Test": {
    what_it_measures: "Reflex speed and diving ability — how quickly you react to unexpected shots.",
    instructions: [
      { step: "Stand in the center of the goal. A partner stands 8-10 yards away with 10 balls." },
      { step: "The partner fires shots randomly to different corners without warning." },
      { step: "React and dive to save each shot. No time to think — pure reflexes." },
      { step: "Your score = saves out of 10." },
      { step: "Test both diving left and right." },
    ],
    scoring: "7/10 is elite. 5/10 is good. Under 2/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Guessing direction — wait and read the shooter's body", "Diving backward — always dive slightly forward to cut the angle", "Not using your feet for low shots — use the 'K' block save"],
  },
  "Cross Collection": {
    what_it_measures: "Aerial ability — catching or punching crosses under pressure.",
    instructions: [
      { step: "A server delivers 10 crosses from the wing into the 6-yard box." },
      { step: "Mix up the type: in-swinging, out-swinging, driven, floated." },
      { step: "Come off your line and claim or punch each cross." },
      { step: "Score = successful collections or clear punches out of 10." },
      { step: "If you can practice with attacking players challenging you, even better." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Physical",
    common_mistakes: ["Staying on your line — attack the ball at its highest point", "Taking off from one foot — jump off both feet for maximum height", "Not calling 'KEEPER!' — communicate loudly so defenders know you're coming"],
  },

  // ── CB Tests ──
  "Heading Accuracy": {
    what_it_measures: "Precision in directing headers — essential for clearances and set-piece goals.",
    instructions: [
      { step: "A partner serves 10 balls (throws or crosses) to you at head height in the box." },
      { step: "Head each ball toward a target: a cone, small goal, or marked zone." },
      { step: "Focus on making clean contact with your forehead and directing the ball." },
      { step: "Your score = headers that hit the target out of 10." },
    ],
    scoring: "8/10 is excellent. 7/10 is good. Under 4/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Closing eyes on contact — watch the ball onto your forehead", "Using the top of your head — use your forehead for control", "Not attacking the ball — jump to meet it, don't wait for it"],
  },
  "Standing Tackle Test": {
    what_it_measures: "Timing and technique of winning the ball cleanly without fouling.",
    instructions: [
      { step: "An attacker dribbles toward you at moderate pace." },
      { step: "Time your tackle to win the ball cleanly — no fouls." },
      { step: "A successful tackle = you win possession without fouling." },
      { step: "10 attempts. Score = clean tackles out of 10." },
      { step: "Alternate with different angles and dribbling speeds." },
    ],
    scoring: "9/10 is elite. 7/10 is good. Under 4/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Diving in too early — be patient and wait for the right moment", "Stabbing at the ball — use the side of your foot to block", "Not getting your body between the ball and attacker after winning it"],
  },
  "Long Passing Accuracy": {
    what_it_measures: "Ability to switch play and find teammates with long diagonal passes.",
    instructions: [
      { step: "Set up three target zones about 35-45 yards away: left, center, right." },
      { step: "From your position, hit long passes to each zone. 3 passes per zone (9 total)." },
      { step: "Ball must land in or within 2 yards of the target zone to count." },
      { step: "Bonus point if the ball is playable (not too high or bouncing awkwardly)." },
      { step: "Score = accurate passes out of 10 (9 + 1 bonus)." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Passing",
    common_mistakes: ["Leaning back on contact — keep your chest over the ball", "Not following through — your kicking foot should point at the target", "Trying to hit too hard — technique over power"],
  },
  "1v1 Defending": {
    what_it_measures: "Ability to stop an attacker in a 1v1 situation — the most important defensive skill.",
    instructions: [
      { step: "An attacker starts 20 yards from goal, you start 5 yards ahead." },
      { step: "The attacker tries to get past you and score within 8 seconds." },
      { step: "Your job: don't let them past. Force them wide or block their shot." },
      { step: "10 attempts. Score = successful stops out of 10." },
      { step: "Switch sides to work both left and right foot defending." },
    ],
    scoring: "8/10 is elite. 7/10 is good. Under 3/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Being too square — adopt a side-on stance to react quicker", "Getting too close — stay about arm's length to react to moves", "Watching the player's feet instead of the ball — the ball doesn't lie"],
  },

  // ── FB Tests ──
  "Crossing Accuracy": {
    what_it_measures: "Precision of crosses from wide areas — creating scoring chances for teammates.",
    instructions: [
      { step: "From a wide position (near the corner of the 18-yard box), cross 10 balls." },
      { step: "Target: the penalty spot area, near post area, and far post area (alternate)." },
      { step: "Cross should be at a catchable height and pace — not too hard or too floaty." },
      { step: "Your score = accurate crosses that hit the target zone out of 10." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Passing",
    common_mistakes: ["Hitting crosses too hard — pace should be firm but controllable", "Not looking up before crossing — see where teammates are", "Always crossing from the same spot — vary delivery points"],
  },
  "Slide Tackle Test": {
    what_it_measures: "Proper slide tackle technique — winning the ball on the ground without fouling.",
    instructions: [
      { step: "An attacker dribbles past you at pace on the wing." },
      { step: "Execute a slide tackle to dispossess them — must get the ball first." },
      { step: "A successful tackle = you win the ball cleanly. A foul = you miss the ball." },
      { step: "10 attempts. Score = clean tackles out of 10." },
    ],
    scoring: "7/10 is excellent. 5/10 is good. Use slide tackles sparingly in games.",
    affects: "Defending",
    common_mistakes: ["Sliding from too far away — you must be within reach of the ball", "Using the wrong foot — slide with the foot closest to the attacker", "Leaving your feet too early — stay on your feet as long as possible"],
  },
  "Overlap Sprint + Cross": {
    what_it_measures: "Combined speed and crossing ability after an attacking overlap run.",
    instructions: [
      { step: "Start 10 yards behind a 'winger' teammate (cone) near the halfway line." },
      { step: "Sprint past the winger (overlap) down the line toward the corner flag." },
      { step: "Receive a pass near the corner of the 18-yard box." },
      { step: "Take one touch to control, then cross to the target zone." },
      { step: "Time from start to ball reaching the target zone. 3 attempts." },
    ],
    scoring: "Under 9.5s is elite. Under 12s is good. Over 14s needs work.",
    affects: "Pace",
    common_mistakes: ["Not communicating the overlap — call for the ball", "Poor first touch receiving the pass — set yourself up for the cross", "Crossing without looking — glance up to see the target zone"],
  },

  // ── DM Tests ──
  "Passing Accuracy Circuit": {
    what_it_measures: "Passing precision under pressure — the core skill for a midfielder.",
    instructions: [
      { step: "Set up 5 target cones/mannequins at varying distances: 5, 10, 15, 20, 25 yards." },
      { step: "Pass to each target in order 4 times (20 total passes)." },
      { step: "Must use both feet — alternate every 5 passes." },
      { step: "Ball must hit or pass within 1 yard of the target to count." },
      { step: "Score = accurate passes out of 20." },
    ],
    scoring: "18/20 is elite. 16/20 is good. Under 10/20 needs work.",
    affects: "Passing",
    common_mistakes: ["Rushing between passes — accuracy over speed", "Not using the inside of your foot — most accurate surface for passing", "Standing too flat — open your body to see the target"],
  },
  "Interception Reading": {
    what_it_measures: "Ability to read the game and cut out passes before they reach the target.",
    instructions: [
      { step: "Two players stand about 15 yards apart passing to each other." },
      { step: "You position yourself between them and try to intercept the pass." },
      { step: "Start 5 yards from the passing lane. Read the passer's body language." },
      { step: "10 attempts from different angles. Score = interceptions out of 10." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Tactical",
    common_mistakes: ["Guessing instead of reading — watch the passer's hips and plant foot", "Going too early — the passer hasn't committed yet", "Not adjusting position between attempts — always anticipate the next pass"],
  },
  "Tackle & Turn": {
    what_it_measures: "Winning the ball and transitioning to attack in one motion — the complete defensive midfielder skill.",
    instructions: [
      { step: "An opponent has the ball 5 yards away. You approach and tackle." },
      { step: "After winning the ball, immediately turn and play a forward pass to a target." },
      { step: "The whole sequence should take under 3 seconds." },
      { step: "10 attempts. Score based on clean tackle + accurate forward pass out of 10." },
    ],
    scoring: "8/10 is elite. 7/10 is good. Under 4/10 needs work.",
    affects: "Defending",
    common_mistakes: ["Tackling but not securing the ball — win it AND control it", "Turning the wrong way — shield the ball then turn away from pressure", "Looking down after winning the ball — head up to find the pass"],
  },
  "Ball Shielding": {
    what_it_measures: "Using your body to protect the ball under pressure — key for holding up play.",
    instructions: [
      { step: "Receive a pass with a defender right behind you." },
      { step: "Use your body to shield the ball. Keep it on the foot furthest from the defender." },
      { step: "Hold for as long as possible — the defender tries to win the ball." },
      { step: "Time how many seconds you can keep possession. 5 attempts." },
    ],
    scoring: "20+ seconds is elite. 15+ is good. Under 5 needs work.",
    affects: "Physical",
    common_mistakes: ["Standing too upright — get low with a wide base for stability", "Letting the defender reach around — keep your arm out as a feeler", "Not moving the ball — use the sole of your foot to roll the ball away"],
  },

  // ── CM Tests ──
  "Vision Test (through balls)": {
    what_it_measures: "Ability to see and execute splitting passes that break defensive lines.",
    instructions: [
      { step: "Set up 2 mannequins/cones as a 'defensive line' about 10 yards apart." },
      { step: "A runner makes a diagonal run behind the line." },
      { step: "From 15-20 yards away, you play a through ball to the runner." },
      { step: "Ball must pass between the mannequins and arrive in the runner's path." },
      { step: "10 attempts with different run angles. Score = successful through balls." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Tactical",
    common_mistakes: ["Playing the pass too early — wait for the runner to start their move", "Weight of pass too heavy — the ball should be playable for the runner", "Not disguising the pass — use your eyes and body to deceive defenders"],
  },
  "Dribble + Pass Combo": {
    what_it_measures: "Combined skill of dribbling through traffic and delivering an accurate pass under fatigue.",
    instructions: [
      { step: "Set up 5-6 cones in a zigzag pattern over 15 yards." },
      { step: "Dribble through the cones at speed using both feet." },
      { step: "At the end, play a pass to a target zone 15 yards away." },
      { step: "Time the entire sequence. Must complete the pass accurately for the time to count." },
      { step: "3 attempts — take your best time." },
    ],
    scoring: "Under 11s is elite. Under 13s is good. Over 18s needs work.",
    affects: "Dribbling",
    common_mistakes: ["Looking down at the ball while dribbling — glance up every 2-3 touches", "Going too fast through the cones — controlled speed with close touches", "Rushing the final pass — steady yourself before delivering"],
  },
  "Long Shot Accuracy": {
    what_it_measures: "Striking ability from distance — the threat that keeps goalkeepers honest.",
    instructions: [
      { step: "Place balls at the edge of the 18-yard box (18-25 yards from goal)." },
      { step: "Shoot 10 times — 5 with your strong foot, 5 with your weak foot." },
      { step: "Aim for the corners. The goal is divided into 4 scoring zones (top/bottom x left/right)." },
      { step: "Score 1 point for on-target, 2 points for hitting a corner zone. Max 20." },
      { step: "Convert to /10 for the standard score." },
    ],
    scoring: "7/10 is elite (14+ points). 5/10 is good. Under 2/10 needs work.",
    affects: "Shooting",
    common_mistakes: ["Leaning back — get your chest over the ball for power and accuracy", "Not planting your standing foot correctly — point it at the target", "Trying to smash every shot — sometimes placement beats power"],
  },

  // ── AM Tests ──
  "Creative Passing Test": {
    what_it_measures: "Creativity in the final third — unlocking defenses with clever passes.",
    instructions: [
      { step: "Set up a 'defensive line' of 3 mannequins/cones across the field." },
      { step: "Two teammates make runs behind the line in different directions." },
      { step: "You must pick the best pass — over the top, through the gap, or into feet." },
      { step: "10 different scenarios. Score based on choosing the right pass + executing it." },
    ],
    scoring: "8/10 is elite. 7/10 is good. Under 3/10 needs work.",
    affects: "Passing",
    common_mistakes: ["Always choosing the same pass — mix it up to be unpredictable", "Ignoring the simple option — sometimes a short pass is the best pass", "Not reading the defender's position — exploit the gaps"],
  },
  "Shot Accuracy (18yd box)": {
    what_it_measures: "Finishing from the most common scoring zone — the edge of the penalty area.",
    instructions: [
      { step: "Place balls around the 18-yard line. 10 shots from different angles." },
      { step: "Target 4 corners of the goal with a partner or GK in goal." },
      { step: "Score 1 for on target, 2 for goal. Max score = 20 (convert to /10)." },
      { step: "Alternate feet and shot types: driven, curled, chipped." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Shooting",
    common_mistakes: ["Always shooting to the same corner — be unpredictable", "Taking too many touches to set up — one-touch shooting is valuable", "Head down through the shot — watch the ball, not the goal"],
  },
  "Dribble Through Cones": {
    what_it_measures: "Close control dribbling at pace through tight spaces.",
    instructions: [
      { step: "Set 8 cones in a straight line, 1 yard apart." },
      { step: "Dribble through the cones weaving in and out as fast as possible." },
      { step: "Must use both feet. Time from crossing the first cone to crossing the last." },
      { step: "If you miss a cone or knock one over, that attempt doesn't count." },
      { step: "3 attempts — take your best time." },
    ],
    scoring: "Under 10s is elite. Under 13.5s is good. Over 16s needs work.",
    affects: "Dribbling",
    common_mistakes: ["Using only one foot — force yourself to use both", "Kicking the ball too far ahead — keep it within one step", "Standing too upright — stay low for quick changes of direction"],
  },
  "Through Ball Accuracy": {
    what_it_measures: "Playing the killer pass — splitting the defense for a striker to run onto.",
    instructions: [
      { step: "A striker makes runs from 20 yards out toward goal." },
      { step: "From 25 yards away, play a through ball that the striker can run onto." },
      { step: "Pass must beat a 'defensive line' of 2 mannequins and arrive in the striker's path." },
      { step: "10 attempts with different run timings. Score = successful through balls." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Tactical",
    common_mistakes: ["Playing the pass to where the striker IS, not where they WILL be", "Pass too slow — defenders will intercept", "Not using the outside of your foot for disguise — adds unpredictability"],
  },

  // ── Winger Tests ──
  "Speed Dribble Test": {
    what_it_measures: "Dribbling at top speed while maintaining control — the winger's trademark.",
    instructions: [
      { step: "Mark a 30-yard straight course with cones at 0, 10, 20, and 30 yards." },
      { step: "Dribble the full 30 yards as fast as possible while keeping the ball close." },
      { step: "Ball must stay within 1 yard of your feet at all times." },
      { step: "Time from first touch to crossing the 30-yard line. 3 attempts." },
    ],
    scoring: "Under 9s is elite. Under 10.5s is good. Over 14s needs work.",
    affects: "Dribbling",
    common_mistakes: ["Pushing the ball too far ahead — you lose control at speed", "Looking down the whole time — glance up every 5 yards", "Running in a straight line with the ball — use your laces for speed dribbles"],
  },
  "Cut Inside + Finish": {
    what_it_measures: "The modern winger's key weapon — cutting inside from wide and shooting.",
    instructions: [
      { step: "Start wide on the touchline, 25 yards from goal." },
      { step: "Dribble toward the corner of the 18-yard box." },
      { step: "Cut inside with a sharp change of direction, then shoot at the far post." },
      { step: "10 attempts alternating which foot you finish with." },
      { step: "Score based on shots on target / goals." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Shooting",
    common_mistakes: ["Cutting inside too early — get closer to the box first", "Taking too many touches after cutting — 1-2 touches then shoot", "Always going the same direction — be able to go both outside and inside"],
  },
  "Recovery Run Test": {
    what_it_measures: "Speed of defensive recovery — tracking back after losing possession.",
    instructions: [
      { step: "Start at the attacking corner flag." },
      { step: "On the whistle, sprint back to your own defensive corner flag (diagonal run)." },
      { step: "This is approximately 100 yards diagonal across the field." },
      { step: "Record your time. 3 attempts with 3 minutes rest between." },
    ],
    scoring: "Under 8.5s is elite. Under 10.5s is good. Over 12s needs work.",
    affects: "Pace",
    common_mistakes: ["Jogging the first few yards — sprint immediately, this simulates a turnover", "Looking behind you — focus on running forward at full speed", "Not using your arms — pump them hard to drive your legs"],
  },

  // ── Striker Tests ──
  "Finishing Accuracy": {
    what_it_measures: "Pure finishing ability — putting the ball where the goalkeeper can't reach it.",
    instructions: [
      { step: "Place balls at the edge of the 18-yard box. 10 shots with a GK in goal." },
      { step: "Aim for the corners. Each goal scored = 1 point." },
      { step: "Mix up: 3 driven shots, 3 placed shots, 2 chips, 2 volleys." },
      { step: "Score = goals out of 10." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Shooting",
    common_mistakes: ["Always shooting to the same spot — the keeper will learn your pattern", "Not varying power — mix hard shots with placed finishes", "Looking at the keeper instead of the gap — aim for spaces, not the goalkeeper"],
  },
  "Heading at Goal": {
    what_it_measures: "Attacking headers — converting crosses into goals.",
    instructions: [
      { step: "A server delivers 10 crosses from the wing." },
      { step: "Attack the ball in the air and head toward goal." },
      { step: "Focus on directing the header down toward the corners." },
      { step: "Score = goals or shots on target out of 10." },
    ],
    scoring: "7/10 is elite. 5/10 is good. Under 2/10 needs work.",
    affects: "Shooting",
    common_mistakes: ["Letting the ball hit you — attack the ball with your forehead", "Closing your eyes — keep them open and watch the ball", "Heading straight at the keeper — aim for the corners, and head DOWN"],
  },
  "1v1 Finishing": {
    what_it_measures: "Composure in front of goal — beating the keeper one-on-one.",
    instructions: [
      { step: "Start 25 yards from goal. Dribble toward a GK who comes off their line." },
      { step: "You have 5 seconds from first touch to get a shot off." },
      { step: "Use feints, changes of pace, or early shots to beat the keeper." },
      { step: "10 attempts. Score = goals out of 10." },
    ],
    scoring: "6/10 is elite (keepers are hard to beat!). 5/10 is good. Under 2/10 needs work.",
    affects: "Dribbling",
    common_mistakes: ["Making your decision too early — read the keeper's movement", "Getting too close to the keeper — shoot before they can smother", "Looking at the keeper instead of the goal — pick your spot early"],
  },
  "Off-Ball Movement": {
    what_it_measures: "Intelligent movement without the ball — creating space and losing your marker.",
    instructions: [
      { step: "A defender marks you tightly in the final third." },
      { step: "Using movement — check away, check in, curved runs, double movements — create separation." },
      { step: "A server passes when you create 2+ yards of space." },
      { step: "After receiving, you have 3 seconds to get a shot off." },
      { step: "10 attempts. Score based on successful separation + shots on target." },
    ],
    scoring: "8/10 is elite. 6/10 is good. Under 3/10 needs work.",
    affects: "Tactical",
    common_mistakes: ["Running in straight lines — curved runs are harder to track", "Standing still waiting for the ball — constant movement keeps defenders guessing", "Only checking to the ball — sometimes check away first to create space"],
  },
};