import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X } from 'lucide-react';

interface Team {
  id: string;
  name: string;
}

interface Player {
  id?: string;
  name: string;
  position: string;
  jersey_number: number;
  team_id: string;
  photo_url?: string;
}

interface CreatePlayerFormProps {
  player?: Player;
  onSuccess: () => void;
  onCancel?: () => void;
}

const positions = [
  'Goleiro',
  'Zagueiro',
  'Lateral',
  'Meio-campo',
  'Atacante'
];

export const CreatePlayerForm = ({ player, onSuccess, onCancel }: CreatePlayerFormProps) => {
  const [name, setName] = useState(player?.name || '');
  const [position, setPosition] = useState(player?.position || '');
  const [jerseyNumber, setJerseyNumber] = useState(player?.jersey_number?.toString() || '');
  const [teamId, setTeamId] = useState(player?.team_id || '');
  const [photoUrl, setPhotoUrl] = useState(player?.photo_url || '');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!player;

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os times.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !position || !jerseyNumber || !teamId) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    const jerseyNum = parseInt(jerseyNumber);
    if (isNaN(jerseyNum) || jerseyNum < 1 || jerseyNum > 99) {
      toast({
        title: "Erro",
        description: "Número da camisa deve ser entre 1 e 99.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if jersey number is already taken by another player in the same team
      const { data: existingPlayers, error: checkError } = await supabase
        .from('players')
        .select('id')
        .eq('team_id', teamId)
        .eq('jersey_number', jerseyNum);

      if (checkError) throw checkError;

      // Filter out current player if editing
      const conflictingPlayers = existingPlayers?.filter(p => p.id !== player?.id) || [];
      
      if (conflictingPlayers.length > 0) {
        toast({
          title: "Erro",
          description: "Este número de camisa já está sendo usado por outro jogador neste time.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const playerData = {
        name: name.trim(),
        position,
        jersey_number: jerseyNum,
        team_id: teamId,
        photo_url: photoUrl.trim() || null
      };

      if (isEditing) {
        const { error } = await supabase
          .from('players')
          .update(playerData)
          .eq('id', player.id);

        if (error) {
          console.error('Player update error:', error);
          throw error;
        }

        toast({
          title: "Sucesso",
          description: "Jogador atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('players')
          .insert([playerData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Jogador criado com sucesso!",
        });
      }

      setName('');
      setPosition('');
      setJerseyNumber('');
      setTeamId('');
      setPhotoUrl('');
      onSuccess();
    } catch (error) {
      console.error('Error saving player:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'criar'} o jogador.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? 'Editar Jogador' : 'Criar Novo Jogador'}</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Jogador</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Pelé"
              required
            />
          </div>

          <div>
            <Label htmlFor="position">Posição</Label>
            <Select value={position} onValueChange={setPosition} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a posição" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="jerseyNumber">Número da Camisa</Label>
            <Input
              id="jerseyNumber"
              type="number"
              min="1"
              max="99"
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="Ex: 10"
              required
            />
          </div>

          <div>
            <Label htmlFor="team">Time</Label>
            <Select value={teamId} onValueChange={setTeamId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o time" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="photoUrl">URL da Foto (opcional)</Label>
            <Input
              id="photoUrl"
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'} Jogador
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