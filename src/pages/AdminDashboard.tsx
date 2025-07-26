import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Users, Calendar, Trophy, Plus } from 'lucide-react';
import { CreateTeamForm } from '@/components/admin/CreateTeamForm';
import { CreatePlayerForm } from '@/components/admin/CreatePlayerForm';
import { CreateMatchForm } from '@/components/admin/CreateMatchForm';
import { StandingsManager } from '@/components/admin/StandingsManager';

export const AdminDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie a Copa Paizão</p>
      </div>

      <Tabs defaultValue="teams" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="teams" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Times</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Jogadores</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Partidas</span>
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Classificação</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configurações</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-6">
          <CreateTeamForm onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <CreatePlayerForm onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="matches" className="space-y-6">
          <CreateMatchForm onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="standings" className="space-y-6">
          <StandingsManager />
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Os resultados podem ser registrados na seção de partidas. Selecione uma partida e atualize o status para "Finalizada" com os placares.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};