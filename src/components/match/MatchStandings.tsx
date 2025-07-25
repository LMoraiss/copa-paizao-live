import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

export const MatchStandings = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStandings();
  }, []);

  const fetchStandings = async () => {
    try {
      // Get all teams
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url');

      if (teamsError) throw teamsError;

      // Get all finished matches
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('home_team_id, away_team_id, home_score, away_score')
        .eq('status', 'finished')
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);

      if (matchesError) throw matchesError;

      // Calculate standings
      const standingsMap = new Map<string, TeamStanding>();

      // Initialize all teams
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

      // Process matches
      matches.forEach(match => {
        const homeTeam = standingsMap.get(match.home_team_id);
        const awayTeam = standingsMap.get(match.away_team_id);

        if (!homeTeam || !awayTeam) return;

        // Update matches played
        homeTeam.matches_played++;
        awayTeam.matches_played++;

        // Update goals
        homeTeam.goals_for += match.home_score;
        homeTeam.goals_against += match.away_score;
        awayTeam.goals_for += match.away_score;
        awayTeam.goals_against += match.home_score;

        // Determine result
        if (match.home_score > match.away_score) {
          // Home team wins
          homeTeam.wins++;
          homeTeam.points += 3;
          awayTeam.losses++;
        } else if (match.home_score < match.away_score) {
          // Away team wins
          awayTeam.wins++;
          awayTeam.points += 3;
          homeTeam.losses++;
        } else {
          // Draw
          homeTeam.draws++;
          awayTeam.draws++;
          homeTeam.points++;
          awayTeam.points++;
        }

        // Update goal difference
        homeTeam.goal_difference = homeTeam.goals_for - homeTeam.goals_against;
        awayTeam.goal_difference = awayTeam.goals_for - awayTeam.goals_against;
      });

      // Convert to array and sort
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

  const getPositionIcon = (position: number) => {
    if (position === 1) {
      return <Trophy className="h-4 w-4 text-yellow-500" />;
    } else if (position <= 3) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (position > standings.length - 3) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
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
          <span>Classificação Atualizada</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {standings.map((team, index) => (
              <TableRow key={team.team_id}>
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    {getPositionIcon(index + 1)}
                    <span>{index + 1}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link 
                    to={`/teams/${team.team_id}`}
                    className="flex items-center space-x-3 hover:text-primary transition-colors"
                  >
                    {team.team_logo && (
                      <img 
                        src={team.team_logo} 
                        alt={team.team_name}
                        className="w-6 h-6 object-contain"
                      />
                    )}
                    <span className="font-medium">{team.team_name}</span>
                  </Link>
                </TableCell>
                <TableCell className="text-center">{team.matches_played}</TableCell>
                <TableCell className="text-center">{team.wins}</TableCell>
                <TableCell className="text-center">{team.draws}</TableCell>
                <TableCell className="text-center">{team.losses}</TableCell>
                <TableCell className="text-center">{team.goals_for}</TableCell>
                <TableCell className="text-center">{team.goals_against}</TableCell>
                <TableCell className="text-center">
                  <span className={
                    team.goal_difference > 0 ? 'text-green-600' :
                    team.goal_difference < 0 ? 'text-red-600' : 'text-gray-600'
                  }>
                    {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                  </span>
                </TableCell>
                <TableCell className="text-center font-bold">{team.points}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};