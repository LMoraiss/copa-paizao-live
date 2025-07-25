import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export const Standings = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      // Get all teams first
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url');

      if (teamsError) throw teamsError;

      // Get all finished matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .eq('status', 'finished')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);

      if (matchesError) throw matchesError;

      // Calculate standings
      const standingsMap = new Map<string, TeamStanding>();

      // Initialize all teams
      teams?.forEach(team => {
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
          points: 0,
        });
      });

      // Process matches
      matches?.forEach(match => {
        const homeTeam = standingsMap.get(match.home_team_id);
        const awayTeam = standingsMap.get(match.away_team_id);

        if (homeTeam && awayTeam) {
          const homeScore = match.home_score || 0;
          const awayScore = match.away_score || 0;

          // Update matches played
          homeTeam.matches_played++;
          awayTeam.matches_played++;

          // Update goals
          homeTeam.goals_for += homeScore;
          homeTeam.goals_against += awayScore;
          awayTeam.goals_for += awayScore;
          awayTeam.goals_against += homeScore;

          // Update results
          if (homeScore > awayScore) {
            homeTeam.wins++;
            homeTeam.points += 3;
            awayTeam.losses++;
          } else if (homeScore < awayScore) {
            awayTeam.wins++;
            awayTeam.points += 3;
            homeTeam.losses++;
          } else {
            homeTeam.draws++;
            awayTeam.draws++;
            homeTeam.points += 1;
            awayTeam.points += 1;
          }

          // Update goal difference
          homeTeam.goal_difference = homeTeam.goals_for - homeTeam.goals_against;
          awayTeam.goal_difference = awayTeam.goals_for - awayTeam.goals_against;
        }
      });

      // Sort standings by points, then goal difference, then goals for
      const sortedStandings = Array.from(standingsMap.values()).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference;
        return b.goals_for - a.goals_for;
      });

      setStandings(sortedStandings);
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

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-4 w-4 text-yellow-500" />;
    if (position <= 3) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (position >= standings.length - 2) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-96 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Classificação</h1>
        <p className="text-muted-foreground">Classificação geral da Copa Paizão</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Tabela de Classificação</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {standings.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum dado disponível</h3>
              <p className="text-muted-foreground">
                A classificação aparecerá quando as partidas forem finalizadas.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Pos</th>
                    <th className="text-left p-2">Time</th>
                    <th className="text-center p-2">PJ</th>
                    <th className="text-center p-2">V</th>
                    <th className="text-center p-2">E</th>
                    <th className="text-center p-2">D</th>
                    <th className="text-center p-2">GP</th>
                    <th className="text-center p-2">GC</th>
                    <th className="text-center p-2">SG</th>
                    <th className="text-center p-2 font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => (
                    <tr key={team.team_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{index + 1}</span>
                          {getPositionIcon(index + 1)}
                        </div>
                      </td>
                      <td className="p-2">
                        <Link 
                          to={`/teams/${team.team_id}`}
                          className="flex items-center space-x-3 hover:text-primary transition-colors font-medium"
                        >
                          {team.team_logo && (
                            <img 
                              src={team.team_logo} 
                              alt={team.team_name}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                          <span>{team.team_name}</span>
                        </Link>
                      </td>
                      <td className="text-center p-2">{team.matches_played}</td>
                      <td className="text-center p-2 text-green-600">{team.wins}</td>
                      <td className="text-center p-2 text-yellow-600">{team.draws}</td>
                      <td className="text-center p-2 text-red-600">{team.losses}</td>
                      <td className="text-center p-2">{team.goals_for}</td>
                      <td className="text-center p-2">{team.goals_against}</td>
                      <td className="text-center p-2">
                        <span className={team.goal_difference >= 0 ? "text-green-600" : "text-red-600"}>
                          {team.goal_difference >= 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="text-center p-2 font-bold text-primary">{team.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};