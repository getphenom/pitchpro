import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Target, TrendingUp, Trophy, Settings, ChevronRight, Shield } from "lucide-react";
import { motion } from "framer-motion";
import FifaPlayerCard from "@/components/profile/FifaPlayerCard";
import IdpSkillChart from "@/components/home/IdpSkillChart";
import { STAT_COLORS, getLevel, LEVEL_TITLES, POSITION_LABELS } from "@/lib/gameData";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";

const STAT_NAMES = ["pace", "shooting", "passing", "dribbling", "defending", "physical", "mental", "tactical"];
const STAT_LABELS = { pace: "PAC", shooting: "SHO", passing: "PAS", dribbling: "DRI", defending: "DEF", physical: "PHY", mental: "MEN", tactical: "TAC" };

export default function You() {
  const navigate = useNavigate();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });
  const profile = profiles?.[0];

  const { data: badges = [] } = useQuery({
    queryKey: ["badges", profile?.id],
    queryFn: async () => {
      if (!profile?.badges?.length) return [];
      const { getBadgeById } = await import("@/lib/categoryProgression");
      return profile.badges.map(id => getBadgeById(id)).filter(Boolean);
    },
    enabled: !!profile,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C6FF3A]" /></div>;
  if (!profile) return null;

  const level = getLevel(profile.xp || 0);
  const title = LEVEL_TITLES[level - 1] || "Legend";

  const radarData = STAT_NAMES.map(s => ({ stat: STAT_LABELS[s], value: profile.stats?.[s] || 50, fullMark: 100 }));

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <div>
          <p className="font-heading font-semibold tracking-[0.22em] text-[10px] uppercase text-[#8A8C92]">Your Card</p>
          <h1 className="text-2xl font-heading font-extrabold mt-0.5">You</h1>
        </div>

        {/* FIFA Card */}
        <div className="rounded-[20px] bg-gradient-to-br from-[#1e1f26] to-[#101015] border border-white/[0.08] p-5 relative overflow-hidden">
          <div className="absolute -top-[40%] -right-[30%] w-[80%] h-[120%] bg-[radial-gradient(circle,rgba(198,255,58,.14),transparent_60%)]" />
          <div className="relative z-10 flex items-start justify-between">
            <div>
              <p className="font-heading font-black text-[40px] text-[#C6FF3A] leading-none">{profile.stats ? Math.round(Object.values(profile.stats).reduce((a, b) => a + b, 0) / 8) : 50}</p>
              <p className="font-heading font-bold text-[13px] tracking-[0.1em] mt-1">{POSITION_LABELS[profile.position]?.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-[11px] tracking-wider">LVL {level}</p>
              <p className="text-[11px] text-[#8A8C92] mt-1">{title}</p>
            </div>
          </div>
          <div className="relative z-10 mt-3 flex justify-center">
            <ResponsiveContainer width={220} height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.08)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#8A8C92", fontSize: 8, fontFamily: "Orbitron" }} />
                <Radar name="Stats" dataKey="value" stroke="#C6FF3A" fill="rgba(198,255,58,0.22)" fillOpacity={0.22} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* XP info */}
        <div className="rounded-xl bg-[#141419] border border-white/[0.08] p-4">
          <p className="font-heading font-bold text-xs tracking-wider text-[#C6FF3A]">XP · Level {level}</p>
          <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden mt-2 border border-white/[0.08]">
            <div className="h-full bg-gradient-to-r from-[#C6FF3A] to-[#9be018] rounded-full" style={{ width: `${((profile.xp || 0) % 250) / 250 * 100}%` }} />
          </div>
          <p className="text-[11px] text-[#8A8C92] mt-1">{profile.xp || 0} XP</p>
        </div>

        {/* Links */}
        <div className="space-y-2">
          <Link to="/development" className="flex items-center gap-3 p-4 rounded-xl bg-[#141419] border border-white/[0.08] hover:border-[#C6FF3A]/30 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#C6FF3A]/10 flex items-center justify-center"><Target className="w-4 h-4 text-[#C6FF3A]" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">IDP & Assessment</p>
              <p className="text-[11px] text-[#8A8C92]">5-pillar self-assessment · your roadmap</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E6066]" />
          </Link>

          <Link to="/insights" className="flex items-center gap-3 p-4 rounded-xl bg-[#141419] border border-white/[0.08] hover:border-[#C6FF3A]/30 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#C6FF3A]/10 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-[#C6FF3A]" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Progress & Trends</p>
              <p className="text-[11px] text-[#8A8C92]">Stats vs. target over time</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E6066]" />
          </Link>

          <Link to="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-[#141419] border border-white/[0.08] hover:border-[#C6FF3A]/30 transition-all">
            <div className="w-9 h-9 rounded-lg bg-[#C6FF3A]/10 flex items-center justify-center"><Trophy className="w-4 h-4 text-[#C6FF3A]" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Trophies</p>
              <p className="text-[11px] text-[#8A8C92]">{badges.length > 0 ? `${badges.length} earned` : "Start earning badges"}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E6066]" />
          </Link>

          <Link to="/profile" className="flex items-center gap-3 p-4 rounded-xl bg-[#141419] border border-white/[0.08] hover:border-[#C6FF3A]/30 transition-all">
            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center"><Settings className="w-4 h-4 text-[#8A8C92]" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Settings</p>
              <p className="text-[11px] text-[#8A8C92]">Profile · notifications · account</p>
            </div>
            <ChevronRight className="w-4 h-4 text-[#5E6066]" />
          </Link>
        </div>

        {/* IDP Skill Chart */}
        <IdpSkillChart profile={profile} />
      </div>
    </div>
  );
}