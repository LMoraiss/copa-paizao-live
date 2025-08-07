import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Target, Shield, Zap, Crown } from 'lucide-react';

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
    return players.filter(player => {
      const playerPos = player.position.toLowerCase();
      const searchPos = position.toLowerCase();
      
      if (playerPos === searchPos) return true;
      if (searchPos === 'zagueiro' && (playerPos === 'lateral' || playerPos === 'zagueiro')) return true;
      
      return playerPos.includes(searchPos);
    });
  };

  const getPositionIcon = (position: string) => {
    const pos = position.toLowerCase();
    if (pos.includes('goleiro')) return <Crown className="h-4 w-4" />;
    if (pos.includes('zagueiro') || pos.includes('lateral')) return <Shield className="h-4 w-4" />;
    if (pos.includes('meio') || pos.includes('meia')) return <Target className="h-4 w-4" />;
    if (pos.includes('atacante')) return <Zap className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  };

  const renderPlayerCard = (player: Player, isHome: boolean) => (
    <Dialog key={player.id}>
      <DialogTrigger asChild>
        <div
          className={`relative group cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 ${
            isHome ? 'hover:drop-shadow-2xl' : 'hover:drop-shadow-2xl'
          }`}
        >
          {/* Player Card with enhanced 3D design */}
          <div className={`relative w-16 h-20 rounded-xl border-3 shadow-xl transition-all duration-300 group-hover:shadow-2xl overflow-hidden ${
            isHome 
              ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 border-blue-200 text-white' 
              : 'bg-gradient-to-br from-red-500 via-red-600 to-red-700 border-red-200 text-white'
          }`}>
            {/* Jersey number with glowing effect */}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shadow-lg ${
                isHome 
                  ? 'bg-white text-blue-700 ring-2 ring-blue-300' 
                  : 'bg-white text-red-700 ring-2 ring-red-300'
              }`}>
                {player.jersey_number}
              </div>
            </div>
            
            {/* Player name */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-full px-1">
              <div className="text-center">
                <div className="text-[9px] font-bold leading-tight text-white drop-shadow-lg">
                  {player.name.split(' ')[0]}
                </div>
                <div className="text-[8px] opacity-90 leading-tight">
                  {player.name.split(' ')[1]?.slice(0, 3)}
                </div>
              </div>
            </div>

            {/* Position indicator */}
            <div className="absolute top-1 right-1">
              <div className="text-white/80 text-xs">
                {getPositionIcon(player.position)}
              </div>
            </div>

            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/10 pointer-events-none"></div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
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
              <div className="flex items-center space-x-2">
                {getPositionIcon(player.position)}
                <p className="text-muted-foreground capitalize">{player.position}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderFormation = (players: Player[], isHome: boolean, teamName: string) => {
    const goalkeepers = getPlayersByPosition(players, 'goleiro').slice(0, 1);
    const defenders = getPlayersByPosition(players, 'zagueiro').slice(0, 4);
    const midfielders = getPlayersByPosition(players, 'meio-campo').slice(0, 4);
    const forwards = getPlayersByPosition(players, 'atacante').slice(0, 3);

    return (
      <div className="relative h-[600px] w-full overflow-hidden">
        {/* Stunning 3D Soccer Field */}
        <div className="absolute inset-0 rounded-2xl border-4 border-white shadow-2xl overflow-hidden"
             style={{
               background: `
                 linear-gradient(135deg, 
                   #22c55e 0%, 
                   #16a34a 25%, 
                   #15803d 50%, 
                   #166534 75%, 
                   #14532d 100%
                 )
               `
             }}>
          
          {/* Grass texture with realistic stripes */}
          <div className="absolute inset-0 opacity-30">
            <div 
              className="w-full h-full"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 20px,
                    rgba(255,255,255,0.1) 20px,
                    rgba(255,255,255,0.1) 22px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    rgba(0,0,0,0.05) 0px,
                    rgba(0,0,0,0.05) 100px,
                    transparent 100px,
                    transparent 120px
                  )
                `
              }}
            />
          </div>
          
          {/* Field markings with enhanced 3D effect */}
          <div className="absolute inset-6 border-4 border-white rounded-lg shadow-inner">
            {/* Center line with circle */}
            <div className="absolute inset-x-0 top-1/2 h-1 bg-white transform -translate-y-0.5 shadow-md z-10"></div>
            <div className="absolute left-1/2 top-1/2 w-24 h-24 border-4 border-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md z-10"></div>
            <div className="absolute left-1/2 top-1/2 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-md z-10"></div>
            
            {/* Goal areas with enhanced depth */}
            <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-40 h-20 border-4 border-white transform -translate-x-1/2 bg-white/10 shadow-lg z-10`}></div>
            <div className={`absolute ${isHome ? 'bottom-0' : 'top-0'} left-1/2 w-24 h-12 border-4 border-white transform -translate-x-1/2 bg-white/15 shadow-lg z-10`}></div>
            
            {/* Penalty spots */}
            <div className={`absolute ${isHome ? 'bottom-16' : 'top-16'} left-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 shadow-md z-10`}></div>
            
            {/* Corner arcs with glow */}
            <div className="absolute top-0 left-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-full shadow-md"></div>
            <div className="absolute top-0 right-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-full shadow-md"></div>
            <div className="absolute bottom-0 left-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-full shadow-md"></div>
            <div className="absolute bottom-0 right-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-full shadow-md"></div>
          </div>

          {/* Atmospheric lighting effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none"></div>
        </div>

        {/* Smart Player Positioning System */}
        <div className="absolute inset-0 p-8 z-20">
          {/* Goalkeepers */}
          {goalkeepers.length > 0 && (
            <div className={`absolute ${isHome ? 'bottom-8' : 'top-8'} left-1/2 transform -translate-x-1/2`}>
              <div className="flex justify-center">
                {goalkeepers.map(player => renderPlayerCard(player, isHome))}
              </div>
            </div>
          )}

          {/* Defenders */}
          {defenders.length > 0 && (
            <div className={`absolute ${isHome ? 'bottom-24' : 'top-24'} left-1/2 transform -translate-x-1/2`}>
              <div className="flex justify-center items-center space-x-6" style={{ width: '350px' }}>
                {defenders.map((player, index) => (
                  <div key={player.id} className="flex-shrink-0">
                    {renderPlayerCard(player, isHome)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Midfielders */}
          {midfielders.length > 0 && (
            <div className={`absolute ${isHome ? 'bottom-48' : 'top-48'} left-1/2 transform -translate-x-1/2`}>
              <div className="flex justify-center items-center space-x-5" style={{ width: '300px' }}>
                {midfielders.map((player, index) => (
                  <div key={player.id} className="flex-shrink-0">
                    {renderPlayerCard(player, isHome)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forwards */}
          {forwards.length > 0 && (
            <div className={`absolute ${isHome ? 'bottom-72' : 'top-72'} left-1/2 transform -translate-x-1/2`}>
              <div className="flex justify-center items-center space-x-8" style={{ width: '250px' }}>
                {forwards.map((player, index) => (
                  <div key={player.id} className="flex-shrink-0">
                    {renderPlayerCard(player, isHome)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No players message */}
          {players.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-center bg-black/60 backdrop-blur-md rounded-xl p-6 shadow-2xl border border-white/20">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-70" />
                <p className="text-lg font-semibold">Nenhum jogador cadastrado</p>
                <p className="text-sm opacity-80 mt-1">A escalação aparecerá aqui</p>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Team Badge with glassmorphism */}
        <div className={`absolute ${isHome ? 'top-6' : 'bottom-6'} left-6 z-30`}>
          <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-lg rounded-2xl px-4 py-3 shadow-xl border border-white/30">
            <Target className="h-5 w-5 text-white drop-shadow-lg" />
            <Badge 
              variant={isHome ? 'default' : 'destructive'}
              className="font-bold text-sm shadow-lg border-white/30"
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
      <div className="space-y-6">
        <div className="h-[600px] bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl animate-pulse"></div>
        <div className="h-[600px] bg-gradient-to-br from-muted/30 to-muted/60 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Home Team Field */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-50/50 to-blue-100/30 border-blue-200/60 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-blue-700/10 border-b border-blue-200/50">
          <CardTitle className="flex items-center space-x-3 text-blue-800">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <span className="text-xl font-bold">{homeTeamName} - Escalação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderFormation(homePlayers, true, homeTeamName)}
        </CardContent>
      </Card>

      {/* Away Team Field */}
      <Card className="overflow-hidden bg-gradient-to-br from-red-50/50 to-red-100/30 border-red-200/60 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-red-600/10 to-red-700/10 border-b border-red-200/50">
          <CardTitle className="flex items-center space-x-3 text-red-800">
            <div className="p-2 bg-red-100 rounded-lg">
              <Target className="h-5 w-5 text-red-600" />
            </div>
            <span className="text-xl font-bold">{awayTeamName} - Escalação</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {renderFormation(awayPlayers, false, awayTeamName)}
        </CardContent>
      </Card>
    </div>
  );
};
