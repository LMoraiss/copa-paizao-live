import { NavLink } from 'react-router-dom';
import { Calendar, Trophy, Users, Target, Settings } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const Navigation = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { to: '/', label: 'Partidas', icon: Calendar },
    { to: '/standings', label: 'Classificação', icon: Trophy },
    { to: '/teams', label: 'Times', icon: Users },
    { to: '/scorers', label: 'Artilheiros', icon: Target },
  ];

  return (
    <nav className="bg-gradient-to-r from-background via-background/95 to-background border-b border-border/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center space-x-2 py-4 px-4 border-b-2 text-sm font-medium whitespace-nowrap transition-all duration-300 relative rounded-t-lg",
                    isActive
                      ? "border-primary text-primary bg-primary/5 shadow-lg"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30"
                  )
                }
              >
                <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                <span className="group-hover:font-semibold transition-all duration-300">{item.label}</span>
                <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </NavLink>
            );
          })}
          
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "group flex items-center space-x-2 py-4 px-4 border-b-2 text-sm font-medium whitespace-nowrap transition-all duration-300 relative rounded-t-lg",
                  isActive
                    ? "border-primary text-primary bg-primary/5 shadow-lg"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-muted/30"
                )
              }
            >
              <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
              <span className="group-hover:font-semibold transition-all duration-300">Admin</span>
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};