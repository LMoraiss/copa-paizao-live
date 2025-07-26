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
        <TabsList className="grid w-full grid-cols-5 h-auto">
          <TabsTrigger value="teams" className="flex flex-col items-center space-y-1 p-3 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Times</span>
          </TabsTrigger>
          <TabsTrigger value="players" className="flex flex-col items-center space-y-1 p-3 text-xs">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Jogadores</span>
          </TabsTrigger>
          <TabsTrigger value="matches" className="flex flex-col items-center space-y-1 p-3 text-xs">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Partidas</span>
          </TabsTrigger>
          <TabsTrigger value="standings" className="flex flex-col items-center space-y-1 p-3 text-xs">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">Classificação</span>
          </TabsTrigger>
          <TabsTrigger value="results" className="flex flex-col items-center space-y-1 p-3 text-xs">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Config</span>
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