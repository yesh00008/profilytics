
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Plus } from "lucide-react";
import { format } from "date-fns";

const Hackathons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHackathons();
  }, []);

  const loadHackathons = async () => {
    try {
      const { data, error } = await supabase
        .from('hackathons')
        .select('*, profiles(full_name)')
        .order('start_date', { ascending: true });

      if (error) throw error;
      setHackathons(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading hackathons",
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
            <h1 className="text-3xl font-bold">Hackathons</h1>
          </div>
          <Button onClick={() => navigate('/hackathons/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Hackathon
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading hackathons...</div>
        ) : hackathons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No hackathons found. Be the first to create one!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons.map((hackathon) => (
              <Card
                key={hackathon.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2">{hackathon.title}</h2>
                  <div className="space-y-2 text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{format(new Date(hackathon.start_date), 'PPP')} - {format(new Date(hackathon.end_date), 'PPP')}</span>
                    </div>
                    {hackathon.location && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{hackathon.is_online ? 'Online' : hackathon.location}</span>
                      </div>
                    )}
                    {hackathon.max_team_size && (
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Teams up to {hackathon.max_team_size} members</span>
                      </div>
                    )}
                    {hackathon.prize_pool && (
                      <div className="flex items-center">
                        <Trophy className="h-4 w-4 mr-2" />
                        <span>Prize Pool: {hackathon.prize_pool}</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-gray-600 line-clamp-2">{hackathon.description}</p>
                  <div className="mt-4">
                    <span className="text-sm text-gray-500">
                      Organized by {hackathon.profiles?.full_name || 'Unknown'}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/hackathons/${hackathon.id}`)}
                    >
                      View Details
                    </Button>
                    {hackathon.link && (
                      <Button
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(hackathon.link, '_blank');
                        }}
                      >
                        Visit Hackathon Page
                      </Button>
                    )}
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

export default Hackathons;
