import { getSupabaseBrowser } from "@/lib/supabase/browser";
import type { WardrobeItem } from "./wardrobe";

export type Collection = { id: string; name: string };
export type CollectionLook = { collection_id: string; entry_key: string };

function client() { return getSupabaseBrowser(); }

export async function readWardrobe(): Promise<WardrobeItem[]> {
  const { data, error } = await client().from("lookrdy_wardrobe")
    .select("id,name,slot,image,swatch").order("created_at", { ascending: false }).limit(60);
  if (error) throw new Error("Your wardrobe couldn’t load. Try reloading the page.");
  return (data ?? []) as WardrobeItem[];
}

export async function saveWardrobe(items: WardrobeItem[]) {
  const { error } = await client().from("lookrdy_wardrobe").insert(items, { defaultToNull: false });
  if (error) throw new Error("These clothes couldn’t be saved to your wardrobe.");
}

export async function changeWardrobeItem(id: string, changes?: Pick<WardrobeItem, "name" | "slot">) {
  const table = client().from("lookrdy_wardrobe");
  const { error } = await (changes ? table.update(changes) : table.delete()).eq("id", id);
  if (error) throw new Error("This wardrobe item couldn’t be updated.");
}

export async function readCollections(): Promise<{ collections: Collection[]; memberships: CollectionLook[] }> {
  const [groups, links] = await Promise.all([
    client().from("lookrdy_collections").select("id,name").order("created_at", { ascending: false }),
    client().from("lookrdy_collection_looks").select("collection_id,entry_key"),
  ]);
  if (groups.error || links.error) throw new Error("Your collections couldn’t load.");
  return { collections: groups.data ?? [], memberships: links.data ?? [] };
}

export async function createCollection(name: string): Promise<Collection> {
  const { data, error } = await client().from("lookrdy_collections").insert({ name }).select("id,name").single();
  if (error) throw new Error("The collection couldn’t be created.");
  return data;
}

export async function setCollectionLook(collectionId: string, entryKey: string, add: boolean) {
  const table = client().from("lookrdy_collection_looks");
  const { error } = await (add
    ? table.upsert({ collection_id: collectionId, entry_key: entryKey }, { onConflict: "owner_id,collection_id,entry_key", ignoreDuplicates: true, defaultToNull: false })
    : table.delete().eq("collection_id", collectionId).eq("entry_key", entryKey));
  if (error) throw new Error("The collection couldn’t be updated.");
}
