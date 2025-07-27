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
  isLive?: boolean;
  liveMatchInfo?: {
    opponentName: string;
    homeScore: number;
    awayScore: number;
    isHome: boolean;
    matchId: string;
  };
}

export const Standings = () => {
  const [standings, setStandings] = useState<TeamStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchStandings();
    
    // Subscribe to real-time match updates to update standings
    const matchChannel = supabase
      .channel('standings-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchStandings()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, []);

  const fetchStandings = async () => {
    try {
      // Get all teams first
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('id, name, logo_url');

      if (teamsError) throw teamsError;

      // Get all finished matches and live matches
      const { data: allMatches, error: matchesError } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name, logo_url),
          away_team:teams!away_team_id(id, name, logo_url)
        `)
        .in('status', ['finished', 'live'])
        .not('home_score', 'is', null)
        .not('away_score', 'is', null);
      
      const finishedMatches = allMatches?.filter(match => match.status === 'finished') || [];
      const liveMatches = allMatches?.filter(match => match.status === 'live') || [];

      if (matchesError) throw matchesError;

      // Calculate standings
      const standingsMap = new Map<string, TeamStanding>();

      // Initialize all teams
      teams?.forEach(team => {
        const liveMatch = liveMatches.find(match => 
          match.home_team.id === team.id || match.away_team.id === team.id
        );

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
          isLive: !!liveMatch,
          liveMatchInfo: liveMatch ? {
            opponentName: liveMatch.home_team.id === team.id ? liveMatch.away_team.name : liveMatch.home_team.name,
            homeScore: liveMatch.home_score || 0,
            awayScore: liveMatch.away_score || 0,
            isHome: liveMatch.home_team.id === team.id,
            matchId: liveMatch.id
          } : undefined
        });
      });

      // Process finished matches only for standings calculation
      finishedMatches?.forEach(match => {
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
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full bg-card">
                <thead>
                  <tr className="bg-gradient-to-r from-muted/50 to-muted/30 border-b-2 border-border">
                    <th className="text-left p-4 font-bold text-foreground">Pos</th>
                    <th className="text-left p-4 font-bold text-foreground">Time</th>
                    <th className="text-center p-4 font-bold text-foreground">PJ</th>
                    <th className="text-center p-4 font-bold text-foreground">V</th>
                    <th className="text-center p-4 font-bold text-foreground">E</th>
                    <th className="text-center p-4 font-bold text-foreground">D</th>
                    <th className="text-center p-4 font-bold text-foreground">GP</th>
                    <th className="text-center p-4 font-bold text-foreground">GC</th>
                    <th className="text-center p-4 font-bold text-foreground">SG</th>
                    <th className="text-center p-4 font-bold text-foreground">PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((team, index) => (
                     <tr 
                      key={team.team_id} 
                      className={`
                        border-b border-border/50 hover:bg-muted/30 transition-all duration-200 
                        ${team.isLive ? 'bg-gradient-to-r from-red-50/40 to-red-100/30 hover:from-red-100/50 hover:to-red-200/30 animate-pulse' : ''}
                        ${!team.isLive && index === 0 ? 'bg-gradient-to-r from-yellow-50/50 to-yellow-100/30 hover:from-yellow-100/50 hover:to-yellow-200/30' : ''}
                        ${!team.isLive && (index === 1 || index === 2) ? 'bg-gradient-to-r from-green-50/30 to-green-100/20 hover:from-green-100/40 hover:to-green-200/20' : ''}
                        ${!team.isLive && index >= standings.length - 2 ? 'bg-gradient-to-r from-red-50/30 to-red-100/20 hover:from-red-100/40 hover:to-red-200/20' : ''}
                      `}
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-yellow-500 text-white shadow-lg' : ''}
                            ${index === 1 || index === 2 ? 'bg-green-500 text-white shadow-md' : ''}
                            ${index >= standings.length - 2 ? 'bg-red-500 text-white shadow-md' : ''}
                            ${index > 2 && index < standings.length - 2 ? 'bg-muted text-muted-foreground' : ''}
                          `}>
                            {index + 1}
                          </div>
                          {getPositionIcon(index + 1)}
                        </div>
                      </td>
                      <td className="p-4">
                        <Link 
                          to={`/teams/${team.team_id}`}
                          className="flex items-center space-x-3 hover:text-primary transition-colors font-medium group"
                        >
                          {team.team_logo && (
                            <div className="w-8 h-8 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                              <img 
                                src={team.team_logo} 
                                alt={team.team_name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                          )}
                           <div className="flex flex-col">
                             <span className="group-hover:font-semibold transition-all">{team.team_name}</span>
                             {team.isLive && team.liveMatchInfo && (
                               <div className="text-xs text-red-600 font-medium mt-1 animate-pulse">
                                 🔴 vs {team.liveMatchInfo.opponentName} {' '}
                                 <Link 
                                   to={`/match/${team.liveMatchInfo.matchId}`}
                                   className="hover:underline"
                                 >
                                   {team.liveMatchInfo.isHome 
                                     ? `${team.liveMatchInfo.homeScore}-${team.liveMatchInfo.awayScore}`
                                     : `${team.liveMatchInfo.awayScore}-${team.liveMatchInfo.homeScore}`
                                   }
                                 </Link>
                               </div>
                             )}
                           </div>
                        </Link>
                      </td>
                      <td className="text-center p-4 font-medium">{team.matches_played}</td>
                      <td className="text-center p-4 font-semibold text-green-600">{team.wins}</td>
                      <td className="text-center p-4 font-semibold text-yellow-600">{team.draws}</td>
                      <td className="text-center p-4 font-semibold text-red-600">{team.losses}</td>
                      <td className="text-center p-4 font-medium">{team.goals_for}</td>
                      <td className="text-center p-4 font-medium">{team.goals_against}</td>
                      <td className="text-center p-4">
                        <span className={`font-bold px-2 py-1 rounded text-sm ${
                          team.goal_difference > 0 ? "text-green-700 bg-green-100" : 
                          team.goal_difference < 0 ? "text-red-700 bg-red-100" : 
                          "text-gray-700 bg-gray-100"
                        }`}>
                          {team.goal_difference > 0 ? '+' : ''}{team.goal_difference}
                        </span>
                      </td>
                      <td className="text-center p-4">
                        <div className="font-bold text-lg text-primary bg-primary/10 rounded-full w-10 h-10 flex items-center justify-center mx-auto">
                          {team.points}
                        </div>
                      </td>
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