import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
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
  home_team: { name: string; logo_url: string | null };
  away_team: { name: string; logo_url: string | null };
}

export const Matches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMatches();
    
    // Subscribe to real-time match updates
    const matchChannel = supabase
      .channel('matches-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          home_team:teams!home_team_id(name, logo_url),
          away_team:teams!away_team_id(name, logo_url)
        `)
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as partidas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="secondary">Agendada</Badge>;
      case 'live':
        return <Badge className="bg-red-500 text-white animate-pulse">🔴 AO VIVO</Badge>;
      case 'finished':
        return <Badge variant="outline">Finalizada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Partidas</h1>
        <p className="text-muted-foreground">Acompanhe todas as partidas da Copa Paizão</p>
      </div>

      <div className="space-y-4">
        {matches.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma partida encontrada</h3>
              <p className="text-muted-foreground">
                As partidas aparecerão aqui quando forem criadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          matches.map((match, index) => (
            <Link key={match.id} to={`/match/${match.id}`}>
              <Card className="hover-lift glass cursor-pointer border-2 hover:border-primary/20 animate-fade-in-up group" 
                    style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString('pt-BR')}
                    </span>
                    <Clock className="h-4 w-4 text-muted-foreground ml-4" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(match.match_date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <LiveMatchTimer 
                      matchDate={match.match_date} 
                      status={match.status}
                      className="ml-4 text-primary"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(match.status)}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex-1 flex items-center justify-center space-x-4">
                    {match.home_team.logo_url && (
                      <div className="relative">
                        <img 
                          src={match.home_team.logo_url} 
                          alt={match.home_team.name}
                          className="w-12 h-12 object-contain rounded-full shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                        {match.status === 'live' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {match.home_team.name}
                      </h3>
                      <div className="text-xs text-muted-foreground">Mandante</div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 mx-8 text-center">
                    {(match.status === 'finished' || match.status === 'live') && match.home_score !== null && match.away_score !== null ? (
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 shadow-lg">
                        <div className="text-3xl font-bold text-primary">
                          {match.home_score} <span className="text-muted-foreground mx-2">x</span> {match.away_score}
                        </div>
                        {match.status === 'live' && (
                          <div className="text-xs text-red-500 font-medium animate-pulse mt-1">
                            🔴 AO VIVO
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gradient-to-r from-muted/30 to-muted/10 rounded-xl p-4 shadow-md">
                        <div className="text-2xl font-bold text-muted-foreground">VS</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(match.match_date).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex items-center justify-center space-x-4">
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                        {match.away_team.name}
                      </h3>
                      <div className="text-xs text-muted-foreground">Visitante</div>
                    </div>
                    {match.away_team.logo_url && (
                      <div className="relative">
                        <img 
                          src={match.away_team.logo_url} 
                          alt={match.away_team.name}
                          className="w-12 h-12 object-contain rounded-full shadow-md group-hover:scale-110 transition-transform duration-300"
                        />
                        {match.status === 'live' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {match.location && (
                  <div className="flex items-center justify-center mt-4 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    {match.location}
                  </div>
                )}
              </CardContent>
            </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};