import { useState } from "react";
import { Search, Bell, User, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50" data-testid="header">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2" data-testid="logo">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="text-primary-foreground" size={16} />
            </div>
            <h1 className="text-xl font-bold text-foreground">BCTRADE</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6" data-testid="navigation">
            <a href="#" className="text-primary font-medium" data-testid="link-dashboard">Dashboard</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-markets">Markets</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-predictions">Predictions</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-portfolio">Portfolio</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" data-testid="link-analytics">Analytics</a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative" data-testid="search-container">
            <Input
              type="search"
              placeholder="Search cryptocurrencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-input border-border pl-10 pr-4 py-2 w-64 text-sm"
              data-testid="input-search"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-muted-foreground hover:text-foreground"
            data-testid="button-notifications"
          >
            <Bell size={16} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          
          <div className="flex items-center space-x-2" data-testid="user-profile">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground" size={14} />
            </div>
            <span className="text-sm font-medium">VAMSI TU</span>
          </div>
        </div>
      </div>
    </header>
  );
}
