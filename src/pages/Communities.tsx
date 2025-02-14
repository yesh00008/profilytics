import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash, Edit, ExternalLink, Users, Search } from "lucide-react";
import Navbar from "@/components/Navbar";

interface CommunityFormData {
  name: string;
  description: string;
  link: string;
}

const Communities = () => {
  const { toast } = useToast();
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<any>(null);
  const [formData, setFormData] = useState<CommunityFormData>({
    name: "",
    description: "",
    link: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [allCommunities, setAllCommunities] = useState<any[]>([]);

  useEffect(() => {
    loadCommunities();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
  };

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          profiles!communities_creator_id_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCommunities(data || []);
      setAllCommunities(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading communities",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredCommunities = allCommunities.filter(community => 
      community.name.toLowerCase().includes(query.toLowerCase()) ||
      community.description.toLowerCase().includes(query.toLowerCase())
    );
    setCommunities(filteredCommunities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a community");

      const communityData = {
        ...formData,
        creator_id: user.id,
      };

      if (editingCommunity) {
        const { error } = await supabase
          .from("communities")
          .update(communityData)
          .eq('id', editingCommunity.id);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Community updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("communities")
          .insert([communityData]);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Community created successfully.",
        });
      }

      setShowForm(false);
      setEditingCommunity(null);
      setFormData({
        name: "",
        description: "",
        link: "",
      });
      loadCommunities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error with community",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Community deleted successfully",
      });
      loadCommunities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting community",
        description: error.message,
      });
    }
  };

  const handleEdit = (community: any) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      description: community.description,
      link: community.link || "",
    });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading communities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Communities</h1>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingCommunity(null);
                setFormData({
                  name: "",
                  description: "",
                  link: "",
                });
              }
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close Form" : "Create Community"}
          </Button>
        </div>

        {!showForm && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search communities by name or description..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {showForm && (
          <Card className="p-4 sm:p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingCommunity ? "Edit Community" : "Create a New Community"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter community name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe your community"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Community Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : (editingCommunity ? "Update Community" : "Create Community")}
              </Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {communities.map((community) => (
            <Card key={community.id} className="p-4 sm:p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">{community.name}</h2>
                {userId === community.creator_id && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(community)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(community.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{community.description}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-1" />
                  <span>Created by {community.profiles?.full_name}</span>
                </div>
                {community.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(community.link, '_blank')}
                    className="w-full sm:w-auto"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                )}
              </div>
            </Card>
          ))}
          {communities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No communities found. Be the first to create one!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Communities;
