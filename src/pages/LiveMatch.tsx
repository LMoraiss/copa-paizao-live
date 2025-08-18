import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Clock, Calendar, MapPin } from 'lucide-react';
import { MatchControlPanel } from '@/components/match/MatchControlPanel';
import { MatchTimeline } from '@/components/match/MatchTimeline';
import { MatchLineups } from '@/components/match/MatchLineups';
import { MatchStandings } from '@/components/match/MatchStandings';
import { LiveMatchTimer } from '@/components/LiveMatchTimer';

interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: string;
  home_score: number | null;
  away_score: number | null;
  location: string | null;
  home_team: { id: string; name: string; logo_url: string | null };
  away_team: { id: string; name: string; logo_url: string | null };
}

interface MatchEvent {
  id: string;
  match_id: string;
  player_id: string | null;
  event_type: string;
  minute: number;
  description: string | null;
  created_at: string;
  player?: { name: string };
}

export const LiveMatch = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<Match | null>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (!id) return;
    
    fetchMatch();
    fetchEvents();
    
    // Subscribe to real-time updates for ALL users (not just admins)
    const matchChannel = supabase
      .channel(`match-${id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${id}`
        },
        (payload) => {
          console.log('Match updated in real-time:', payload);
          fetchMatch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_events',
          filter: `match_id=eq.${id}`
        },
        (payload) => {
          console.log('Match event updated in real-time:', payload);
          fetchEvents();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Real-time subscription active for match:', id);
        }
      });

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [id]);

  const fetchMatch = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(id, name, logo_url),
          away_team:teams!away_team_id(id, name, logo_url)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setMatch(data);
    } catch (error) {
      console.error('Error fetching match:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a partida.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          *,
          player:players(name)
        `)
        .eq('match_id', id)
        .order('minute', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Agendada</Badge>;
      case 'live':
        return <Badge className="bg-red-500 text-white animate-pulse">AO VIVO</Badge>;
      case 'finished':
        return <Badge variant="outline">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded mb-6"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Partida não encontrada</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      {/* Match Header */}
      <Card className="mb-4 sm:mb-6">
        <CardContent className="p-3 sm:p-6">
          {/* Mobile-first: Stack info vertically on small screens */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(match.match_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {new Date(match.match_date).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {match.status === 'live' && (
                <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs">
                  <LiveMatchTimer 
                    matchDate={match.match_date} 
                    status={match.status}
                    className="text-primary-foreground"
                  />
                </div>
              )}
            </div>
            {getStatusBadge(match.status)}
          </div>

          {/* Teams and Score - Mobile optimized layout */}
          <div className="flex flex-col space-y-4">
            {/* Score section - prominent on mobile */}
            <div className="text-center order-2 sm:order-1">
              {match.status === 'finished' || match.status === 'live' ? (
                <div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-3 sm:p-4">
                  {match.home_score ?? 0} - {match.away_score ?? 0}
                  {match.status === 'live' && (
                    <div className="text-xs text-red-500 font-medium animate-pulse mt-1">
                      🔴 AO VIVO
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-semibold text-muted-foreground bg-muted/30 rounded-xl p-3 sm:p-4">
                  VS
                </div>
              )}
            </div>

            {/* Teams section - horizontal on mobile */}
            <div className="flex items-center justify-between order-1 sm:order-2">
              {/* Home team */}
              <div className="flex items-center space-x-2 flex-1">
                {match.home_team.logo_url && (
                  <img 
                    src={match.home_team.logo_url} 
                    alt={match.home_team.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                  />
                )}
                <Link 
                  to={`/teams/${match.home_team.id}`}
                  className="text-sm sm:text-xl font-semibold hover:text-primary transition-colors truncate"
                >
                  {match.home_team.name}
                </Link>
              </div>
              
              {/* Away team */}
              <div className="flex items-center space-x-2 flex-1 justify-end">
                <Link 
                  to={`/teams/${match.away_team.id}`}
                  className="text-sm sm:text-xl font-semibold hover:text-primary transition-colors truncate text-right"
                >
                  {match.away_team.name}
                </Link>
                {match.away_team.logo_url && (
                  <img 
                    src={match.away_team.logo_url} 
                    alt={match.away_team.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 object-contain flex-shrink-0"
                  />
                )}
              </div>
            </div>
          </div>

          {match.location && (
            <div className="flex items-center justify-center mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
              {match.location}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Control Panel */}
      {isAdmin && (
        <MatchControlPanel match={match} onUpdate={fetchMatch} />
      )}

      {/* Match Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className={`grid w-full ${match.status === 'finished' ? 'grid-cols-3' : 'grid-cols-2'} h-12 sm:h-10`}>
          <TabsTrigger value="timeline" className="text-xs sm:text-sm">Timeline</TabsTrigger>
          <TabsTrigger value="lineups" className="text-xs sm:text-sm">Escalações</TabsTrigger>
          {match.status === 'finished' && (
            <TabsTrigger value="standings" className="text-xs sm:text-sm">Classificação</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="timeline">
          <MatchTimeline events={events} />
        </TabsContent>

        <TabsContent value="lineups">
          <MatchLineups 
            homeTeamId={match.home_team_id} 
            awayTeamId={match.away_team_id}
            homeTeamName={match.home_team.name}
            awayTeamName={match.away_team.name}
          />
        </TabsContent>

        {match.status === 'finished' && (
          <TabsContent value="standings">
            <MatchStandings />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};