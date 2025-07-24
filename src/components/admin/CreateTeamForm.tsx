import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

interface Team {
  id?: string;
  name: string;
  logo_url?: string;
}

interface CreateTeamFormProps {
  team?: Team;
  onSuccess: () => void;
  onCancel?: () => void;
}

export const CreateTeamForm = ({ team, onSuccess, onCancel }: CreateTeamFormProps) => {
  const [name, setName] = useState(team?.name || '');
  const [logoUrl, setLogoUrl] = useState(team?.logo_url || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!team;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Erro",
        description: "Nome do time é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('teams')
          .update({ name: name.trim(), logo_url: logoUrl.trim() || null })
          .eq('id', team.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Time atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('teams')
          .insert([{ name: name.trim(), logo_url: logoUrl.trim() || null }]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Time criado com sucesso!",
        });
      }

      setName('');
      setLogoUrl('');
      onSuccess();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'criar'} o time.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? 'Editar Time' : 'Criar Novo Time'}</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Time</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Flamengo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="logoUrl">URL do Logo (opcional)</Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'} Time
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};