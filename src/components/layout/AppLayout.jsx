import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Zap, Droplets, Brain, User, Sparkles } from "lucide-react";
import PostWorkoutNutritionReminder from "@/components/home/PostWorkoutNutritionReminder";
import QuickLogWidget from "@/components/shared/QuickLogWidget";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/train", icon: Zap, label: "Train", color: "hover:text-[#C6FF3A] group-hover:text-[#C6FF3A]" },
  { path: "/fuel", icon: Droplets, label: "Fuel", color: "hover:text-[#FFA23D] group-hover:text-[#FFA23D]" },
  { path: "/mind-hub", icon: Brain, label: "Mind", color: "hover:text-[#B79BFF] group-hover:text-[#B79BFF]" },
  { path: "/you", icon: User, label: "You", color: "hover:text-[#C6FF3A] group-hover:text-[#C6FF3A]" },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === "/";

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col">
      <PostWorkoutNutritionReminder />

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-[#0A0A0C]/80 backdrop-blur-md border-b border-white/[0.08] safe-area-top">
        <div className="flex items-center justify-between h-12 px-4 max-w-2xl mx-auto w-full">
          {!isRoot ? (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-[#8A8C92] hover:text-[#F4F5F2] transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              <span className="text-xs font-medium">Back</span>
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[34px] grid place-items-center bg-gradient-to-b from-[#d9dde0] to-[#7d8186]"
                style={{ clipPath: "polygon(50% 0, 100% 18%, 100% 70%, 50% 100%, 0 70%, 0 18%)" }}>
                <span className="font-heading font-black text-[16px] text-[#15151a] -skew-x-6">P</span>
              </div>
              <span className="font-heading font-extrabold text-sm tracking-[0.14em]">
                PHEN<span className="text-[#C6FF3A]">O</span>M
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-[#C6FF3A] bg-[#C6FF3A]/10 border border-[#C6FF3A]/25 px-2.5 py-1.5 rounded-full">
            <span>🔥</span> 6
          </div>
        </div>
      </header>

      <div className="flex-1 pb-24 md:pb-0 md:pl-20">
        <Outlet />
      </div>

      <QuickLogWidget />

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-[#101014] border-r border-white/[0.08] flex-col items-center py-6 gap-2 z-50">
        <div className="mb-6">
          <div className="w-[30px] h-[34px] grid place-items-center bg-gradient-to-b from-[#d9dde0] to-[#7d8186]"
            style={{ clipPath: "polygon(50% 0, 100% 18%, 100% 70%, 50% 100%, 0 70%, 0 18%)" }}>
            <span className="font-heading font-black text-[15px] text-[#15151a] -skew-x-6">P</span>
          </div>
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 w-16
                ${active ? "bg-[#C6FF3A]/10 text-[#C6FF3A]" : "text-[#5E6066] hover:text-[#F4F5F2] hover:bg-white/[0.05]"}`}
            >
              <item.icon className={`w-5 h-5 transition-transform hover:scale-110 ${active ? "text-[#C6FF3A] drop-shadow-[0_0_6px_rgba(198,255,58,.5)]" : ""}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#101014]/[0.92] backdrop-blur-[14px] border-t border-white/[0.08] flex justify-around items-center py-2 px-1.5 z-50 safe-area-bottom"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))" }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1.5 flex-1 rounded-lg transition-all duration-200
                ${active ? "text-[#C6FF3A]" : "text-[#5E6066] hover:text-[#F4F5F2]"}`}
            >
              <item.icon className={`w-[23px] h-[23px] ${active ? "drop-shadow-[0_0_6px_rgba(198,255,58,.5)]" : ""}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {active && <div className="w-1.5 h-1.5 rounded-full bg-[#C6FF3A] mt-px shadow-[0_0_6px_rgba(198,255,58,.6)]" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}