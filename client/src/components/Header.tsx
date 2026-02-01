import { Search, Bell, User, X } from "lucide-react";
import { useSearch } from "@/hooks/use-search";

export function Header({ title }: { title: string }) {
  const { searchQuery, setSearchQuery } = useSearch();

  return (
    <header className="h-20 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search records..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 py-2 rounded-full bg-background border border-border text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <button className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-md transition-all relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
          <span className="font-bold text-sm">AD</span>
        </button>
      </div>
    </header>
  );
}
