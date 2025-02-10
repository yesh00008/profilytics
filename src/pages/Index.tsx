
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

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
              style: {
                button: {
                  borderRadius: '6px',
                  height: '40px',
                },
                input: {
                  borderRadius: '6px',
                },
              },
              theme: {
                default: {
                  colors: {
                    brand: '#1e40af',
                    brandAccent: '#1e3a8a',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            onError={(error) => {
              toast({
                variant: "destructive",
                title: "Authentication Error",
                description: error.message,
              });
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your Professional Network</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Summary</h2>
            <p className="text-gray-600">Complete your profile to connect with professionals</p>
          </Card>
          
          {/* Feed Preview */}
          <Card className="md:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4">Your Feed</h2>
            <p className="text-gray-600">Start connecting with other professionals to see their updates here</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
