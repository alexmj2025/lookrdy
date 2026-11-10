import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

export function WorkspacePage({ children }: { children: ReactNode }) {
  return <div className="onb"><div className="onb-shell">
    <header className="onb-work-header">
      <Link href="/" aria-label="Lookrdy home" className="onb-topbar__mark"><Logo height={22} priority /></Link>
      <nav aria-label="Styling workspace" className="onb-work-actions">
        <Link className="onb-btn onb-btn--quiet" href="/create">Shop Simons</Link>
        <Link className="onb-btn onb-btn--quiet" href="/wardrobe">My wardrobe</Link>
        <Link className="onb-btn onb-btn--quiet" href="/saved">My looks</Link>
      </nav>
    </header>
    <main className="onb-panel">{children}</main>
  </div></div>;
}
