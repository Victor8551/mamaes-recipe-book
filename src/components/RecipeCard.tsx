import { Link } from "@tanstack/react-router";
import { Clock, Heart, Users } from "lucide-react";
import { CATEGORY_EMOJI } from "@/lib/categories";
import type { Tables } from "@/integrations/supabase/types";

export function RecipeCard({ recipe }: { recipe: Tables<"recipes"> }) {
  return (
    <Link
      to="/receita/$id"
      params={{ id: recipe.id }}
      className="group block overflow-hidden rounded-3xl border bg-card hover-lift animate-fade-in"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl" style={{ background: "var(--gradient-soft)" }}>
            {CATEGORY_EMOJI[recipe.category] ?? "🍽️"}
          </div>
        )}
        {recipe.is_favorite && (
          <span className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-background/85 text-primary backdrop-blur">
            <Heart className="size-4 fill-current" />
          </span>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur">
          {CATEGORY_EMOJI[recipe.category]} {recipe.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold leading-tight line-clamp-1">{recipe.name}</h3>
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          {recipe.prep_time ? <span className="flex items-center gap-1"><Clock className="size-3.5" /> {recipe.prep_time} min</span> : null}
          {recipe.servings ? <span className="flex items-center gap-1"><Users className="size-3.5" /> {recipe.servings} porções</span> : null}
        </div>
      </div>
    </Link>
  );
}
