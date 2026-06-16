import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClientInstance } from "@/lib/query-client";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import PageNotFound from "./lib/PageNotFound";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import UserNotRegisteredError from "@/components/UserNotRegisteredError";
import ProtectedRoute from "@/components/ProtectedRoute";

import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

import AppLayout from "@/components/layout/AppLayout";
import Home from "@/pages/Home";
import Train from "@/pages/Train";
import Training from "@/pages/Training";
import Nutrition from "@/pages/Nutrition";
import Mental from "@/pages/Mental";
import Tactics from "@/pages/Tactics";
import Tasks from "@/pages/Tasks";
import Profile from "@/pages/Profile";
import Player from "@/pages/Player";
import Injury from "@/pages/Injury";
import Development from "@/pages/Development";
import Recovery from "@/pages/Recovery";
import MonthlySummary from "@/pages/MonthlySummary";
import CalendarPage from "@/pages/Calendar";
import Insights from "@/pages/Insights";
import Onboarding from "@/pages/Onboarding";
import Assessment from "@/pages/Assessment";
import Fuel from "@/pages/Fuel";
import MindHub from "@/pages/MindHub";
import You from "@/pages/You";

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground font-body">Loading...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === "user_not_registered") {
      return <UserNotRegisteredError />;
    } else if (authError.type === "auth_required") {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/train" element={<Train />} />
          <Route path="/training" element={<Navigate to="/train" replace />} />
          <Route path="/nutrition" element={<Navigate to="/fuel" replace />} />
          <Route path="/mental" element={<Navigate to="/mind-hub" replace />} />
          <Route path="/player" element={<Navigate to="/you" replace />} />
          <Route path="/tactics" element={<Tactics />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/injury" element={<Injury />} />
          <Route path="/development" element={<Development />} />
          <Route path="/recovery" element={<Recovery />} />
          <Route path="/monthly" element={<MonthlySummary />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/mind-hub" element={<MindHub />} />
          <Route path="/you" element={<You />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;