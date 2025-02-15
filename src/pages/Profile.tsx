
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Pencil, Plus, Briefcase, GraduationCap, MapPin, Globe, UserPlus } from "lucide-react";
import { format } from "date-fns";

interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      const { data: experienceData, error: experienceError } = await supabase
        .from('experiences')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (experienceError) throw experienceError;

      const { data: educationData, error: educationError } = await supabase
        .from('education')
        .select('*')
        .eq('profile_id', user.id)
        .order('start_date', { ascending: false });

      if (educationError) throw educationError;

      setProfile(profileData);
      setExperiences(experienceData || []);
      setEducation(educationData || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
      Loading profile...
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="mb-6 overflow-hidden">
          <div className="relative h-32 bg-gradient-to-r from-blue-400 to-blue-600">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-white/90 hover:bg-white"
              onClick={() => navigate('/profile/edit')}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-6 -mt-16">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-full border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-100 flex items-center justify-center">
                    <span className="text-4xl text-blue-600">
                      {profile?.full_name?.[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{profile?.full_name}</h1>
                {profile?.headline && (
                  <p className="text-gray-600 mt-1">{profile.headline}</p>
                )}
                <div className="flex flex-wrap gap-4 mt-4 justify-center sm:justify-start">
                  {profile?.location && (
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center text-gray-600">
                      <Globe className="h-4 w-4 mr-1" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                        Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {profile?.bio && (
              <p className="mt-6 text-gray-600 whitespace-pre-wrap">{profile.bio}</p>
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Experience</h2>
              <Button onClick={() => navigate('/profile/add-experience')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <Card key={experience.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <Briefcase className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{experience.title}</h3>
                      <p className="text-gray-600">{experience.company}</p>
                      {experience.location && (
                        <p className="text-gray-500 text-sm">{experience.location}</p>
                      )}
                      <p className="text-gray-500 text-sm">
                        {format(new Date(experience.start_date), 'MMM yyyy')} -{' '}
                        {experience.end_date
                          ? format(new Date(experience.end_date), 'MMM yyyy')
                          : 'Present'}
                      </p>
                      {experience.description && (
                        <p className="mt-2 text-gray-600">{experience.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {experiences.length === 0 && (
                <Card className="p-4">
                  <p className="text-gray-500 text-center">No experience added yet</p>
                </Card>
              )}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Education</h2>
              <Button onClick={() => navigate('/profile/add-education')} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
            <div className="space-y-4">
              {education.map((edu) => (
                <Card key={edu.id} className="p-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <GraduationCap className="h-10 w-10 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{edu.degree}</h3>
                      <p className="text-gray-600">{edu.school}</p>
                      <p className="text-gray-500 text-sm">
                        {format(new Date(edu.start_date), 'MMM yyyy')} -{' '}
                        {edu.end_date
                          ? format(new Date(edu.end_date), 'MMM yyyy')
                          : 'Present'}
                      </p>
                      {edu.description && (
                        <p className="mt-2 text-gray-600">{edu.description}</p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
              {education.length === 0 && (
                <Card className="p-4">
                  <p className="text-gray-500 text-center">No education added yet</p>
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
