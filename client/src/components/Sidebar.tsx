import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  PackageSearch, 
  ScrollText, 
  Droplet,
  Scissors, 
  Shirt, 
  Stamp, 
  Package,
  Box,
  ShoppingCart,
  DollarSign,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const productionLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/yarn", label: "Yarn Inventory", icon: PackageSearch },
  { href: "/knitting", label: "Knitting", icon: ScrollText },
  { href: "/dyeing", label: "Dyeing", icon: Droplet },
  { href: "/cutting", label: "Cutting", icon: Scissors },
  { href: "/stitching", label: "Stitching", icon: Shirt },
  { href: "/pressing", label: "Pressing", icon: Stamp },
  { href: "/packing", label: "Packing", icon: Package },
  { href: "/container", label: "Container", icon: Box },
];

const financialLinks = [
  { href: "/raw-materials", label: "Raw Materials", icon: ShoppingCart },
  { href: "/factory-costs", label: "Factory Costs", icon: DollarSign },
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
      <div className={cn("p-4 border-b border-border flex flex-col gap-4", isCollapsed && "px-2 items-center")}>
        <div className="flex flex-col items-center w-full gap-4">
          <Link href="/" className="w-full">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col items-center gap-3 cursor-pointer group transition-all duration-300",
                isCollapsed ? "px-0" : "px-2"
              )}
            >
              <img 
                src="/ad-knitwear-logo.png"
                alt="AD Knitwear Logo" 
                className={cn(
                  "object-contain rounded transition-all duration-300 group-hover:scale-105",
                  isCollapsed ? "w-14 h-14" : "w-20 h-20"
                )} 
              />
              {!isCollapsed && (
                <div className="text-center">
                  <h1 className="text-lg font-bold font-display text-primary tracking-tight leading-none">
                    AD Knitwear
                  </h1>
                  <span className="text-foreground text-sm font-medium tracking-widest uppercase">Flow</span>
                </div>
              )}
            </motion.div>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("transition-all self-center hover-elevate active-elevate-2", !isCollapsed && "mt-2")}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        {/* Production Section */}
        <div>
          {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Production</p>}
          <div className="space-y-1">
            {productionLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Section */}
        <div>
          {!isCollapsed && <p className="text-xs font-semibold text-muted-foreground uppercase px-3 mb-2">Financial</p>}
          <div className="space-y-1">
            {financialLinks.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : ""}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-border">
        <div className={cn("bg-muted/50 rounded-lg p-3 space-y-2", isCollapsed && "p-2 flex justify-center flex-col items-center")}>
          {!isCollapsed ? (
            <>
              <p className="text-xs font-semibold text-foreground">Logged in as Admin</p>
              <p className="text-[10px] text-muted-foreground">Factory ID: FAC-001</p>
              <p className="text-[10px] text-muted-foreground font-medium">Currency: PKR</p>
            </>
          ) : (
            <div className="space-y-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <p className="text-[8px] font-bold text-foreground">PKR</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

