import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Home, LogIn, LogOut, Moon, Plus, Sun, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b backdrop-blur-xl bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary/15 text-primary">
            <UtensilsCrossed className="size-5" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Receitas da Mamãe</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button asChild variant="ghost" size="sm"><Link to="/"><Home className="size-4" /> Início</Link></Button>
          {user && (
            <Button asChild variant="ghost" size="sm"><Link to="/favoritos"><Heart className="size-4" /> Favoritas</Link></Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Alternar tema">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          {user ? (
            <>
              <Button onClick={() => navigate({ to: "/nova" })} size="sm" className="rounded-full">
                <Plus className="size-4" /> Nova
              </Button>
              <Button variant="ghost" size="icon" onClick={() => signOut()} aria-label="Sair">
                <LogOut className="size-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth"><LogIn className="size-4" /> Entrar</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
