import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, MapPin, Users, Plus, ExternalLink, Search } from "lucide-react";
import { format } from "date-fns";

const Events = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      setAllEvents(data || []);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredEvents = allEvents.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description.toLowerCase().includes(query.toLowerCase()) ||
      event.type?.toLowerCase().includes(query.toLowerCase()) ||
      event.location?.toLowerCase().includes(query.toLowerCase())
    );
    setEvents(filteredEvents);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl sm:text-3xl font-bold">Tech Events</h1>
            </div>
            <Button onClick={() => navigate('/events/create')} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events by title, description, type, or location..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchQuery ? "No events found matching your search." : "No events found. Be the first to create one!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-4 sm:p-6">
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
                  <p className="mt-3 text-gray-600">{event.description}</p>
                  <div className="mt-4 flex justify-between items-center flex-wrap gap-2">
                    <span className="text-sm text-gray-500">
                      By {event.profiles?.full_name || 'Unknown'}
                    </span>
                    <span className="text-sm font-medium text-blue-600">
                      {event.is_free ? 'Free' : `$${event.ticket_price}`}
                    </span>
                  </div>
                  {event.link && (
                    <Button
                      className="mt-4 w-full sm:w-auto"
                      onClick={() => window.open(event.link, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit Event
                    </Button>
                  )}
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
