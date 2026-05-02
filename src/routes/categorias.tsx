import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Pencil, Plus, Tags, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCategories } from "@/lib/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/categorias")({ component: CategoriasPage });

function CategoriasPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { all, custom, refresh } = useCategories();

  const [editing, setEditing] = useState<{ id?: string; name: string; emoji: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  function openNew() {
    setEditing({ name: "", emoji: "🍽️" });
    setOpen(true);
  }

  function openEdit(c: { id?: string; name: string; emoji: string }) {
    setEditing(c);
    setOpen(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user || !editing) return;
    const name = editing.name.trim();
    if (!name) { toast.error("Dê um nome para a categoria"); return; }
    setSaving(true);
    const payload = { name, emoji: editing.emoji || "🍽️", user_id: user.id };
    const res = editing.id
      ? await supabase.from("custom_categories").update(payload).eq("id", editing.id)
      : await supabase.from("custom_categories").insert(payload);
    setSaving(false);
    if (res.error) {
      toast.error(res.error.message.includes("unique") ? "Já existe uma categoria com esse nome" : "Erro ao salvar");
      return;
    }
    toast.success(editing.id ? "Categoria atualizada" : "Categoria criada");
    setOpen(false);
    setEditing(null);
    refresh();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("custom_categories").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Categoria excluída");
    refresh();
  }

  if (loading || !user) {
    return <div className="container mx-auto p-16 flex justify-center"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Tags className="size-6 text-primary" />
          <h1 className="font-display text-3xl">Categorias</h1>
        </div>
        <Button onClick={openNew} className="rounded-full"><Plus className="size-4" /> Nova categoria</Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Suas categorias personalizadas aparecem ao criar e editar receitas.
      </p>

      <section className="rounded-3xl border bg-card p-4 md:p-6">
        <h2 className="font-display text-lg mb-3">Suas categorias</h2>
        {custom.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Você ainda não criou categorias. Toque em <strong>Nova categoria</strong>.
          </p>
        ) : (
          <ul className="divide-y">
            {custom.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3">
                <span className="flex items-center gap-3"><span className="text-2xl">{c.emoji}</span> {c.name}</span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(c)} aria-label="Editar">
                    <Pencil className="size-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Excluir" className="text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                        <AlertDialogDescription>
                          As receitas desta categoria continuarão existindo, mas perderão o agrupamento.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => c.id && remove(c.id)}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-3xl border bg-card/60 p-4 md:p-6">
        <h2 className="font-display text-lg mb-3">Categorias padrão</h2>
        <div className="flex flex-wrap gap-2">
          {all.filter((c) => !c.custom).map((c) => (
            <span key={c.name} className="rounded-full bg-secondary px-3 py-1 text-sm">
              <span className="mr-1">{c.emoji}</span>{c.name}
            </span>
          ))}
        </div>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Nome</Label>
              <Input id="cat-name" value={editing?.name ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, name: e.target.value } : p)} maxLength={40} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-emoji">Emoji</Label>
              <Input id="cat-emoji" value={editing?.emoji ?? ""} onChange={(e) => setEditing((p) => p ? { ...p, emoji: e.target.value } : p)} maxLength={4} placeholder="🍽️" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={saving} className="rounded-full">
                {saving && <Loader2 className="size-4 animate-spin" />} Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="mt-8 text-center">
        <Button asChild variant="ghost"><Link to="/">Voltar</Link></Button>
      </div>
    </div>
  );
}
