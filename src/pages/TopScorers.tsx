import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Trophy, Medal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TopScorer {
  player_id: string;
  player_name: string;
  team_name: string;
  goals: number;
  jersey_number: number;
}

export const TopScorers = () => {
  const [topScorers, setTopScorers] = useState<TopScorer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTopScorers();
  }, []);

  const fetchTopScorers = async () => {
    try {
      const { data, error } = await supabase
        .from('match_events')
        .select(`
          player:players(
            id,
            name,
            jersey_number,
            team:teams(name)
          )
        `)
        .eq('event_type', 'goal');

      if (error) throw error;

      // Count goals per player
      const goalCounts = new Map<string, TopScorer>();

      data?.forEach((event: any) => {
        const player = event.player;
        if (player) {
          const key = player.id;
          if (goalCounts.has(key)) {
            goalCounts.get(key)!.goals++;
          } else {
            goalCounts.set(key, {
              player_id: player.id,
              player_name: player.name,
              team_name: player.team.name,
              goals: 1,
              jersey_number: player.jersey_number,
            });
          }
        }
      });

      // Sort by goals (descending)
      const sortedScorers = Array.from(goalCounts.values()).sort((a, b) => b.goals - a.goals);
      setTopScorers(sortedScorers);
    } catch (error) {
      console.error('Error fetching top scorers:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os artilheiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    if (position === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (position === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (position === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return <Badge className="bg-yellow-500 text-white">1º</Badge>;
    if (position === 2) return <Badge className="bg-gray-400 text-white">2º</Badge>;
    if (position === 3) return <Badge className="bg-amber-600 text-white">3º</Badge>;
    return <Badge variant="outline">{position}º</Badge>;
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Artilheiros</h1>
        <p className="text-muted-foreground">Os maiores goleadores da Copa Paizão</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Ranking de Artilheiros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topScorers.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum gol registrado</h3>
              <p className="text-muted-foreground">
                Os artilheiros aparecerão aqui quando os gols forem marcados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {topScorers.map((scorer, index) => (
                <div
                  key={scorer.player_id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    index < 3 ? 'bg-muted/50' : 'hover:bg-muted/30'
                  } transition-colors`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getPositionBadge(index + 1)}
                      {getPositionIcon(index + 1)}
                    </div>
                    
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                      {scorer.jersey_number}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-lg">{scorer.player_name}</h4>
                      <p className="text-muted-foreground">{scorer.team_name}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {scorer.goals}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {scorer.goals === 1 ? 'gol' : 'gols'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};