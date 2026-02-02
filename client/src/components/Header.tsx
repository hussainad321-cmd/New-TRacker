import { Search, Bell, User, X } from "lucide-react";
import { useSearch } from "@/hooks/use-search";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { useLocation } from "wouter";
import { useState, useRef, useEffect } from "react";

export function Header({ title }: { title: string }) {
  const { searchQuery, setSearchQuery, searchResults } = useSearch();
  const [, navigate] = useLocation();
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize global search
  useGlobalSearch();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (result: any) => {
    if (result.link) {
      navigate(result.link);
    }
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <header className="h-20 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40 px-8 flex items-center justify-between">
      <h2 className="text-2xl font-display font-bold text-foreground">{title}</h2>
      
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(e.target.value.length > 0);
            }}
            onFocus={() => searchQuery.length > 0 && setShowResults(true)}
            className="pl-10 pr-10 py-2 rounded-full bg-background border border-border text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border/50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    </div>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded whitespace-nowrap">
                      {result.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
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
