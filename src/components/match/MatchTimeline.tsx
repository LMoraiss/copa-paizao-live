import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Goal, Clock, AlertTriangle, RotateCcw, Flag, Coffee, Trophy } from 'lucide-react';

interface MatchEvent {
  id: string;
  event_type: string;
  minute: number;
  description: string | null;
  created_at: string;
  player?: { name: string };
}

interface MatchTimelineProps {
  events: MatchEvent[];
}

export const MatchTimeline = ({ events }: MatchTimelineProps) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return <Goal className="h-5 w-5 text-green-600" />;
      case 'yellow_card':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'red_card':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'substitution':
        return <RotateCcw className="h-5 w-5 text-blue-500" />;
      case 'corner':
        return <Flag className="h-5 w-5 text-purple-500" />;
      case 'kickoff':
        return <Trophy className="h-5 w-5 text-green-500" />;
      case 'halftime':
        return <Coffee className="h-5 w-5 text-orange-500" />;
      case 'fulltime':
        return <Trophy className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEventLabel = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'Gol';
      case 'yellow_card':
        return 'Cartão Amarelo';
      case 'red_card':
        return 'Cartão Vermelho';
      case 'substitution':
        return 'Substituição';
      case 'corner':
        return 'Escanteio';
      case 'kickoff':
        return 'Início';
      case 'halftime':
        return 'Intervalo';
      case 'fulltime':
        return 'Fim de Jogo';
      default:
        return eventType;
    }
  };

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case 'goal':
        return 'default';
      case 'yellow_card':
        return 'secondary';
      case 'red_card':
        return 'destructive';
      case 'substitution':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (events.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum evento ainda</h3>
          <p className="text-muted-foreground">
            Os eventos da partida aparecerão aqui em tempo real.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline da Partida</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                {getEventIcon(event.event_type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant={getEventBadgeVariant(event.event_type)}>
                    {getEventLabel(event.event_type)}
                  </Badge>
                  <span className="text-sm font-medium">{event.minute}'</span>
                </div>
                
                {event.player && (
                  <p className="text-sm font-medium text-foreground mb-1">
                    {event.player.name}
                  </p>
                )}
                
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 text-xs text-muted-foreground">
                {new Date(event.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};