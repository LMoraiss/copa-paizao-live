import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Edit2, Save, X, Trophy } from 'lucide-react';

interface TeamStanding {
  team_id: string;
  team_name: string;
  team_logo: string | null;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export const StandingsManager = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<TeamStanding>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url');

      if (teamsError) throw teamsError;

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('status', 'finished')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);

      if (matchesError) throw matchesError;

      const standingsMap = new Map<string, TeamStanding>();

      teams.forEach(team => {
        standingsMap.set(team.id, {
          team_id: team.id,
          team_name: team.name,
          team_logo: team.logo_url,
          matches_played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0
        });
      });

      matches.forEach(match => {
        const homeTeam = standingsMap.get(match.home_team_id);
        const awayTeam = standingsMap.get(match.away_team_id);

        if (!homeTeam || !awayTeam) return;

        homeTeam.matches_played++;
        awayTeam.matches_played++;

        homeTeam.goals_for += match.home_score;
        homeTeam.goals_against += match.away_score;
        awayTeam.goals_for += match.away_score;
        awayTeam.goals_against += match.home_score;

        if (match.home_score > match.away_score) {
          homeTeam.wins++;
          homeTeam.points += 3;
          awayTeam.losses++;
        } else if (match.home_score < match.away_score) {
          awayTeam.wins++;
          awayTeam.points += 3;
          homeTeam.losses++;
        } else {
          homeTeam.draws++;
          awayTeam.draws++;
          homeTeam.points++;
          awayTeam.points++;
        }

        homeTeam.goal_difference = homeTeam.goals_for - homeTeam.goals_against;
        awayTeam.goal_difference = awayTeam.goals_for - awayTeam.goals_against;
      });

      const standingsArray = Array.from(standingsMap.values())
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
          return b.goals_for - a.goals_for;
        });

      setStandings(standingsArray);
    } catch (error) {
      console.error('Error fetching standings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a classificação.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (team: TeamStanding) => {
    setEditingTeam(team.team_id);
    setEditData(team);
  };

  const cancelEdit = () => {
    setEditingTeam(null);
    setEditData({});
  };

  const saveEdit = async () => {
    if (!editingTeam || !editData) return;

    try {
      // Here you would typically save to a standings table
      // For now, we'll just update the local state
      setStandings(prev => prev.map(team => 
        team.team_id === editingTeam 
          ? { ...team, ...editData }
          : team
      ));
      
      toast({
        title: "Sucesso",
        description: "Classificação atualizada com sucesso!",
      });
      
      setEditingTeam(null);
      setEditData({});
    } catch (error) {
      console.error('Error updating standings:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a classificação.",
        variant: "destructive",
      });
    }
  };

  const updateField = (field: keyof TeamStanding, value: string) => {
    const numericFields = ['matches_played', 'wins', 'draws', 'losses', 'goals_for', 'goals_against', 'points'];
    setEditData(prev => ({
      ...prev,
      [field]: numericFields.includes(field) ? parseInt(value) || 0 : value
    }));
    
    // Recalculate goal difference if goals change
    if (field === 'goals_for' || field === 'goals_against') {
      const goalsFor = field === 'goals_for' ? (parseInt(value) || 0) : (editData.goals_for || 0);
      const goalsAgainst = field === 'goals_against' ? (parseInt(value) || 0) : (editData.goals_against || 0);
      setEditData(prev => ({
        ...prev,
        goal_difference: goalsFor - goalsAgainst
      }));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Gerenciar Classificação</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Pos</TableHead>
                <TableHead>Time</TableHead>
                <TableHead className="text-center">J</TableHead>
                <TableHead className="text-center">V</TableHead>
                <TableHead className="text-center">E</TableHead>
                <TableHead className="text-center">D</TableHead>
                <TableHead className="text-center">GP</TableHead>
                <TableHead className="text-center">GC</TableHead>
                <TableHead className="text-center">SG</TableHead>
                <TableHead className="text-center">PTS</TableHead>
                <TableHead className="w-16">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {standings.map((team, index) => (
                <TableRow key={team.team_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      {team.team_logo && (
                        <img 
                          src={team.team_logo} 
                          alt={team.team_name}
                          className="w-6 h-6 object-contain"
                        />
                      )}
                      <span className="font-medium">{team.team_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.matches_played}
                        onChange={(e) => updateField('matches_played', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.matches_played
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.wins}
                        onChange={(e) => updateField('wins', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.wins
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.draws}
                        onChange={(e) => updateField('draws', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.draws
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.losses}
                        onChange={(e) => updateField('losses', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.losses
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.goals_for}
                        onChange={(e) => updateField('goals_for', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.goals_for
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.goals_against}
                        onChange={(e) => updateField('goals_against', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      team.goals_against
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={
                      team.goal_difference > 0 ? 'text-green-600' :
                      team.goal_difference < 0 ? 'text-red-600' : 'text-gray-600'
                    }>
                      {team.goal_difference > 0 ? '+' : ''}{editingTeam === team.team_id ? editData.goal_difference : team.goal_difference}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {editingTeam === team.team_id ? (
                      <Input
                        type="number"
                        value={editData.points}
                        onChange={(e) => updateField('points', e.target.value)}
                        className="w-16 h-8"
                      />
                    ) : (
                      <span className="font-bold">{team.points}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingTeam === team.team_id ? (
                      <div className="flex space-x-1">
                        <Button size="sm" onClick={saveEdit}>
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEdit(team)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};