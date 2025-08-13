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
    return players.filter(p => {
      const playerPos = p.position.toLowerCase();
      const searchPos = position.toLowerCase();
      
      if (playerPos === searchPos) return true;
      if (searchPos === 'zagueiro' && (playerPos === 'lateral' || playerPos === 'zagueiro')) return true;
      
      return playerPos.includes(searchPos);
    });
  };

  const goalkeepers = getPlayersByPosition('goleiro').slice(0, 1);
  const defenders = getPlayersByPosition('zagueiro').slice(0, 4);
  const midfielders = getPlayersByPosition('meio-campo').slice(0, 4);
  const forwards = getPlayersByPosition('atacante').slice(0, 3);

  const PlayerCard = ({ player, x, y }: { player: Player; x: number; y: number }) => (
    <g className="group cursor-pointer">
      {/* Player card background with gradient */}
      <defs>
        <radialGradient id={`gradient-${player.id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="1" />
        </radialGradient>
        <filter id={`shadow-${player.id}`}>
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>
      
      {/* Player card */}
      <rect
        x={x - 20}
        y={y - 15}
        width="40"
        height="30"
        rx="8"
        fill={`url(#gradient-${player.id})`}
        stroke="white"
        strokeWidth="2"
        filter={`url(#shadow-${player.id})`}
        className="transition-all duration-300 group-hover:scale-110"
      />
      
      {/* Jersey number circle */}
      <circle
        cx={x}
        cy={y - 5}
        r="8"
        fill="white"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        className="transition-all duration-300 group-hover:scale-110"
      />
      <text
        x={x}
        y={y - 1}
        textAnchor="middle"
        className="fill-primary text-xs font-black"
      >
        {player.jersey_number}
      </text>
      
      {/* Player name */}
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        className="fill-white text-[10px] font-bold drop-shadow-sm"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.7)' }}
      >
        {player.name.split(' ')[0]}
      </text>
      
      {/* Hover effect */}
      <circle
        cx={x}
        cy={y}
        r="25"
        fill="transparent"
        className="opacity-0 group-hover:opacity-20 group-hover:fill-white transition-all duration-300"
      />
    </g>
  );

  const fieldWidth = 400;
  const fieldHeight = 600;

  return (
    <div className="flex justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
      <div className="relative">
        <svg width={fieldWidth} height={fieldHeight} className="rounded-2xl shadow-2xl border-4 border-white overflow-hidden">
          <defs>
            {/* Field gradient */}
            <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--field-green-1))" />
              <stop offset="25%" stopColor="hsl(var(--field-green-2))" />
              <stop offset="50%" stopColor="hsl(var(--field-green-3))" />
              <stop offset="75%" stopColor="hsl(var(--field-green-4))" />
              <stop offset="100%" stopColor="hsl(var(--field-green-5))" />
            </linearGradient>
            
            {/* Grass pattern */}
            <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="20" height="20">
              <rect width="20" height="20" fill="url(#fieldGradient)" />
              <rect width="10" height="20" fill="rgba(255,255,255,0.05)" />
            </pattern>
            
            {/* Field shadow */}
            <filter id="fieldShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="4" floodColor="rgba(0,0,0,0.2)" />
            </filter>
          </defs>
          
          {/* Field background with pattern */}
          <rect width={fieldWidth} height={fieldHeight} fill="url(#grassPattern)" filter="url(#fieldShadow)" />
          
          {/* Field outer boundary */}
          <rect x="20" y="20" width="360" height="560" fill="none" stroke="white" strokeWidth="4" rx="8" />
          
          {/* Center line and circle */}
          <line x1="20" y1="300" x2="380" y2="300" stroke="white" strokeWidth="3" />
          <circle cx="200" cy="300" r="50" fill="none" stroke="white" strokeWidth="3" />
          <circle cx="200" cy="300" r="3" fill="white" />
          
          {/* Goal areas */}
          <rect x="140" y="20" width="120" height="60" fill="none" stroke="white" strokeWidth="3" rx="4" />
          <rect x="140" y="520" width="120" height="60" fill="none" stroke="white" strokeWidth="3" rx="4" />
          
          {/* Penalty areas */}
          <rect x="80" y="20" width="240" height="120" fill="none" stroke="white" strokeWidth="3" rx="8" />
          <rect x="80" y="460" width="240" height="120" fill="none" stroke="white" strokeWidth="3" rx="8" />
          
          {/* Penalty spots */}
          <circle cx="200" cy="110" r="3" fill="white" />
          <circle cx="200" cy="490" r="3" fill="white" />
          
          {/* Corner arcs */}
          <path d="M 20 20 Q 35 20 35 35" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 380 20 Q 365 20 365 35" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 20 580 Q 35 580 35 565" fill="none" stroke="white" strokeWidth="3" />
          <path d="M 380 580 Q 365 580 365 565" fill="none" stroke="white" strokeWidth="3" />

          {/* Position players with smart formation */}
          {/* Goalkeepers */}
          {goalkeepers.map((player, index) => (
            <PlayerCard key={player.id} player={player} x={200} y={70 + index * 30} />
          ))}

          {/* Defenders - 4-3-3 formation */}
          {defenders.map((player, index) => {
            const positions = [
              { x: 120, y: 180 }, // Left back
              { x: 170, y: 160 }, // Center back 1
              { x: 230, y: 160 }, // Center back 2
              { x: 280, y: 180 }  // Right back
            ];
            const pos = positions[index] || positions[0];
            return <PlayerCard key={player.id} player={player} x={pos.x} y={pos.y} />;
          })}

          {/* Midfielders */}
          {midfielders.map((player, index) => {
            const positions = [
              { x: 130, y: 280 }, // Left mid
              { x: 200, y: 260 }, // Central mid
              { x: 270, y: 280 }, // Right mid
              { x: 200, y: 300 }  // Attacking mid
            ];
            const pos = positions[index] || positions[0];
            return <PlayerCard key={player.id} player={player} x={pos.x} y={pos.y} />;
          })}

          {/* Forwards */}
          {forwards.map((player, index) => {
            const positions = [
              { x: 140, y: 420 }, // Left wing
              { x: 200, y: 400 }, // Striker
              { x: 260, y: 420 }  // Right wing
            ];
            const pos = positions[index] || positions[0];
            return <PlayerCard key={player.id} player={player} x={pos.x} y={pos.y} />;
          })}
        </svg>
        
        {/* Formation indicator */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
          <div className="text-xs font-bold text-green-800">
            {goalkeepers.length}-{defenders.length}-{midfielders.length}-{forwards.length}
          </div>
          <div className="text-[10px] text-green-600">Formação</div>
        </div>
      </div>
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
        
        <div className="flex items-center space-x-6 mb-8 p-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl border border-primary/20 shadow-lg">
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg">
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={`Logo ${team.name}`}
                className="w-18 h-18 object-contain rounded-xl"
              />
            ) : (
              <Trophy className="h-12 w-12 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">{team.name}</h1>
            <div className="flex items-center space-x-4">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1">
                <Users className="h-4 w-4 mr-1" />
                {players.length} jogadores
              </Badge>
              <Badge variant="outline" className="border-green-500/30 text-green-600">
                <Trophy className="h-3 w-3 mr-1" />
                Copa Paizão 2024
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Soccer Field Visualization */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50/80 to-emerald-100/50 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-600/10 to-emerald-600/10 border-b border-green-200/50">
            <CardTitle className="flex items-center space-x-3 text-green-800">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xl font-bold">Formação do Time</span>
              <Badge variant="outline" className="ml-auto border-green-500/30 text-green-600">
                Tática Atual
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {players.length > 0 ? (
              <SoccerField players={players} />
            ) : (
              <div className="text-center py-16 bg-gradient-to-br from-green-50 to-emerald-100">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 mx-8 shadow-lg border border-green-200/50">
                  <Users className="h-16 w-16 mx-auto text-green-400 mb-4" />
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Campo Vazio</h3>
                  <p className="text-green-600">Adicione jogadores para ver a formação do time</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Players List */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card via-card to-muted/10">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xl font-bold">Elenco Completo</span>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {players.length} atletas
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {players.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-muted/30 rounded-2xl p-8 border-2 border-dashed border-muted-foreground/20">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">Elenco Vazio</h3>
                  <p className="text-muted-foreground/70">Adicione jogadores para formar seu time</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {players.map((player) => (
                  <div
                    key={player.id}
                    className="group flex items-center justify-between p-4 border-0 bg-gradient-to-r from-muted/30 to-muted/20 rounded-xl hover:from-primary/5 hover:to-primary/10 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                          {player.jersey_number}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">{player.name}</h4>
                        <Badge
                          variant="secondary"
                          className={`${getPositionColor(player.position)} font-semibold border-0 shadow-sm`}
                        >
                          {player.position}
                        </Badge>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary/10 hover:text-primary"
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
