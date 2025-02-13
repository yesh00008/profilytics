
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import HackathonFormFields from "@/components/hackathons/HackathonFormFields";
import { HackathonFormData } from "@/components/hackathons/types";

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
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Hackathon</h1>
          <form onSubmit={handleSubmit}>
            <HackathonFormFields formData={formData} handleChange={handleChange} />
            <Button type="submit" disabled={loading} className="w-full mt-6">
              {loading ? "Publishing..." : "Publish Hackathon"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateHackathon;
