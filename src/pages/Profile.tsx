
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Pencil, Building2, GraduationCap } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: expData, error: expError } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('start_date', { ascending: false });

      if (expError) throw expError;
      setExperiences(expData);

      const { data: eduData, error: eduError } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', session.user.id)
        .order('start_date', { ascending: false });

      if (eduError) throw eduError;
      setEducation(eduData);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    }
  };

  if (!profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Cover and Profile Section */}
        <Card className="mb-6 relative">
          {profile.cover_url && (
            <div className="h-48 w-full bg-cover bg-center rounded-t-lg" style={{ backgroundImage: `url(${profile.cover_url})` }} />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name} className="h-24 w-24 rounded-full" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-2xl text-blue-600">{profile.full_name?.[0]}</span>
                  </div>
                )}
                <div className="ml-4">
                  <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                  <p className="text-gray-600">{profile.headline}</p>
                  {profile.location && <p className="text-gray-500">{profile.location}</p>}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
              <Button onClick={() => navigate('/profile/edit')}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
            {profile.bio && (
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">About</h2>
                <p className="text-gray-700">{profile.bio}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Experience Section */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Experience
              </h2>
              <Button variant="outline" onClick={() => navigate('/profile/add-experience')}>
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <h3 className="font-semibold">{exp.title}</h3>
                  <p className="text-gray-600">{exp.company}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(exp.start_date).toLocaleDateString()} - 
                    {exp.end_date ? new Date(exp.end_date).toLocaleDateString() : 'Present'}
                  </p>
                  {exp.description && <p className="text-gray-700 mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Education Section */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <GraduationCap className="h-5 w-5 mr-2" />
                Education
              </h2>
              <Button variant="outline" onClick={() => navigate('/profile/add-education')}>
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <h3 className="font-semibold">{edu.school}</h3>
                  <p className="text-gray-600">{edu.degree} - {edu.field}</p>
                  <p className="text-gray-500 text-sm">
                    {new Date(edu.start_date).toLocaleDateString()} - 
                    {edu.end_date ? new Date(edu.end_date).toLocaleDateString() : 'Present'}
                  </p>
                  {edu.description && <p className="text-gray-700 mt-2">{edu.description}</p>}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
