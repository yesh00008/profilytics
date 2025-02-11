
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

const AddEducation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [education, setEducation] = useState({
    school: "",
    degree: "",
    field: "",
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
        .from('education')
        .insert({
          ...education,
          profile_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Education added",
        description: "Your education has been added successfully.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding education",
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
          <h1 className="text-2xl font-bold mb-6">Add Education</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="school">School</Label>
              <Input
                id="school"
                value={education.school}
                onChange={e => setEducation({ ...education, school: e.target.value })}
                placeholder="School name"
                required
              />
            </div>

            <div>
              <Label htmlFor="degree">Degree</Label>
              <Input
                id="degree"
                value={education.degree}
                onChange={e => setEducation({ ...education, degree: e.target.value })}
                placeholder="Degree type"
                required
              />
            </div>

            <div>
              <Label htmlFor="field">Field of Study</Label>
              <Input
                id="field"
                value={education.field}
                onChange={e => setEducation({ ...education, field: e.target.value })}
                placeholder="Field of study"
                required
              />
            </div>

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={education.start_date}
                onChange={e => setEducation({ ...education, start_date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={education.end_date}
                onChange={e => setEducation({ ...education, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={education.description}
                onChange={e => setEducation({ ...education, description: e.target.value })}
                placeholder="Additional details about your education"
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
                {loading ? 'Adding...' : 'Add Education'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddEducation;
