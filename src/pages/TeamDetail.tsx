import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trophy, Users, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CreatePlayerForm } from '@/components/admin/CreatePlayerForm';

interface Player {
  id: string;
  name: string;
  position: string;
  jersey_number: number;
  photo_url: string | null;
  team_id: string;
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

const SoccerField = ({ players }: { players: Player[] }) => {
  const getPlayersByPosition = (position: string) => {
    return players.filter(p => p.position.toLowerCase() === position.toLowerCase());
  };

  const goalkeepers = getPlayersByPosition('goleiro');
  const defenders = getPlayersByPosition('zagueiro').concat(getPlayersByPosition('lateral'));
  const midfielders = getPlayersByPosition('meio-campo');
  const forwards = getPlayersByPosition('atacante');

  const PlayerDot = ({ player, x, y }: { player: Player; x: number; y: number }) => (
    <g>
      <circle
        cx={x}
        cy={y}
        r="8"
        fill="hsl(var(--primary))"
        stroke="white"
        strokeWidth="2"
      />
      <text
        x={x}
        y={y + 3}
        textAnchor="middle"
        className="fill-white text-xs font-bold"
      >
        {player.jersey_number}
      </text>
      <text
        x={x}
        y={y + 25}
        textAnchor="middle"
        className="fill-foreground text-xs"
      >
        {player.name.split(' ')[0]}
      </text>
    </g>
  );

  const fieldWidth = 400;
  const fieldHeight = 600;

  return (
    <div className="flex justify-center p-4">
      <svg width={fieldWidth} height={fieldHeight} className="border rounded-lg">
        {/* Field background */}
        <rect width={fieldWidth} height={fieldHeight} fill="#22c55e" />
        
        {/* Field markings */}
        <rect x="50" y="0" width="300" height={fieldHeight} fill="none" stroke="white" strokeWidth="2" />
        <circle cx="200" cy="300" r="60" fill="none" stroke="white" strokeWidth="2" />
        <line x1="50" y1="300" x2="350" y2="300" stroke="white" strokeWidth="2" />
        
        {/* Goal areas */}
        <rect x="150" y="0" width="100" height="40" fill="none" stroke="white" strokeWidth="2" />
        <rect x="150" y={fieldHeight - 40} width="100" height="40" fill="none" stroke="white" strokeWidth="2" />
        
        {/* Penalty areas */}
        <rect x="100" y="0" width="200" height="120" fill="none" stroke="white" strokeWidth="2" />
        <rect x="100" y={fieldHeight - 120} width="200" height="120" fill="none" stroke="white" strokeWidth="2" />

        {/* Position players */}
        {/* Goalkeepers */}
        {goalkeepers.map((player, index) => (
          <PlayerDot key={player.id} player={player} x={200} y={70 + index * 30} />
        ))}

        {/* Defenders */}
        {defenders.map((player, index) => {
          const x = 120 + (index % 3) * 80;
          const y = 180 + Math.floor(index / 3) * 40;
          return <PlayerDot key={player.id} player={player} x={x} y={y} />;
        })}

        {/* Midfielders */}
        {midfielders.map((player, index) => {
          const x = 120 + (index % 3) * 80;
          const y = 280 + Math.floor(index / 3) * 40;
          return <PlayerDot key={player.id} player={player} x={x} y={y} />;
        })}

        {/* Forwards */}
        {forwards.map((player, index) => {
          const x = 140 + (index % 2) * 120;
          const y = 420 + Math.floor(index / 2) * 40;
          return <PlayerDot key={player.id} player={player} x={x} y={y} />;
        })}
      </svg>
    </div>
  );
};

export const TeamDetail = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (teamId) {
      fetchTeamData();
    }
    
    // Subscribe to real-time updates for players
    const playersChannel = supabase
      .channel(`team-players-${teamId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `team_id=eq.${teamId}`
        },
        () => {
          console.log('Players updated in real-time');
          fetchTeamData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(playersChannel);
    };
  }, [teamId]);

  const fetchTeamData = async () => {
    if (!teamId) return;

    try {
      // Fetch team info
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('id, name, logo_url')
        .eq('id', teamId)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select('id, name, position, jersey_number, photo_url, team_id')
        .eq('team_id', teamId)
        .order('jersey_number');

      if (playersError) throw playersError;
      setPlayers(playersData || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do time.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerEditSuccess = () => {
    setEditingPlayer(null);
    fetchTeamData();
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
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-4">Time não encontrado</h2>
          <Link to="/teams">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para Times
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (editingPlayer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CreatePlayerForm 
          player={editingPlayer} 
          onSuccess={handlePlayerEditSuccess}
          onCancel={() => setEditingPlayer(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/teams">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Times
          </Button>
        </Link>
        
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={`Logo ${team.name}`}
                className="w-12 h-12 object-contain rounded-full"
              />
            ) : (
              <Trophy className="h-8 w-8 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{team.name}</h1>
            <p className="text-muted-foreground">{players.length} jogadores</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Soccer Field Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Formação do Time</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length > 0 ? (
              <SoccerField players={players} />
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum jogador cadastrado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Players List */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco</CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum jogador cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
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
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingPlayer(player)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
