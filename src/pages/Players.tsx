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
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="text-4xl font-bold text-foreground mb-3">⚽ Jogadores</h1>
        <p className="text-muted-foreground text-lg">Todos os jogadores da Copa Paizão</p>
        <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto mt-4 rounded-full"></div>
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
          {Object.entries(playersByTeam).map(([teamName, teamPlayers], teamIndex) => (
            <Card key={teamName} className="hover-lift glass animate-fade-in-up" 
                  style={{ animationDelay: `${teamIndex * 0.1}s` }}>
              <CardHeader className="bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold">{teamName}</span>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {teamPlayers.length} jogadores
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teamPlayers.map((player, playerIndex) => (
                    <div
                      key={player.id}
                      className="group relative p-4 border-2 border-border/50 rounded-xl hover:border-primary/30 hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300 hover-lift"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-r from-primary to-secondary text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                            {player.jersey_number}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                            <Users className="h-2.5 w-2.5 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {player.name}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={`${getPositionColor(player.position)} mt-1 shadow-sm`}
                          >
                            {player.position}
                          </Badge>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
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