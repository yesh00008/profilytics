
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, MapPin, Users, Plus } from "lucide-react";
import { format } from "date-fns";

const Events = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('tech_events')
        .select('*, profiles(full_name)')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading events",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold">Tech Events</h1>
          </div>
          <Button onClick={() => navigate('/events/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No events found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(new Date(event.event_date), 'PPP')}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.is_online ? 'Online' : event.location}</span>
                      </div>
                    )}
                    {event.max_participants && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Max {event.max_participants} participants</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-gray-600 line-clamp-2">{event.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      By {event.profiles?.full_name || 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {event.is_free ? 'Free' : `$${event.ticket_price}`}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
