
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus } from "lucide-react";
import Navbar from "@/components/Navbar";
import CommunityForm from "@/components/communities/CommunityForm";
import CommunityList from "@/components/communities/CommunityList";
import SearchBar from "@/components/communities/SearchBar";

interface CommunityFormData {
  name: string;
  description: string;
  link: string;
  is_private: boolean;
  college_name: string;
  community_type: 'public' | 'private' | 'external';
}

interface Community {
  id: string;
  name: string;
  description: string;
  link: string | null;
  creator_id: string;
  is_private: boolean;
  college_name: string | null;
  community_type: 'public' | 'private' | 'external';
  profiles: {
    full_name: string;
  };
  _count?: {
    members: number;
  };
}

interface CommunityMember {
  status: string;
  can_message: boolean;
}

const Communities = () => {
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [membershipStatus, setMembershipStatus] = useState<{[key: string]: CommunityMember}>({});

  useEffect(() => {
    loadCommunities();
    checkUser();
  }, []);

  useEffect(() => {
    if (userId) {
      loadMembershipStatus();
    }
  }, [userId, communities]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);
    }
  };

  const loadCommunities = async () => {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(`
          *,
          profiles!communities_creator_id_fkey (
            full_name
          ),
          community_members (
            count
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const communitiesWithMemberCount = data.map(community => ({
        ...community,
        _count: {
          members: community.community_members?.length || 0
        }
      }));

      setCommunities(communitiesWithMemberCount);
      setAllCommunities(communitiesWithMemberCount);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error loading communities",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMembershipStatus = async () => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select('community_id, status, can_message')
        .eq('profile_id', userId);

      if (error) throw error;

      const statusMap = data.reduce((acc: {[key: string]: CommunityMember}, curr) => {
        acc[curr.community_id] = {
          status: curr.status,
          can_message: curr.can_message
        };
        return acc;
      }, {});

      setMembershipStatus(statusMap);
    } catch (error: any) {
      console.error('Error loading membership status:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredCommunities = allCommunities.filter(community => 
      community.name.toLowerCase().includes(query.toLowerCase()) ||
      community.description.toLowerCase().includes(query.toLowerCase())
    );
    setCommunities(filteredCommunities);
  };

  const handleDelete = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', communityId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Community deleted successfully",
      });
      loadCommunities();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error deleting community",
        description: error.message,
      });
    }
  };

  const handleJoinRequest = async (communityId: string) => {
    try {
      const { data: existingRequest } = await supabase
        .from('community_members')
        .select('*')
        .eq('community_id', communityId)
        .eq('profile_id', userId)
        .single();

      if (existingRequest) {
        toast({
          title: "Info",
          description: "You have already requested to join this community",
        });
        return;
      }

      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          profile_id: userId,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Join request sent successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error sending join request",
        description: error.message,
      });
    }
  };

  const handleEdit = (community: Community) => {
    setEditingCommunity(community);
    setShowForm(true);
  };

  const canJoinCommunity = (community: Community) => {
    if (!community.is_private) return true;
    if (!community.college_name) return true;
    return userProfile?.college === community.college_name;
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCommunity(null);
    loadCommunities();
  };

  if (loading && !showForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">Loading communities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Communities</h1>
          <Button 
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setEditingCommunity(null);
              }
            }}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close Form" : "Create Community"}
          </Button>
        </div>

        {!showForm && (
          <SearchBar searchQuery={searchQuery} onSearch={handleSearch} />
        )}

        {showForm ? (
          <CommunityForm 
            editingCommunity={editingCommunity}
            onFormSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <CommunityList
            communities={communities}
            userId={userId}
            membershipStatus={membershipStatus}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onJoinRequest={handleJoinRequest}
            canJoinCommunity={canJoinCommunity}
          />
        )}
      </div>
    </div>
  );
};

export default Communities;
