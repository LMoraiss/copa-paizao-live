import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, Clock, Target, AlertTriangle, RotateCcw, Pause, PlayCircle, Timer, Circle, CreditCard, ArrowUpDown, Undo2 } from 'lucide-react';
import { MatchMediaUpload } from './MatchMediaUpload';

interface Match {
  id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
  home_team: { id: string; name: string };
  away_team: { id: string; name: string };
}

interface Player {
  id: string;
  name: string;
  team_id: string;
}

interface MatchControlPanelProps {
  match: Match;
  onUpdate: () => void;
}

export const MatchControlPanel = ({ match, onUpdate }: MatchControlPanelProps) => {
  const [eventType, setEventType] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [currentMinute, setCurrentMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(match.home_score?.toString() || '0');
  const [awayScore, setAwayScore] = useState(match.away_score?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [matchPhase, setMatchPhase] = useState<'first_half' | 'halftime' | 'second_half'>('first_half');
  const [isMatchRunning, setIsMatchRunning] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [extraTime, setExtraTime] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (match.status === 'live') {
      fetchPlayers();
    }
  }, [match.status]);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, team_id')
        .in('team_id', [match.home_team_id, match.away_team_id]);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const startMatch = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'live',
          home_score: 0,
          away_score: 0
        })
        .eq('id', match.id);

      if (error) throw error;

      // Add kickoff event
      await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: 'kickoff',
          minute: 0,
          description: 'Início da partida'
        });

      toast({
        title: "Sucesso",
        description: "Partida iniciada!",
      });
      onUpdate();
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a partida.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const endMatch = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status: 'finished' })
        .eq('id', match.id);

      if (error) throw error;

      // Add fulltime event
      await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: 'fulltime',
          minute: 90,
          description: 'Fim da partida'
        });

      toast({
        title: "Sucesso",
        description: "Partida finalizada!",
      });
      onUpdate();
    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: "Erro",
        description: "Não foi possível finalizar a partida.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateScore = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          home_score: parseInt(homeScore),
          away_score: parseInt(awayScore)
        })
        .eq('id', match.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Placar atualizado!",
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating score:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o placar.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addEvent = async (type: string) => {
    if (!selectedTeam || !selectedPlayer) {
      toast({
        title: "Erro",
        description: "Selecione o time e o jogador.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First, add the event
      const { error: eventError } = await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: type,
          minute: currentMinute,
          player_id: selectedPlayer,
          description: null
        });

      if (eventError) throw eventError;

      // If it's a goal, automatically update the score
      if (type === 'goal') {
        const isHomeTeam = selectedTeam === match.home_team_id;
        const newHomeScore = isHomeTeam ? (match.home_score || 0) + 1 : (match.home_score || 0);
        const newAwayScore = !isHomeTeam ? (match.away_score || 0) + 1 : (match.away_score || 0);

        const { error: scoreError } = await supabase
          .from('matches')
          .update({ 
            home_score: newHomeScore,
            away_score: newAwayScore
          })
          .eq('id', match.id);

        if (scoreError) throw scoreError;

        // Update local state
        setHomeScore(newHomeScore.toString());
        setAwayScore(newAwayScore.toString());
      }

      // Show animated feedback
      const eventLabels = {
        goal: 'Gol',
        yellow_card: 'Cartão Amarelo',
        red_card: 'Cartão Vermelho',
        substitution: 'Substituição'
      };

      toast({
        title: "Evento Registrado!",
        description: `${eventLabels[type as keyof typeof eventLabels]} registrado${type === 'goal' ? ' e placar atualizado' : ''}!`,
      });
      
      setIsEventDialogOpen(false);
      setSelectedTeam('');
      setSelectedPlayer('');
      onUpdate();
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o evento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeGoalEvent = async (eventId: string, isHomeTeam: boolean) => {
    setLoading(true);
    try {
      // Remove the event
      const { error: eventError } = await supabase
        .from('match_events')
        .delete()
        .eq('id', eventId);

      if (eventError) throw eventError;

      // Update the score
      const newHomeScore = isHomeTeam ? Math.max(0, (match.home_score || 0) - 1) : (match.home_score || 0);
      const newAwayScore = !isHomeTeam ? Math.max(0, (match.away_score || 0) - 1) : (match.away_score || 0);

      const { error: scoreError } = await supabase
        .from('matches')
        .update({ 
          home_score: newHomeScore,
          away_score: newAwayScore
        })
        .eq('id', match.id);

      if (scoreError) throw scoreError;

      // Update local state
      setHomeScore(newHomeScore.toString());
      setAwayScore(newAwayScore.toString());

      toast({
        title: "Gol Anulado!",
        description: "Evento removido e placar atualizado.",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error removing goal:', error);
      toast({
        title: "Erro",
        description: "Não foi possível anular o gol.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleMatchTimer = () => {
    setIsMatchRunning(!isMatchRunning);
    if (!isMatchRunning) {
      // Start timer
      const interval = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 60000); // Update every minute
      
      // Store interval ID to clear later
      (window as any).matchTimer = interval;
    } else {
      // Stop timer
      if ((window as any).matchTimer) {
        clearInterval((window as any).matchTimer);
      }
    }
  };

  const endHalf = async () => {
    if (matchPhase === 'first_half') {
      // Add halftime event
      await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: 'halftime',
          minute: 45 + extraTime,
          description: 'Fim do primeiro tempo'
        });

      setMatchPhase('halftime');
      setIsMatchRunning(false);
      setExtraTime(0); // Reset extra time
      if ((window as any).matchTimer) {
        clearInterval((window as any).matchTimer);
      }
      toast({
        title: "Fim do 1º Tempo",
        description: "Intervalo iniciado.",
      });
    } else if (matchPhase === 'second_half') {
      // Add fulltime event
      await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: 'fulltime',
          minute: 90 + extraTime,
          description: 'Fim da partida'
        });
      
      endMatch();
    }
  };

  const startSecondHalf = () => {
    setMatchPhase('second_half');
    setCurrentMinute(45);
    toast({
      title: "2º Tempo Iniciado",
      description: "Segundo tempo em andamento.",
    });
  };

  const getMatchTimer = () => {
    if (matchPhase === 'halftime') return 'Intervalo';
    const half = matchPhase === 'first_half' ? '1º Tempo' : '2º Tempo';
    const displayMinute = matchPhase === 'second_half' ? currentMinute - 45 : currentMinute;
    const extraDisplay = extraTime > 0 ? ` +${extraTime}` : '';
    return `${half} - ${displayMinute}'${extraDisplay}`;
  };

  const getTeamPlayers = (teamId: string) => {
    return players.filter(player => player.team_id === teamId);
  };

  const EventButton = ({ type, icon, label, color }: { type: string; icon: React.ReactNode; label: string; color: string }) => (
    <Dialog open={isEventDialogOpen && eventType === type} onOpenChange={(open) => {
      setIsEventDialogOpen(open);
      if (open) setEventType(type);
      if (!open) setEventType('');
    }}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={`flex-1 h-20 flex flex-col items-center space-y-2 ${color} transition-all hover:scale-105`}
          disabled={match.status !== 'live'}
        >
          <div className="text-2xl">{icon}</div>
          <span className="text-sm font-medium">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {icon}
            <span>Registrar {label}</span>
          </DialogTitle>
        </DialogHeader>
        
        {type === 'substitution' ? (
          <SubstitutionForm />
        ) : (
          <StandardEventForm type={type} />
        )}
      </DialogContent>
    </Dialog>
  );

  const StandardEventForm = ({ type }: { type: string }) => (
    <div className="space-y-4">
      <div>
        <Label>Time</Label>
        <Select value={selectedTeam} onValueChange={setSelectedTeam}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={match.home_team_id}>{match.home_team.name}</SelectItem>
            <SelectItem value={match.away_team_id}>{match.away_team.name}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {selectedTeam && (
        <div>
          <Label>Jogador</Label>
          <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o jogador" />
            </SelectTrigger>
            <SelectContent>
              {getTeamPlayers(selectedTeam).map(player => (
                <SelectItem key={player.id} value={player.id}>
                  {player.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="flex items-center justify-between pt-4">
        <span className="text-sm text-muted-foreground">
          Minuto: {currentMinute}'
        </span>
        <Button 
          onClick={() => addEvent(type)} 
          disabled={loading || !selectedTeam || !selectedPlayer}
          className="flex items-center space-x-2"
        >
          {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
          <span>Confirmar</span>
        </Button>
      </div>
    </div>
  );

  const SubstitutionForm = () => {
    const [playerOut, setPlayerOut] = useState('');
    const [playerIn, setPlayerIn] = useState('');

    return (
      <div className="space-y-4">
        <div>
          <Label>Time</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={match.home_team_id}>{match.home_team.name}</SelectItem>
              <SelectItem value={match.away_team_id}>{match.away_team.name}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedTeam && (
          <>
            <div>
              <Label>Jogador que sai</Label>
              <Select value={playerOut} onValueChange={setPlayerOut}>
                <SelectTrigger>
                  <SelectValue placeholder="Jogador que deixa o campo" />
                </SelectTrigger>
                <SelectContent>
                  {getTeamPlayers(selectedTeam).map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Jogador que entra</Label>
              <Select value={playerIn} onValueChange={setPlayerIn}>
                <SelectTrigger>
                  <SelectValue placeholder="Jogador que entra em campo" />
                </SelectTrigger>
                <SelectContent>
                  {getTeamPlayers(selectedTeam).filter(p => p.id !== playerOut).map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-muted-foreground">
            Minuto: {currentMinute}'
          </span>
          <Button 
            onClick={() => addSubstitution(playerOut, playerIn)} 
            disabled={loading || !selectedTeam || !playerOut || !playerIn}
            className="flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>Confirmar Substituição</span>
          </Button>
        </div>
      </div>
    );
  };

  const addSubstitution = async (playerOutId: string, playerInId: string) => {
    setLoading(true);
    try {
      const playerOutName = players.find(p => p.id === playerOutId)?.name || '';
      const playerInName = players.find(p => p.id === playerInId)?.name || '';
      
      const { error } = await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: 'substitution',
          minute: currentMinute,
          player_id: playerOutId,
          description: `${playerOutName} → ${playerInName}`
        });

      if (error) throw error;

      toast({
        title: "Substituição Registrada!",
        description: `${playerOutName} foi substituído por ${playerInName}`,
      });
      
      setIsEventDialogOpen(false);
      setSelectedTeam('');
      setSelectedPlayer('');
      onUpdate();
    } catch (error) {
      console.error('Error adding substitution:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a substituição.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Timer className="h-5 w-5" />
            <span>Painel de Controle da Partida</span>
          </CardTitle>
          {match.status === 'live' && (
            <div className="flex items-center space-x-4">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold text-lg">
                {getMatchTimer()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={isMatchRunning ? "destructive" : "default"}
                  onClick={toggleMatchTimer}
                  className="flex items-center space-x-1"
                >
                  {isMatchRunning ? <Pause className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  <span>{isMatchRunning ? 'Pausar' : 'Iniciar'}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Controls */}
        <div className="flex space-x-4">
          {match.status === 'scheduled' && (
            <Button 
              onClick={startMatch} 
              disabled={loading} 
              size="lg"
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Play className="h-5 w-5" />
              <span>Iniciar Partida</span>
            </Button>
          )}
          
          {match.status === 'live' && (
            <div className="flex space-x-3">
              {matchPhase === 'halftime' && (
                <Button 
                  onClick={startSecondHalf} 
                  disabled={loading}
                  size="lg"
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <PlayCircle className="h-5 w-5" />
                  <span>Iniciar 2º Tempo</span>
                </Button>
              )}
              
              <Button 
                onClick={endHalf} 
                disabled={loading}
                size="lg"
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>{matchPhase === 'first_half' ? 'Finalizar 1º Tempo' : 'Finalizar Partida'}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Match Events - Beautiful Buttons */}
        {match.status === 'live' && matchPhase !== 'halftime' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Eventos da Partida</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <EventButton 
                type="goal" 
                icon={<Circle className="h-6 w-6" />}
                label="Gol" 
                color="hover:bg-green-50 hover:border-green-300"
              />
              <EventButton 
                type="yellow_card" 
                icon={<CreditCard className="h-6 w-6 text-yellow-500" />}
                label="Cartão Amarelo" 
                color="hover:bg-yellow-50 hover:border-yellow-300"
              />
              <EventButton 
                type="red_card" 
                icon={<CreditCard className="h-6 w-6 text-red-500" />}
                label="Cartão Vermelho" 
                color="hover:bg-red-50 hover:border-red-300"
              />
              <EventButton 
                type="substitution" 
                icon={<ArrowUpDown className="h-6 w-6" />}
                label="Substituição" 
                color="hover:bg-blue-50 hover:border-blue-300"
              />
            </div>
          </div>
        )}

        {/* Extra Time Control */}
        {match.status === 'live' && matchPhase !== 'halftime' && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Tempo Extra</h3>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Label htmlFor="extraTime">Minutos Extras</Label>
                <Input
                  id="extraTime"
                  type="number"
                  value={extraTime}
                  onChange={(e) => setExtraTime(parseInt(e.target.value) || 0)}
                  min="0"
                  max="15"
                  className="text-center"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setExtraTime(0)}
                size="sm"
              >
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Media Upload */}
        {match.status === 'live' && (
          <MatchMediaUpload 
            matchId={match.id} 
            onMediaAdded={onUpdate}
          />
        )}

        {/* Score Update */}
        {match.status === 'live' && (
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Atualizar Placar</h3>
            <div className="grid grid-cols-3 gap-4 items-end">
              <div>
                <Label htmlFor="homeScore" className="font-medium">{match.home_team.name}</Label>
                <Input
                  id="homeScore"
                  type="number"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  min="0"
                  className="text-center text-lg font-bold"
                />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-muted-foreground mb-2">VS</div>
              </div>
              <div>
                <Label htmlFor="awayScore" className="font-medium">{match.away_team.name}</Label>
                <Input
                  id="awayScore"
                  type="number"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  min="0"
                  className="text-center text-lg font-bold"
                />
              </div>
            </div>
            <Button 
              onClick={updateScore} 
              disabled={loading} 
              className="w-full mt-4"
              size="lg"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
              Atualizar Placar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};