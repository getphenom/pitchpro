import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Dumbbell, UtensilsCrossed, Brain, Zap, ArrowLeft, Trophy } from "lucide-react";
import PostWorkoutNutritionReminder from "@/components/home/PostWorkoutNutritionReminder";
import QuickLogWidget from "@/components/shared/QuickLogWidget";

const NAV_ITEMS = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/train", icon: Dumbbell, label: "Train" },
  { path: "/nutrition", icon: UtensilsCrossed, label: "Fuel" },
  { path: "/mental", icon: Brain, label: "Mind" },
  { path: "/player", icon: Zap, label: "Player" },
];

export default function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isRoot = location.pathname === "/";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PostWorkoutNutritionReminder />

      {/* Persistent top header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border safe-area-top">
        <div className="flex items-center h-12 px-4 max-w-2xl mx-auto w-full">
          {!isRoot && (
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-medium">Back</span>
            </button>
          )}
          {isRoot && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <span className="font-heading font-bold text-sm tracking-wide">SoccerPro</span>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 pb-20 md:pb-0 md:pl-20">
        <Outlet />
      </div>

      <QuickLogWidget />

      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-card border-r border-border flex-col items-center py-6 gap-2 z-50">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary" />
          </div>
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200 group w-16
                ${isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}
            >
              <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-primary" : ""}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border shadow-[0_-4px_20px_rgba(0,0,0,0.5)] flex justify-around items-center py-3 px-2 z-50 safe-area-bottom" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom, 0px))" }}>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[3.5rem]
                ${isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "text-primary drop-shadow-[0_0_6px_hsl(142_71%_45%/0.5)]" : ""}`} />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-px shadow-[0_0_6px_hsl(142_71%_45%/0.6)]" />}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}