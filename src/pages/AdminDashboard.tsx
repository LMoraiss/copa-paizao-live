import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Users, Calendar, Trophy } from 'lucide-react';

export const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
        <p className="text-muted-foreground">Gerencie a Copa Paizão</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Times</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Gerenciar times e jogadores
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Partidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Criar e gerenciar partidas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Resultados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Registrar resultados das partidas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 p-3 bg-primary/10 rounded-full w-fit">
              <Settings className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-lg">Configurações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">
              Configurações gerais do sistema
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Funcionalidades em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            As funcionalidades administrativas estão sendo desenvolvidas. Em breve você poderá gerenciar todos os aspectos da Copa Paizão diretamente por aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};