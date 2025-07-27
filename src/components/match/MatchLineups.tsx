import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { User, Target } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  jersey_number: number;
  position: string;
}

interface MatchLineupsProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export const MatchLineups = ({ homeTeamId, awayTeamId, homeTeamName, awayTeamName }: MatchLineupsProps) => {
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPlayers();
  }, [homeTeamId, awayTeamId]);

  const fetchPlayers = async () => {
    try {
      const [homePlayersData, awayPlayersData] = await Promise.all([
        supabase
          .from('players')
          .select('id, name, jersey_number, position')
          .eq('team_id', homeTeamId)
          .order('jersey_number'),
        supabase
          .from('players')
          .select('id, name, jersey_number, position')
          .eq('team_id', awayTeamId)
          .order('jersey_number')
      ]);

      if (homePlayersData.error) throw homePlayersData.error;
      if (awayPlayersData.error) throw awayPlayersData.error;

      setHomePlayers(homePlayersData.data || []);
      setAwayPlayers(awayPlayersData.data || []);
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

  const getPlayersByPosition = (players: Player[], position: string) => {
    return players.filter(player => 
      player.position.toLowerCase().includes(position.toLowerCase())
    );
  };

  const renderPlayerCard = (player: Player, isHome: boolean) => (
    <Dialog key={player.id}>
      <DialogTrigger asChild>
        <div
          className={`flex flex-col items-center p-2 rounded-xl border-2 transition-all cursor-pointer hover:scale-110 hover:shadow-lg group ${
            isHome 
              ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-900 hover:border-blue-400' 
              : 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-900 hover:border-red-400'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold mb-1 shadow-md group-hover:shadow-lg transition-all ${
            isHome ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-br from-red-600 to-red-700 text-white'
          }`}>
            {player.jersey_number}
          </div>
          <span className="text-xs font-semibold text-center leading-tight group-hover:text-primary transition-colors">
            {player.name.split(' ')[0]}
          </span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Detalhes do Jogador</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold shadow-lg ${
              isHome ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white' : 'bg-gradient-to-br from-red-600 to-red-700 text-white'
            }`}>
              {player.jersey_number}
            </div>
            <div>
              <h3 className="text-xl font-bold">{player.name}</h3>
              <p className="text-muted-foreground capitalize">{player.position}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Número:</span>
              <span className="ml-2">{player.jersey_number}</span>
            </div>
            <div>
              <span className="font-medium">Posição:</span>
              <span className="ml-2 capitalize">{player.position}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderFormation = (players: Player[], isHome: boolean, teamName: string) => {
    const goalkeepers = getPlayersByPosition(players, 'goleiro');
    const defenders = getPlayersByPosition(players, 'zagueiro');
    const midfielders = getPlayersByPosition(players, 'meio-campo');
    const forwards = getPlayersByPosition(players, 'atacante');

    return (
      <div className="relative h-[500px] w-full">
        {/* Realistic Field Background with 3D effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-xl border-4 border-white shadow-2xl overflow-hidden">
          {/* Grass texture overlay */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full" style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.1) 20px,
                rgba(255,255,255,0.1) 22px
              )`
            }}></div>
          </div>
          
          {/* Field markings with shadows */}
          <div className="absolute inset-4 border-4 border-white rounded-lg shadow-inner">
            {/* Center line and circle */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-white transform -translate-y-0.5 shadow-sm"></div>
            <div className="absolute left-1/2 top-1/2 w-20 h-20 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-sm"></div>
            <div className="absolute left-1/2 top-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            
            {/* Goal areas with enhanced styling */}
            <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-32 h-16 border-4 border-white transform -translate-x-1/2 bg-white/10 shadow-sm`}></div>
            <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-20 h-10 border-4 border-white transform -translate-x-1/2 bg-white/15 shadow-sm`}></div>
            
            {/* Corner arcs */}
            <div className="absolute top-0 left-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-full"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-full"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-full"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-full"></div>
          </div>
        </div>

        {/* Enhanced Players Positioning */}
        <div className="absolute inset-0 p-6">
          {/* Goalkeepers */}
          <div className={`absolute ${isHome ? 'bottom-8' : 'top-8'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex justify-center">
              {goalkeepers.slice(0, 1).map(player => renderPlayerCard(player, isHome))}
            </div>
          </div>

          {/* Defenders */}
          <div className={`absolute ${isHome ? 'bottom-28' : 'top-28'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex justify-center space-x-8">
              {defenders.slice(0, 4).map((player, index) => (
                <div key={player.id} style={{ 
                  transform: `translateX(${(index - 1.5) * 60}px)` 
                }}>
                  {renderPlayerCard(player, isHome)}
                </div>
              ))}
            </div>
          </div>

          {/* Midfielders */}
          <div className={`absolute ${isHome ? 'bottom-52' : 'top-52'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex justify-center space-x-8">
              {midfielders.slice(0, 4).map((player, index) => (
                <div key={player.id} style={{ 
                  transform: `translateX(${(index - 1.5) * 60}px)` 
                }}>
                  {renderPlayerCard(player, isHome)}
                </div>
              ))}
            </div>
          </div>

          {/* Forwards */}
          <div className={`absolute ${isHome ? 'bottom-76' : 'top-76'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex justify-center space-x-12">
              {forwards.slice(0, 3).map((player, index) => (
                <div key={player.id} style={{ 
                  transform: `translateX(${(index - 1) * 60}px)` 
                }}>
                  {renderPlayerCard(player, isHome)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Team Badge */}
        <div className={`absolute ${isHome ? 'top-4' : 'bottom-4'} left-4`}>
          <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <Target className="h-4 w-4" />
            <Badge 
              variant={isHome ? 'default' : 'destructive'}
              className="font-bold shadow-sm"
            >
              {teamName}
            </Badge>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-96 bg-muted rounded animate-pulse"></div>
        <div className="h-96 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Home Team Field */}
      <Card className="bg-gradient-to-br from-blue-50/30 to-blue-100/20 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-700">
            <Target className="h-5 w-5" />
            <span>{homeTeamName} - Escalação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderFormation(homePlayers, true, homeTeamName)}
        </CardContent>
      </Card>

      {/* Away Team Field */}
      <Card className="bg-gradient-to-br from-red-50/30 to-red-100/20 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700">
            <Target className="h-5 w-5" />
            <span>{awayTeamName} - Escalação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderFormation(awayPlayers, false, awayTeamName)}
        </CardContent>
      </Card>
    </div>
  );
};
