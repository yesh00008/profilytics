import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users, Trophy, Plus, Trash, Edit, ExternalLink, Search, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";

interface HackathonFormData {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  is_online: boolean;
  max_team_size: string;
  requirements: string;
  prize_pool: string;
  link: string;
  registration_deadline: string;
}

const Hackathons = () => {
  const { toast } = useToast();
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingHackathon, setEditingHackathon] = useState<any>(null);
  const [formData, setFormData] = useState<HackathonFormData>({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    is_online: false,
    max_team_size: "",
    requirements: "",
    prize_pool: "",
    link: "",
    registration_deadline: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [allHackathons, setAllHackathons] = useState<any[]>([]);

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
      setAllHackathons(data || []);
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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredHackathons = allHackathons.filter(hackathon => 
      hackathon.title.toLowerCase().includes(query.toLowerCase()) ||
      hackathon.description.toLowerCase().includes(query.toLowerCase()) ||
      hackathon.location?.toLowerCase().includes(query.toLowerCase())
    );
    setHackathons(filteredHackathons);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to post a hackathon");

      // Create a clean data object with proper date handling
      const hackathonData = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        location: formData.location,
        is_online: formData.is_online,
        max_team_size: formData.max_team_size ? parseInt(formData.max_team_size) : null,
        requirements: formData.requirements,
        prize_pool: formData.prize_pool,
        link: formData.link,
        registration_deadline: formData.registration_deadline || null,
        organizer_id: user.id,
      };

      if (editingHackathon) {
        const { error } = await supabase
          .from("hackathons")
          .update(hackathonData)
          .eq('id', editingHackathon.id);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Hackathon updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("hackathons")
          .insert([hackathonData]);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Hackathon posted successfully.",
        });
      }

      setShowForm(false);
      setEditingHackathon(null);
      setFormData({
        title: "",
        description: "",
        start_date: "",
        end_date: "",
        location: "",
        is_online: false,
        max_team_size: "",
        requirements: "",
        prize_pool: "",
        link: "",
        registration_deadline: "",
      });
      loadHackathons();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error with hackathon",
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

  const handleEdit = (hackathon: any) => {
    setEditingHackathon(hackathon);
    setFormData({
      title: hackathon.title,
      description: hackathon.description,
      start_date: hackathon.start_date,
      end_date: hackathon.end_date,
      location: hackathon.location || "",
      is_online: hackathon.is_online,
      max_team_size: hackathon.max_team_size?.toString() || "",
      requirements: hackathon.requirements || "",
      prize_pool: hackathon.prize_pool || "",
      link: hackathon.link || "",
      registration_deadline: hackathon.registration_deadline || "",
    });
    setShowForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
  };

  if (loading && !showForm) {
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
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Hackathons</h1>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingHackathon(null);
                setFormData({
                  title: "",
                  description: "",
                  start_date: "",
                  end_date: "",
                  location: "",
                  is_online: false,
                  max_team_size: "",
                  requirements: "",
                  prize_pool: "",
                  link: "",
                  registration_deadline: "",
                });
              }
            }} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close Form" : "Post Hackathon"}
          </Button>
        </div>

        {!showForm && (
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search hackathons by title, description, or location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {editingHackathon ? "Edit Hackathon" : "Post a New Hackathon"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hackathon Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter hackathon title"
                />
              </div>

              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="is_online"
                  checked={formData.is_online}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">
                  This is an online hackathon
                </label>
              </div>

              {!formData.is_online && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    required={!formData.is_online}
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., San Francisco, CA"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  required
                  value={formData.start_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  required
                  value={formData.end_date}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Team Size
                </label>
                <input
                  type="number"
                  name="max_team_size"
                  value={formData.max_team_size}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., 4"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prize Pool
                </label>
                <input
                  type="text"
                  name="prize_pool"
                  value={formData.prize_pool}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="e.g., $10,000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Link *
                </label>
                <input
                  type="url"
                  name="link"
                  required
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://..."
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
                  rows={6}
                  className="w-full p-2 border rounded-md"
                  placeholder="Describe the hackathon, theme, and what participants can expect"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : (editingHackathon ? "Update Hackathon" : "Post Hackathon")}
              </Button>
            </form>
          </Card>
        )}

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
                      onClick={() => handleEdit(hackathon)}
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
