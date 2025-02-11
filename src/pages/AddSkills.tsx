
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Plus, X } from "lucide-react";

const AddSkills = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [skill, setSkill] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

  const addSkill = () => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
      setSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (skills.length === 0) return;
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // First, insert all skills and get their IDs
      const skillPromises = skills.map(async (skillName) => {
        const { data: existingSkill, error: fetchError } = await supabase
          .from('skills')
          .select('id')
          .eq('name', skillName)
          .maybeSingle();

        if (fetchError) throw fetchError;

        if (existingSkill) return existingSkill.id;

        const { data: newSkill, error: insertError } = await supabase
          .from('skills')
          .insert({ name: skillName })
          .select('id')
          .single();

        if (insertError) throw insertError;
        return newSkill.id;
      });

      const skillIds = await Promise.all(skillPromises);

      // Then, create profile_skills entries
      const profileSkillsData = skillIds.map(skillId => ({
        profile_id: session.user.id,
        skill_id: skillId
      }));

      const { error: profileSkillsError } = await supabase
        .from('profile_skills')
        .insert(profileSkillsData);

      if (profileSkillsError) throw profileSkillsError;

      toast({
        title: "Skills added",
        description: "Your skills have been added successfully.",
      });
      
      navigate('/profile');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error adding skills",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/profile')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Add Skills</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="skill">Skill</Label>
              <div className="flex gap-2">
                <Input
                  id="skill"
                  value={skill}
                  onChange={e => setSkill(e.target.value)}
                  placeholder="Enter a skill"
                  onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((s, index) => (
                  <div
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="ml-2 focus:outline-none"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/profile')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || skills.length === 0}
              >
                {loading ? 'Adding...' : 'Add Skills'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AddSkills;
