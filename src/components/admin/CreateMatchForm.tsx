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

interface Match {
  id?: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  location?: string;
  stage: string;
  status?: string;
  home_score?: number;
  away_score?: number;
}

interface CreateMatchFormProps {
  match?: Match;
  onSuccess: () => void;
  onCancel?: () => void;
}

const stages = [
  'Fase de Grupos',
  'Oitavas de Final',
  'Quartas de Final',
  'Semifinal',
  'Final'
];

const statuses = [
  'scheduled',
  'live',
  'finished',
  'postponed'
];

export const CreateMatchForm = ({ match, onSuccess, onCancel }: CreateMatchFormProps) => {
  const [homeTeamId, setHomeTeamId] = useState(match?.home_team_id || '');
  const [awayTeamId, setAwayTeamId] = useState(match?.away_team_id || '');
  const [matchDate, setMatchDate] = useState(
    match?.match_date ? new Date(match.match_date).toISOString().slice(0, 16) : ''
  );
  const [location, setLocation] = useState(match?.location || '');
  const [stage, setStage] = useState(match?.stage || '');
  const [status, setStatus] = useState(match?.status || 'scheduled');
  const [homeScore, setHomeScore] = useState(match?.home_score?.toString() || '');
  const [awayScore, setAwayScore] = useState(match?.away_score?.toString() || '');
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!match;

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
    
    if (!homeTeamId || !awayTeamId || !matchDate || !stage) {
      toast({
        title: "Erro",
        description: "Todos os campos obrigatórios devem ser preenchidos.",
        variant: "destructive",
      });
      return;
    }

    if (homeTeamId === awayTeamId) {
      toast({
        title: "Erro",
        description: "Um time não pode jogar contra si mesmo.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const matchData = {
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: new Date(matchDate).toISOString(),
        location: location.trim() || null,
        stage,
        status,
        home_score: homeScore ? parseInt(homeScore) : 0,
        away_score: awayScore ? parseInt(awayScore) : 0
      };

      if (isEditing) {
        const { error } = await supabase
          .from('matches')
          .update(matchData)
          .eq('id', match.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Partida atualizada com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('matches')
          .insert([matchData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Partida criada com sucesso!",
        });
      }

      // Reset form
      setHomeTeamId('');
      setAwayTeamId('');
      setMatchDate('');
      setLocation('');
      setStage('');
      setStatus('scheduled');
      setHomeScore('');
      setAwayScore('');
      onSuccess();
    } catch (error) {
      console.error('Error saving match:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${isEditing ? 'atualizar' : 'criar'} a partida.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{isEditing ? 'Editar Partida' : 'Criar Nova Partida'}</CardTitle>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="homeTeam">Time da Casa</Label>
              <Select value={homeTeamId} onValueChange={setHomeTeamId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time da casa" />
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
              <Label htmlFor="awayTeam">Time Visitante</Label>
              <Select value={awayTeamId} onValueChange={setAwayTeamId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o time visitante" />
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
          </div>

          <div>
            <Label htmlFor="matchDate">Data e Hora</Label>
            <Input
              id="matchDate"
              type="datetime-local"
              value={matchDate}
              onChange={(e) => setMatchDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="location">Local (opcional)</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Estádio Maracanã"
            />
          </div>

          <div>
            <Label htmlFor="stage">Fase</Label>
            <Select value={stage} onValueChange={setStage} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stageOption) => (
                  <SelectItem key={stageOption} value={stageOption}>
                    {stageOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="live">Ao Vivo</SelectItem>
                <SelectItem value="finished">Finalizada</SelectItem>
                <SelectItem value="postponed">Adiada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(status === 'finished' || status === 'live') && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="homeScore">Gols Casa</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(e.target.value)}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="awayScore">Gols Visitante</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Atualizar' : 'Criar'} Partida
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