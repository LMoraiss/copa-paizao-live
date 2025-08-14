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
    <nav className="bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
          
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 border border-primary/30",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-primary hover:bg-primary/10"
                )
              }
            >
              <Settings className="h-4 w-4" />
              <span>Admin</span>
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};