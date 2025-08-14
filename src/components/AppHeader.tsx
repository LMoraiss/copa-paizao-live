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
    <header className="bg-primary border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <img 
                src="/lovable-uploads/f126e355-793b-4a3e-94d1-87de200dafb7.png" 
                alt="Copa Paizão" 
                className="w-8 h-8 object-contain rounded-full"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Copa Paizão
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium">
                ADMIN
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10">
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