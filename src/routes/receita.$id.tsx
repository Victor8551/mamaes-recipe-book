import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Clock, Heart, Pencil, Share2, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORY_EMOJI } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/receita/$id")({ component: Detail });

function Detail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<Tables<"recipes"> | null>(null);

  useEffect(() => {
    supabase.from("recipes").select("*").eq("id", id).maybeSingle().then(({ data }) => setRecipe(data));
  }, [id]);

  async function toggleFav() {
    if (!recipe) return;
    const next = !recipe.is_favorite;
    setRecipe({ ...recipe, is_favorite: next });
    await supabase.from("recipes").update({ is_favorite: next }).eq("id", recipe.id);
  }

  async function remove() {
    if (!recipe) return;
    const { error } = await supabase.from("recipes").delete().eq("id", recipe.id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Receita excluída");
    navigate({ to: "/" });
  }

  function share() {
    if (!recipe) return;
    const text = `${recipe.name}\n\nIngredientes:\n${recipe.ingredients}\n\nModo de preparo:\n${recipe.instructions}`;
    if (navigator.share) navigator.share({ title: recipe.name, text }).catch(() => {});
    else { navigator.clipboard.writeText(text); toast.success("Receita copiada!"); }
  }

  if (!recipe) return <div className="container mx-auto p-10 text-center text-muted-foreground">Carregando...</div>;

  return (
    <article className="animate-fade-in">
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-8xl" style={{ background: "var(--gradient-warm)" }}>
            {CATEGORY_EMOJI[recipe.category] ?? "🍽️"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <Button asChild variant="secondary" size="sm" className="absolute top-4 left-4 rounded-full">
          <Link to="/"><ArrowLeft className="size-4" /> Voltar</Link>
        </Button>
      </div>

      <div className="container mx-auto max-w-3xl px-4 -mt-20 relative">
        <div className="rounded-3xl border bg-card p-6 md:p-8 shadow-xl">
          <span className="text-xs rounded-full bg-secondary px-3 py-1">
            {CATEGORY_EMOJI[recipe.category]} {recipe.category}
          </span>
          <h1 className="mt-3 font-display text-3xl md:text-4xl">{recipe.name}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {recipe.prep_time ? <span className="flex items-center gap-1.5"><Clock className="size-4" /> {recipe.prep_time} min</span> : null}
            {recipe.servings ? <span className="flex items-center gap-1.5"><Users className="size-4" /> {recipe.servings} porções</span> : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={toggleFav} variant={recipe.is_favorite ? "default" : "secondary"} className="rounded-full">
              <Heart className={`size-4 ${recipe.is_favorite ? "fill-current" : ""}`} /> {recipe.is_favorite ? "Favoritada" : "Favoritar"}
            </Button>
            <Button onClick={share} variant="secondary" className="rounded-full"><Share2 className="size-4" /> Compartilhar</Button>
            <Button asChild variant="secondary" className="rounded-full">
              <Link to="/editar/$id" params={{ id: recipe.id }}><Pencil className="size-4" /> Editar</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" className="rounded-full text-destructive hover:text-destructive"><Trash2 className="size-4" /> Excluir</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir esta receita?</AlertDialogTitle>
                  <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={remove}>Excluir</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Section title="Ingredientes" body={recipe.ingredients} />
          <Section title="Modo de preparo" body={recipe.instructions} />
          {recipe.notes && <Section title="Observações" body={recipe.notes} />}

          <p className="mt-8 text-xs text-muted-foreground">
            Criada em {new Date(recipe.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl mb-2">{title}</h2>
      <div className="whitespace-pre-wrap leading-relaxed text-foreground/90">{body || <span className="text-muted-foreground">—</span>}</div>
    </section>
  );
}
