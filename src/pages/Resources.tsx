import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, ExternalLink, Pencil, Trash, Search } from "lucide-react";

const Resources = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [resources, setResources] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allResources, setAllResources] = useState<any[]>([]);

  useEffect(() => {
    loadResources();
    checkSession();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
  };

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          *,
          profiles:contributor_id (
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setAllResources(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading resources",
        description: error.message,
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredResources = allResources.filter(resource => 
      resource.title.toLowerCase().includes(query.toLowerCase()) ||
      resource.description.toLowerCase().includes(query.toLowerCase()) ||
      resource.type?.toLowerCase().includes(query.toLowerCase())
    );
    setResources(filteredResources);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Resource deleted",
        description: "The resource has been deleted successfully.",
      });

      loadResources();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting resource",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          {session && (
            <Button onClick={() => navigate('/resources/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Share Resource
            </Button>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Learning Resources</h1>
        
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resources by title, description, or type..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Card key={resource.id} className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold mb-2">{resource.title}</h2>
                {session?.user?.id === resource.contributor_id && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(resource.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4">{resource.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {resource.profiles?.avatar_url ? (
                      <img
                        src={resource.profiles.avatar_url}
                        alt={resource.profiles.full_name}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm text-blue-600">
                          {resource.profiles?.full_name?.[0]}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="ml-2">
                    <p className="text-sm font-medium">{resource.profiles?.full_name}</p>
                  </div>
                </div>
                {resource.url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(resource.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Resources;
