import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { RecipeForm } from "@/components/RecipeForm";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/editar/$id")({ component: Editar });

function Editar() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Tables<"recipes"> | null>(null);
  useEffect(() => {
    supabase.from("recipes").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      if (!data) navigate({ to: "/" }); else setRecipe(data);
    });
  }, [id, navigate]);
  if (!recipe) return <div className="container mx-auto p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;
  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-3xl mb-6">Editar receita</h1>
      <RecipeForm initial={recipe} />
    </div>
  );
}
