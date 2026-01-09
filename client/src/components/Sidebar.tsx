import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ScrollText, 
  Scissors, 
  Shirt, 
  Stamp, 
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/yarn", label: "Yarn Inventory", icon: PackageSearch },
  { href: "/knitting", label: "Knitting", icon: ScrollText },
  { href: "/cutting", label: "Cutting", icon: Scissors },
  { href: "/stitching", label: "Stitching", icon: Shirt },
  { href: "/pressing", label: "Pressing", icon: Stamp },
  { href: "/packing", label: "Packing", icon: Package },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-card border-r border-border h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold font-display text-primary tracking-tight">
          FABRIC<span className="text-foreground">FLOW</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Production Management System</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {link.label}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-xs font-semibold text-foreground">Logged in as Admin</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Factory ID: FAC-001</p>
        </div>
      </div>
    </aside>
  );
}
