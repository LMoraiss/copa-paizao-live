import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Circle, Clock, CreditCard, ArrowUpDown, Flag, Coffee, Trophy } from 'lucide-react';

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
        return <Circle className="h-5 w-5 text-green-600" />;
      case 'yellow_card':
        return <CreditCard className="h-5 w-5 text-yellow-500" />;
      case 'red_card':
        return <CreditCard className="h-5 w-5 text-red-500" />;
      case 'substitution':
        return <ArrowUpDown className="h-5 w-5 text-blue-500" />;
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
    <Card className="bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Timeline da Partida</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.map((event, index) => (
            <div 
              key={event.id} 
              className="group relative flex items-start space-x-4 p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Event Icon with animated background */}
              <div className="flex-shrink-0 relative">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
                  {getEventIcon(event.event_type)}
                </div>
                {/* Timeline connector */}
                {index < events.length - 1 && (
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-0.5 h-6 bg-gradient-to-b from-primary/30 to-transparent"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge 
                    variant={getEventBadgeVariant(event.event_type)}
                    className="text-xs font-semibold px-2 py-1"
                  >
                    {getEventLabel(event.event_type)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-bold text-primary">{event.minute}'</span>
                  </div>
                </div>
                
                {event.player && (
                  <p className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {event.player.name}
                  </p>
                )}
                
                {event.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                )}
              </div>
              
              <div className="flex-shrink-0 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {new Date(event.created_at).toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          ))}
        </div>
        
        {/* Beautiful timeline end marker */}
        {events.length > 0 && (
          <div className="flex items-center justify-center mt-6 pt-4 border-t border-dashed border-border">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
              <span className="text-sm">Início da partida</span>
              <div className="w-2 h-2 rounded-full bg-primary/30"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};