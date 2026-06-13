import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Loader2 } from "lucide-react";
import PlayerAssessment from "@/components/assessment/PlayerAssessment";

export default function Assessment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => base44.entities.PlayerProfile.list(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const profile = profiles?.[0];
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <PlayerAssessment
          profile={profile}
          onComplete={() => {
            queryClient.invalidateQueries({ queryKey: ["profiles"] });
            navigate("/");
          }}
        />
      </div>
    </div>
  );
}