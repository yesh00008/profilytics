
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, MapPin, Users, Trophy, Plus, Trash, Edit, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";

const Hackathons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    loadHackathons();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

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

  const handleDelete = async (hackathonId: string) => {
    try {
      const { error } = await supabase
        .from('hackathons')
        .delete()
        .eq('id', hackathonId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Hackathon deleted successfully",
      });
      loadHackathons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting hackathon",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading hackathons...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Hackathons</h1>
          <Button onClick={() => navigate('/hackathons/post')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Post Hackathon
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <Card key={hackathon.id} className="p-6">
              <h2 className="text-xl font-semibold mb-4">{hackathon.title}</h2>
              <div className="space-y-3 text-gray-600 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{format(new Date(hackathon.start_date), 'PPP')} - {format(new Date(hackathon.end_date), 'PPP')}</span>
                </div>
                {(hackathon.location || hackathon.is_online) && (
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
                    <span>{hackathon.prize_pool}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{hackathon.description}</p>
              <div className="flex flex-col gap-3">
                {hackathon.link && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(hackathon.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Website
                  </Button>
                )}
                {userId === hackathon.organizer_id && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/hackathons/edit/${hackathon.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(hackathon.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {hackathons.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No hackathons found. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hackathons;
