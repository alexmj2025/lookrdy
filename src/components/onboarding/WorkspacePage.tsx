"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderHeart, Images, Settings, Shirt, ShoppingBag, UserRound } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";

const navigation = [
  ["/wardrobe", "My wardrobe", Shirt],
  ["/create", "Shop Simons", ShoppingBag],
  ["/saved", "My looks", Images],
  ["/collections", "My collections", FolderHeart],
  ["/account", "My account", UserRound],
  ["/settings", "Settings", Settings],
] as const;

export function WorkspacePage({ children, auth = false }: { children: ReactNode; auth?: boolean }) {
  const pathname = usePathname();
  if (auth) return <div className="onb"><div className="onb-shell onb-auth-layout">
    <header className="onb-work-header">
      <Link href="/" aria-label="Lookrdy home" className="onb-topbar__mark"><Logo height={22} priority /></Link>
    </header>
    <main className="onb-panel">{children}</main>
  </div></div>;
  return <div className="onb"><div className="onb-workspace">
    <aside className="onb-sidebar">
      <Link href="/" aria-label="Lookrdy home" className="onb-topbar__mark"><Logo height={24} priority /></Link>
      <nav aria-label="Styling workspace">
        {navigation.map(([href, label, Icon]) => <Link href={href} key={href} aria-current={pathname === href ? "page" : undefined}>
          <Icon aria-hidden size={18} strokeWidth={1.7} /> <span>{label}</span>
        </Link>)}
      </nav>
    </aside>
    <main className="onb-workspace-main">{children}</main>
  </div></div>;
}
