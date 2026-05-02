import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CATEGORY_EMOJI } from "@/lib/categories";
import { useAuth } from "@/lib/auth-context";

export interface CategoryItem {
  name: string;
  emoji: string;
  custom: boolean;
  id?: string;
}

export function useCategories() {
  const { user } = useAuth();
  const [custom, setCustom] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setCustom([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("custom_categories")
      .select("*")
      .order("name");
    setCustom(
      (data ?? []).map((c) => ({ id: c.id, name: c.name, emoji: c.emoji, custom: true })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const all: CategoryItem[] = [
    ...CATEGORIES.map((c) => ({ name: c, emoji: CATEGORY_EMOJI[c] ?? "🍽️", custom: false })),
    ...custom,
  ];

  return { all, custom, loading, refresh };
}
