import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useCategories } from "@/lib/use-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Tables } from "@/integrations/supabase/types";

type Recipe = Tables<"recipes">;

export function RecipeForm({ initial }: { initial?: Recipe }) {
  const { user } = useAuth();
  const { all: categories } = useCategories();
  const navigate = useNavigate();
  const [name, setName] = useState(initial?.name ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Bolos");
  const [ingredients, setIngredients] = useState(initial?.ingredients ?? "");
  const [instructions, setInstructions] = useState(initial?.instructions ?? "");
  const [prepTime, setPrepTime] = useState<string>(initial?.prep_time?.toString() ?? "");
  const [servings, setServings] = useState<string>(initial?.servings?.toString() ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx 5MB)"); return; }
    setUploading(true);
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const { error } = await supabase.storage.from("recipe-images").upload(path, file);
    if (error) { toast.error("Falha ao enviar imagem"); setUploading(false); return; }
    const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
    setImageUrl(data.publicUrl);
    setUploading(false);
    toast.success("Foto adicionada!");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) { toast.error("Dê um nome para a receita"); return; }
    setSaving(true);
    const payload = {
      name: name.trim(),
      category,
      ingredients,
      instructions,
      prep_time: prepTime ? Number(prepTime) : null,
      servings: servings ? Number(servings) : null,
      notes: notes || null,
      image_url: imageUrl || null,
      user_id: user.id,
    };
    const res = initial
      ? await supabase.from("recipes").update(payload).eq("id", initial.id).select().single()
      : await supabase.from("recipes").insert(payload).select().single();
    setSaving(false);
    if (res.error) { toast.error("Erro ao salvar"); return; }
    toast.success(initial ? "Receita atualizada" : "Receita criada");
    navigate({ to: "/receita/$id", params: { id: res.data.id } });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Foto da receita</Label>
        <div className="flex items-center gap-4">
          <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-2xl border bg-muted">
            {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <Upload className="size-6 text-muted-foreground" />}
          </div>
          <label className="cursor-pointer">
            <input type="file" accept="image/*" onChange={handleUpload} className="sr-only" />
            <span className="inline-flex items-center gap-2 rounded-full border bg-secondary px-4 py-2 text-sm hover:bg-accent">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
              {imageUrl ? "Trocar foto" : "Enviar foto"}
            </span>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Bolo de cenoura da vovó" required maxLength={120} />
        </div>
        <div className="space-y-2">
          <Label>Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c.name} value={c.name}>{c.emoji} {c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="prep">Tempo (min)</Label>
            <Input id="prep" type="number" min="0" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="serv">Porções</Label>
            <Input id="serv" type="number" min="0" value={servings} onChange={(e) => setServings(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ing">Ingredientes</Label>
        <Textarea id="ing" rows={6} value={ingredients} onChange={(e) => setIngredients(e.target.value)} placeholder={"2 xícaras de farinha\n1 xícara de açúcar\n..."} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="inst">Modo de preparo</Label>
        <Textarea id="inst" rows={8} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder={"1. Misture os ingredientes...\n2. Asse por 40 minutos..."} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Dicas extras, variações..." />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving} className="rounded-full px-8">
          {saving && <Loader2 className="size-4 animate-spin" />} Salvar receita
        </Button>
        <Button type="button" variant="ghost" onClick={() => history.back()}>Cancelar</Button>
      </div>
    </form>
  );
}
