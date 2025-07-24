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
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center space-x-8 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
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
                  "flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium whitespace-nowrap transition-colors",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
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