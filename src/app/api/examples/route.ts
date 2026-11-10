import { NextResponse } from "next/server";
import { composeSimonsOutfits } from "@/lib/simons/compose";
import { simonsOutfitsToBundles } from "@/lib/simons/toBundle";

export async function GET() {
  const bundles = simonsOutfitsToBundles(composeSimonsOutfits("company_dinner", { budgetMin: 200, budgetMax: 450, avoidText: "" }), null);
  return NextResponse.json(bundles.map((bundle) => ({
    ...bundle,
    items: bundle.items.map(({ generationImageUrl: _reference, ...item }) => item),
    layers: bundle.layers?.map(({ generationImageUrl: _reference, ...item }) => item),
  })), { headers: { "Cache-Control": "public, max-age=300" } });
}
