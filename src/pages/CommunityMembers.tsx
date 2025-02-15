
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Check, X } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Member {
  profile_id: string;
  status: string;
  joined_at: string;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface Community {
  id: string;
  name: string;
  creator_id: string;
}

const CommunityMembers = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [community, setCommunity] = useState<Community | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCommunityAndMembers();
    checkUserRole();
  }, [communityId]);

  const checkUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: community } = await supabase
      .from('communities')
      .select('creator_id')
      .eq('id', communityId)
      .single();

    setIsAdmin(community?.creator_id === user.id);
  };

  const loadCommunityAndMembers = async () => {
    try {
      // Load community details
      const { data: communityData, error: communityError } = await supabase
        .from('communities')
        .select('*')
        .eq('id', communityId)
        .single();

      if (communityError) throw communityError;
      setCommunity(communityData);

      // Load members
      const { data: membersData, error: membersError } = await supabase
        .from('community_members')
        .select(`
          *,
          profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('community_id', communityId);

      if (membersError) throw membersError;
      setMembers(membersData);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading members",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMembershipAction = async (profileId: string, approved: boolean) => {
    try {
      if (approved) {
        const { error } = await supabase
          .from('community_members')
          .update({ 
            status: 'approved',
            can_message: true 
          })
          .eq('community_id', communityId)
          .eq('profile_id', profileId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('community_members')
          .delete()
          .eq('community_id', communityId)
          .eq('profile_id', profileId);

        if (error) throw error;
      }

      loadCommunityAndMembers();
      toast({
        title: "Success",
        description: `Member ${approved ? 'approved' : 'rejected'} successfully`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating membership",
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          Loading members...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/communities')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Communities
          </Button>
          <h1 className="text-2xl font-bold">
            {community?.name} - Members
          </h1>
        </div>

        <div className="grid gap-4">
          {members.map((member) => (
            <Card key={member.profile_id} className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {member.profiles.avatar_url && (
                    <img
                      src={member.profiles.avatar_url}
                      alt={member.profiles.full_name}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{member.profiles.full_name}</h3>
                    <p className="text-sm text-gray-500">
                      Status: {member.status}
                    </p>
                  </div>
                </div>
                {isAdmin && member.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMembershipAction(member.profile_id, true)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMembershipAction(member.profile_id, false)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {members.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No members found in this community.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityMembers;
