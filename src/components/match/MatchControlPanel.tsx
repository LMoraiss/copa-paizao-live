import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Play, Square, Clock } from 'lucide-react';

interface Match {
  id: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  home_team_id: string;
  away_team_id: string;
}

interface MatchControlPanelProps {
  match: Match;
  onUpdate: () => void;
}

export const MatchControlPanel = ({ match, onUpdate }: MatchControlPanelProps) => {
  const [eventType, setEventType] = useState('');
  const [minute, setMinute] = useState('');
  const [description, setDescription] = useState('');
  const [homeScore, setHomeScore] = useState(match.home_score?.toString() || '0');
  const [awayScore, setAwayScore] = useState(match.away_score?.toString() || '0');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const addEvent = async () => {
    if (!eventType || !minute) {
      toast({
        title: "Erro",
        description: "Preencha o tipo de evento e o minuto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('match_events')
        .insert({
          match_id: match.id,
          event_type: eventType,
          minute: parseInt(minute),
          description: description || null
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento adicionado!",
      });
      
      setEventType('');
      setMinute('');
      setDescription('');
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

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Painel de Controle da Partida</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Match Controls */}
        <div className="flex space-x-4">
          {match.status === 'scheduled' && (
            <Button onClick={startMatch} disabled={loading} className="flex items-center space-x-2">
              <Play className="h-4 w-4" />
              <span>Iniciar Partida</span>
            </Button>
          )}
          
          {match.status === 'live' && (
            <Button onClick={endMatch} disabled={loading} variant="destructive" className="flex items-center space-x-2">
              <Square className="h-4 w-4" />
              <span>Finalizar Partida</span>
            </Button>
          )}
        </div>

        {/* Score Update */}
        {match.status === 'live' && (
          <div className="grid grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="homeScore">Placar Casa</Label>
              <Input
                id="homeScore"
                type="number"
                value={homeScore}
                onChange={(e) => setHomeScore(e.target.value)}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="awayScore">Placar Visitante</Label>
              <Input
                id="awayScore"
                type="number"
                value={awayScore}
                onChange={(e) => setAwayScore(e.target.value)}
                min="0"
              />
            </div>
            <Button onClick={updateScore} disabled={loading}>
              Atualizar Placar
            </Button>
          </div>
        )}

        {/* Event Addition */}
        {match.status === 'live' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goal">Gol</SelectItem>
                    <SelectItem value="yellow_card">Cartão Amarelo</SelectItem>
                    <SelectItem value="red_card">Cartão Vermelho</SelectItem>
                    <SelectItem value="substitution">Substituição</SelectItem>
                    <SelectItem value="corner">Escanteio</SelectItem>
                    <SelectItem value="halftime">Intervalo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="minute">Minuto</Label>
                <Input
                  id="minute"
                  type="number"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  placeholder="Ex: 45"
                  min="0"
                  max="120"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhes do evento..."
                  rows={3}
                />
              </div>
              
              <Button onClick={addEvent} disabled={loading} className="w-full">
                Adicionar Evento
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};