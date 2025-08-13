import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { CreateTeamForm } from '@/components/admin/CreateTeamForm';

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
  players?: {
    count: number;
  }[];
}

export const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo_url,
          players(count)
        `)
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
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    setEditingTeam(null);
    fetchTeams();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (editingTeam) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CreateTeamForm 
          team={editingTeam} 
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingTeam(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Times</h1>
        <p className="text-muted-foreground">Explore os times da Copa Paizão</p>
      </div>

      {teams.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum time encontrado</h3>
            <p className="text-muted-foreground">
              Os times aparecerão aqui quando forem cadastrados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-card via-card to-muted/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <CardHeader className="text-center relative z-10">
                <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  {team.logo_url ? (
                    <img 
                      src={team.logo_url} 
                      alt={`Logo ${team.name}`}
                      className="w-14 h-14 object-contain rounded-xl"
                    />
                  ) : (
                    <Trophy className="h-10 w-10 text-primary" />
                  )}
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">{team.name}</CardTitle>
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-primary/20 font-semibold px-3 py-1"
                >
                  <Users className="h-3 w-3 mr-1" />
                  {team.players?.[0]?.count || 0} jogadores
                </Badge>
              </CardHeader>
              <CardContent className="text-center space-y-3 relative z-10">
                <Link to={`/teams/${team.id}`}>
                  <Button className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all duration-300 font-semibold">
                    <Trophy className="h-4 w-4 mr-2" />
                    Ver Time
                  </Button>
                </Link>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                    onClick={() => setEditingTeam(team)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};