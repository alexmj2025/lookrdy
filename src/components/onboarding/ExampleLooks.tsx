"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setResult } from "@/lib/flowStore";
import { money } from "@/lib/format";
import type { Bundle, Category } from "@/lib/types";

const palettes = [["#e6dfd2", "#f6efe6", "#454c4c", "#534538"], ["#e0e6e1", "#e3d4bf", "#283845", "#302a27"], ["#ece1d8", "#a66e5c", "#49404a", "#51382e"]];
const shapes: Partial<Record<Category, string>> = {
  top: "M32 12 43 8l7 9 7-9 11 4 15 14-11 17-8-5v50H36V38l-8 5-11-17z",
  trousers: "M28 12h44l5 72H59l-9-44-9 44H23z",
  shoes: "M10 68h33l6-18 10 9 10 9 17 4 4 10H10z",
};

export function ExampleArt({ look, index }: { look: Bundle; index: number }) {
  const palette = palettes[index % palettes.length];
  return <div className="onb-example-art" style={{ background: palette[0] }} aria-label={`${look.name} outfit board`}>
    {look.items.map((item, i) => item.imageUrl ? <img key={item.id} src={item.imageUrl} alt={item.name} /> :
      <svg key={item.id} viewBox="0 0 100 100" aria-hidden="true"><path d={shapes[item.category] ?? shapes.top} fill={palette[i + 1]} stroke="#292621" strokeWidth="1" /></svg>)}
  </div>;
}

export function ExampleLooks() {
  const router = useRouter();
  const [examples, setExamples] = useState<Bundle[]>([]);
  useEffect(() => {
    let ignore = false;
    void fetch("/api/examples").then((response) => response.ok ? response.json() : [])
      .then((data: Bundle[]) => { if (!ignore && Array.isArray(data)) setExamples(data); }).catch(() => {});
    return () => { ignore = true; };
  }, []);
  if (!examples.length) return null;
  function openExample(id: string) {
    void setResult({
      searchId: "simons-example-company-dinner",
      engine: "mock",
      example: true,
      request: { occasion: "Company dinner", desiredLook: "", budget: 450, currency: "CAD", location: "Canada", exclusions: "" },
      constraints: { occasion: "Company dinner", formalityMin: 1, formalityMax: 5, styleTags: [], colors: [], exclusions: [], budget: 450, currency: "CAD", location: "Canada", country: "CA", requiredCategories: ["top", "trousers", "shoes"] },
      looks: examples.map((item) => ({ ...item, imageUrl: "", hotspots: [], previewStatus: "products-only", previewNotice: "Example from the Simons catalog. Check current prices and colour options on Simons.ca." })),
    });
    router.push(`/looks/${id}`);
  }
  return <section className="onb-work-section" aria-labelledby="example-title">
    <p className="onb-eyebrow">Start with a real shopping list</p>
    <h2 className="onb-aside__title" id="example-title">Three ways to dress for dinner</h2>
    <p className="onb-help">Explore Simons picks before uploading anything. Illustrations stand in for product photos where none are available.</p>
    <div className="onb-work-grid onb-example-grid">
      {examples.map((look, index) => (
        <article key={look.id} className="onb-work-card">
          <ExampleArt look={look} index={index} />
          <div className="onb-work-card-body">
            <h3 className="onb-aside__title">{look.name}</h3>
            <p className="onb-help">Catalog estimate: {money(look.total, "CAD")}</p>
            <button type="button" className="onb-btn onb-btn--ghost" onClick={() => openExample(look.id)}>Explore {look.name.toLowerCase()}</button>
          </div>
        </article>
      ))}
    </div>
  </section>;
}
