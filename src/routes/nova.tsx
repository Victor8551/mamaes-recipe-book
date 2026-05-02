import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { RecipeForm } from "@/components/RecipeForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/nova")({ component: Nova });

function Nova() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto p-16 flex justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-10 text-center">
        <Button asChild><Link to="/auth">Entrar</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10 animate-fade-in">
      <h1 className="font-display text-3xl mb-6">Nova receita</h1>
      <RecipeForm />
    </div>
  );
}
