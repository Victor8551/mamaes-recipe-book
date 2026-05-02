import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Heart, Search, Sparkles, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/categories";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RecipeCard } from "@/components/RecipeCard";
import type { Tables } from "@/integrations/supabase/types";
import heroImg from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user, loading } = useAuth();
  const [recipes, setRecipes] = useState<Tables<"recipes">[]>([]);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("Todas");
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user) { setRecipes([]); return; }
    setFetching(true);
    supabase.from("recipes").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setRecipes(data ?? []); setFetching(false);
    });
  }, [user]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return recipes.filter((r) => {
      if (cat !== "Todas" && r.category !== cat) return false;
      if (!q) return true;
      return r.name.toLowerCase().includes(q)
        || r.ingredients.toLowerCase().includes(q)
        || r.category.toLowerCase().includes(q);
    });
  }, [recipes, query, cat]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-soft)" }} />
        <img src={heroImg} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40" width={1536} height={896} />
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="size-3.5 text-primary" /> Feito com carinho
            </span>
            <h1 className="mt-4 font-display text-4xl md:text-6xl font-semibold leading-tight tracking-tight">
              Receitas da Mamãe
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground">
              Guarde, organize e compartilhe os sabores que aquecem o coração da sua família.
            </p>
            {!user && !loading && (
              <div className="mt-6 flex gap-3">
                <Button asChild size="lg" className="rounded-full"><Link to="/auth">Começar agora</Link></Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10">
        {!user ? (
          <EmptyAuth />
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-6">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nome, ingrediente, categoria..." className="pl-9 rounded-full h-11" />
              </div>
              <Button asChild variant="ghost" className="md:ml-2"><Link to="/favoritos"><Heart className="size-4" /> Favoritas</Link></Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              <CategoryChip label="Todas" active={cat === "Todas"} onClick={() => setCat("Todas")} emoji="✨" />
              {CATEGORIES.map((c) => (
                <CategoryChip key={c} label={c} active={cat === c} onClick={() => setCat(c)} emoji={CATEGORY_EMOJI[c]} />
              ))}
            </div>

            {fetching ? (
              <p className="text-muted-foreground">Carregando...</p>
            ) : filtered.length === 0 ? (
              <EmptyRecipes hasAny={recipes.length > 0} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((r) => <RecipeCard key={r.id} recipe={r} />)}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function CategoryChip({ label, active, onClick, emoji }: { label: string; active: boolean; onClick: () => void; emoji: string }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-4 py-1.5 text-sm transition ${active ? "bg-primary text-primary-foreground border-primary shadow-sm" : "bg-secondary hover:bg-accent"}`}>
      <span className="mr-1">{emoji}</span>{label}
    </button>
  );
}

function EmptyAuth() {
  return (
    <div className="rounded-3xl border bg-card p-10 text-center" style={{ background: "var(--gradient-warm)" }}>
      <BookOpen className="mx-auto size-10 text-primary" />
      <h2 className="mt-3 font-display text-2xl">Crie sua conta para começar</h2>
      <p className="mt-2 text-muted-foreground">Suas receitas ficam salvas com segurança e sincronizadas em todos os dispositivos.</p>
      <Button asChild className="mt-5 rounded-full"><Link to="/auth">Entrar / Cadastrar</Link></Button>
    </div>
  );
}

function EmptyRecipes({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="rounded-3xl border bg-card p-10 text-center">
      <span className="text-5xl">🍰</span>
      <h2 className="mt-3 font-display text-2xl">{hasAny ? "Nada por aqui" : "Sua primeira receita está esperando!"}</h2>
      <p className="mt-2 text-muted-foreground">{hasAny ? "Tente outra categoria ou termo de busca." : "Adicione bolos, doces e segredos da família."}</p>
      {!hasAny && <Button asChild className="mt-5 rounded-full"><Link to="/nova">Cadastrar receita</Link></Button>}
    </div>
  );
}
