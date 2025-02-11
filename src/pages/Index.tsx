
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Briefcase, Calendar, Users, BookOpen, Trophy, Network, UserCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        toast({
          title: "Welcome!",
          description: "You have successfully signed in.",
        });
      }
      if (_event === 'SIGNED_OUT') {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-center mb-2">Welcome to ProfiLytics</h1>
          <p className="text-gray-500 text-center mb-8">Connect with professionals and grow your network</p>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#1e40af',
                    brandAccent: '#1e3a8a',
                  },
                },
              },
            }}
            providers={['google']}
          />
        </Card>
      </div>
    );
  }

  const dashboardItems = [
    {
      title: "Internships & Jobs",
      icon: <Briefcase className="h-6 w-6" />,
      description: "Find your next career opportunity",
      link: "/jobs"
    },
    {
      title: "Hackathons",
      icon: <Trophy className="h-6 w-6" />,
      description: "Participate in coding competitions",
      link: "/hackathons"
    },
    {
      title: "Tech Events",
      icon: <Calendar className="h-6 w-6" />,
      description: "Discover upcoming tech events",
      link: "/events"
    },
    {
      title: "Resources",
      icon: <BookOpen className="h-6 w-6" />,
      description: "Access learning materials and guides",
      link: "/resources"
    },
    {
      title: "Network",
      icon: <Network className="h-6 w-6" />,
      description: "Connect with other professionals",
      link: "/network"
    },
    {
      title: "Community",
      icon: <Users className="h-6 w-6" />,
      description: "Join discussions and share insights",
      link: "/communities"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome to ProfiLytics</h1>
            <p className="text-gray-600 mt-2">Your professional growth starts here</p>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              <UserCircle className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button 
              variant="outline"
              onClick={async () => {
                try {
                  await supabase.auth.signOut();
                  navigate('/');
                } catch (error: any) {
                  toast({
                    variant: "destructive",
                    title: "Error signing out",
                    description: error.message,
                  });
                }
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <Card 
              key={index}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(item.link)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {item.icon}
                </div>
                <h2 className="text-xl font-semibold">{item.title}</h2>
              </div>
              <p className="text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
