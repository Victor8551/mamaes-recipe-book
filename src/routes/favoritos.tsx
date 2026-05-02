import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { RecipeCard } from "@/components/RecipeCard";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/favoritos")({ component: Favoritos });

function Favoritos() {
  const { user } = useAuth();
  const [list, setList] = useState<Tables<"recipes">[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("recipes").select("*").eq("is_favorite", true).order("name").then(({ data }) => setList(data ?? []));
  }, [user]);

  if (!user) return <div className="container mx-auto p-10 text-center"><Button asChild><Link to="/auth">Entrar</Link></Button></div>;

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <Heart className="size-6 text-primary fill-current" />
        <h1 className="font-display text-3xl">Favoritas</h1>
      </div>
      {list.length === 0 ? (
        <div className="rounded-3xl border bg-card p-10 text-center text-muted-foreground">Nenhuma receita favoritada ainda.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {list.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
