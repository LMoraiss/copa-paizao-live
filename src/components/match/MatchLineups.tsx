import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

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
    <div
      key={player.id}
      className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
        isHome 
          ? 'bg-blue-50 border-blue-200 text-blue-900' 
          : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mb-1 ${
        isHome ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
      }`}>
        {player.jersey_number}
      </div>
      <span className="text-xs font-medium text-center leading-tight">
        {player.name}
      </span>
    </div>
  );

  const renderFormation = (players: Player[], isHome: boolean, teamName: string) => {
    const goalkeepers = getPlayersByPosition(players, 'goalkeeper');
    const defenders = getPlayersByPosition(players, 'defender');
    const midfielders = getPlayersByPosition(players, 'midfielder');
    const forwards = getPlayersByPosition(players, 'forward');

    return (
      <div className="relative h-96 w-full">
        {/* Field Background */}
        <div className={`absolute inset-0 bg-gradient-to-b ${
          isHome 
            ? 'from-green-200 to-green-300' 
            : 'from-green-300 to-green-200'
        } rounded-lg border-2 border-white`}>
          {/* Field Lines */}
          <div className="absolute inset-x-0 top-1/2 h-0.5 bg-white transform -translate-y-0.5"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-0.5"></div>
          
          {/* Center Circle */}
          <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          {/* Goal Areas */}
          <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-24 h-12 border-2 border-white transform -translate-x-1/2`}></div>
          <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-16 h-8 border-2 border-white transform -translate-x-1/2`}></div>
        </div>

        {/* Players Positioning */}
        <div className="absolute inset-0 p-4">
          {/* Goalkeepers */}
          <div className={`absolute ${isHome ? 'bottom-4' : 'top-4'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex space-x-2">
              {goalkeepers.slice(0, 1).map(player => renderPlayerCard(player, isHome))}
            </div>
          </div>

          {/* Defenders */}
          <div className={`absolute ${isHome ? 'bottom-16' : 'top-16'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex space-x-4">
              {defenders.slice(0, 4).map(player => renderPlayerCard(player, isHome))}
            </div>
          </div>

          {/* Midfielders */}
          <div className={`absolute ${isHome ? 'bottom-32' : 'top-32'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex space-x-4">
              {midfielders.slice(0, 4).map(player => renderPlayerCard(player, isHome))}
            </div>
          </div>

          {/* Forwards */}
          <div className={`absolute ${isHome ? 'bottom-48' : 'top-48'} left-1/2 transform -translate-x-1/2`}>
            <div className="flex space-x-4">
              {forwards.slice(0, 3).map(player => renderPlayerCard(player, isHome))}
            </div>
          </div>
        </div>

        {/* Team Name */}
        <div className={`absolute ${isHome ? 'top-2' : 'bottom-2'} left-2`}>
          <Badge variant={isHome ? 'default' : 'destructive'}>
            {teamName}
          </Badge>
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
    <div className="space-y-6">
      {/* Home Team Field */}
      <Card>
        <CardHeader>
          <CardTitle className="text-blue-700">{homeTeamName} - Escalação</CardTitle>
        </CardHeader>
        <CardContent>
          {renderFormation(homePlayers, true, homeTeamName)}
        </CardContent>
      </Card>

      {/* Away Team Field */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-700">{awayTeamName} - Escalação</CardTitle>
        </CardHeader>
        <CardContent>
          {renderFormation(awayPlayers, false, awayTeamName)}
        </CardContent>
      </Card>
    </div>
  );
};
