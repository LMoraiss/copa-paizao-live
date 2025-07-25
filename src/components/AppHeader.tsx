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
    <header className="bg-card shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/f126e355-793b-4a3e-94d1-87de200dafb7.png" alt="Colégio Marista" className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Copa Paizão</h1>
              <p className="text-sm text-muted-foreground">Arena Live</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                ADMIN
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.full_name || 'Usuário'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={signOut} className="text-red-600">
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