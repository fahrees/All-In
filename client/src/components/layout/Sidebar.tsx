import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Briefcase, 
  Lightbulb, 
  LogOut,
  Hexagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  
  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portfolios", label: "Portfolios", icon: Briefcase },
    { href: "/insights", label: "AI Insights", icon: Lightbulb },
  ];

  return (
    <div className="w-64 glass-panel flex flex-col h-full z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Hexagon className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-display font-bold text-white tracking-tight">
          Wealth Hub
        </h2>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map(link => {
          const active = location === link.href || (link.href !== '/' && location.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link 
              key={link.href} 
              href={link.href} 
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
                active 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-5 h-5 transition-transform duration-300", active ? "scale-110" : "group-hover:scale-110")} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4 px-2 bg-white/5 py-3 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={() => logout()} 
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10 w-full text-left font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout Account
        </button>
      </div>
    </div>
  );
}
