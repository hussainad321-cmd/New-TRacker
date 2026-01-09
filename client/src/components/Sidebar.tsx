import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ScrollText, 
  Scissors, 
  Shirt, 
  Stamp, 
  Package,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "bg-card border-r border-border h-screen flex flex-col transition-all duration-300 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6 border-b border-border flex items-center justify-between", isCollapsed && "px-4")}>
        {!isCollapsed && (
          <h1 className="text-2xl font-bold font-display text-primary tracking-tight">
            FABRIC<span className="text-foreground">FLOW</span>
          </h1>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn("transition-all", !isCollapsed && "ml-auto")}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
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
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? link.label : ""}
              >
                <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {!isCollapsed && <span>{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className={cn("bg-muted/50 rounded-lg p-3", isCollapsed && "p-2 flex justify-center")}>
          {!isCollapsed ? (
            <>
              <p className="text-xs font-semibold text-foreground">Logged in as Admin</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Factory ID: FAC-001</p>
            </>
          ) : (
            <div className="w-2 h-2 rounded-full bg-green-500" />
          )}
        </div>
      </div>
    </aside>
  );
}
