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
            <Card key={team.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  {team.logo_url ? (
                    <img 
                      src={team.logo_url} 
                      alt={`Logo ${team.name}`}
                      className="w-12 h-12 object-contain rounded-full"
                    />
                  ) : (
                    <Trophy className="h-8 w-8 text-primary" />
                  )}
                </div>
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <Badge variant="secondary">
                  {team.players?.[0]?.count || 0} jogadores
                </Badge>
              </CardHeader>
              <CardContent className="text-center space-y-2">
                <Link to={`/teams/${team.id}`}>
                  <Button className="w-full">
                    Ver Time
                  </Button>
                </Link>
                {isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
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