import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  team_id: string;
  team: {
    name: string;
  };
}

export const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          team:teams(name)
        `)
        .order('team_id')
        .order('jersey_number');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os jogadores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'goleiro':
        return 'bg-yellow-100 text-yellow-800';
      case 'zagueiro':
        return 'bg-blue-100 text-blue-800';
      case 'lateral':
        return 'bg-green-100 text-green-800';
      case 'meio-campo':
        return 'bg-purple-100 text-purple-800';
      case 'atacante':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Group players by team
  const playersByTeam = players.reduce((acc, player) => {
    const teamName = player.team.name;
    if (!acc[teamName]) {
      acc[teamName] = [];
    }
    acc[teamName].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Jogadores</h1>
        <p className="text-muted-foreground">Todos os jogadores da Copa Paizão</p>
      </div>

      {Object.keys(playersByTeam).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum jogador encontrado</h3>
            <p className="text-muted-foreground">
              Os jogadores aparecerão aqui quando forem cadastrados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(playersByTeam).map(([teamName, teamPlayers]) => (
            <Card key={teamName}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>{teamName}</span>
                  <Badge variant="secondary">{teamPlayers.length} jogadores</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {player.jersey_number}
                        </div>
                        <div>
                          <h4 className="font-semibold">{player.name}</h4>
                          <Badge
                            variant="secondary"
                            className={getPositionColor(player.position)}
                          >
                            {player.position}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};