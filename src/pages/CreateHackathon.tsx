import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

const CreateHackathon = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a hackathon");

      const hackathonData = {
        ...formData,
        organizer_id: user.id,
        max_team_size: formData.max_team_size ? parseInt(formData.max_team_size) : null,
      };

      const { error } = await supabase.from("hackathons").insert([hackathonData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your hackathon has been published.",
      });
      navigate("/hackathons");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating hackathon",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Hackathon</h1>
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
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter hackathon location"
                />
              </div>
            )}

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
                placeholder="Enter maximum team size"
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
                placeholder="Enter prize pool details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hackathon Link *
              </label>
              <input
                type="url"
                name="link"
                required
                value={formData.link}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="Enter hackathon website or registration link"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Requirements
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Enter hackathon requirements"
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
                placeholder="Describe your hackathon"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Publishing..." : "Publish Hackathon"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateHackathon;
