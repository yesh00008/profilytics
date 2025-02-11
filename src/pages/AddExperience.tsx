
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AddExperience = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [experience, setExperience] = useState({
    title: "",
    company: "",
    location: "",
    start_date: "",
    end_date: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from('experiences')
        .insert({
          ...experience,
          profile_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Experience added",
        description: "Your experience has been added successfully.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding experience",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Add Experience</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={experience.title}
                onChange={e => setExperience({ ...experience, title: e.target.value })}
                placeholder="Job title"
                required
              />
            </div>

            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={experience.company}
                onChange={e => setExperience({ ...experience, company: e.target.value })}
                placeholder="Company name"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={experience.location}
                onChange={e => setExperience({ ...experience, location: e.target.value })}
                placeholder="Location"
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={experience.start_date}
                onChange={e => setExperience({ ...experience, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={experience.end_date}
                onChange={e => setExperience({ ...experience, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={experience.description}
                onChange={e => setExperience({ ...experience, description: e.target.value })}
                placeholder="Describe your role and achievements"
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Experience'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddExperience;
