import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AppHeader = () => {
  const { profile, signOut, isAdmin } = useAuth();

  return (
    <header className="bg-gradient-to-r from-card via-card/95 to-card shadow-lg border-b border-border/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 group">
            <div className="relative">
              <img 
                src="/lovable-uploads/f126e355-793b-4a3e-94d1-87de200dafb7.png" 
                alt="Colégio Marista" 
                className="h-10 w-10 object-contain rounded-full shadow-md group-hover:scale-110 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                Copa Paizão
              </h1>
              <p className="text-sm text-muted-foreground">⚽ Arena Live</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <span className="text-xs bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-3 py-1.5 rounded-full font-semibold shadow-md animate-pulse">
                👑 ADMIN
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover-lift rounded-xl">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline font-medium">{profile?.full_name || 'Usuário'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-border/20 shadow-xl">
                <DropdownMenuItem onClick={signOut} className="text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};