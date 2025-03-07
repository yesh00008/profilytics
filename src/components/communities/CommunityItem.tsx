
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Lock, ExternalLink, Edit, Trash, Users, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CommunityMember {
  status: string;
  can_message: boolean;
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

interface CommunityItemProps {
  community: Community;
  userId: string | null;
  membershipStatus: { [key: string]: CommunityMember };
  onEdit: (community: Community) => void;
  onDelete: (communityId: string) => void;
  onJoinRequest: (communityId: string) => void;
  canJoinCommunity: (community: Community) => boolean;
}

const CommunityItem: React.FC<CommunityItemProps> = ({
  community,
  userId,
  membershipStatus,
  onEdit,
  onDelete,
  onJoinRequest,
  canJoinCommunity,
}) => {
  const navigate = useNavigate();

  return (
    <Card key={community.id} className="p-4 sm:p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-semibold">{community.name}</h2>
          {community.community_type === 'private' ? (
            <Lock className="h-4 w-4 text-gray-500" />
          ) : community.community_type === 'public' ? (
            <Globe className="h-4 w-4 text-gray-500" />
          ) : (
            <ExternalLink className="h-4 w-4 text-gray-500" />
          )}
        </div>
        {userId === community.creator_id && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(community)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(community.id)}
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        )}
      </div>
      <p className="text-gray-600 mb-4 text-sm sm:text-base">{community.description}</p>
      {community.college_name && (
        <p className="text-sm text-blue-600 mb-2">College: {community.college_name}</p>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center text-sm text-gray-500">
          <Users className="h-4 w-4 mr-1" />
          <span>Created by {community.profiles?.full_name}</span>
          <span className="mx-2">•</span>
          <span>{community._count?.members || 0} members</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {userId === community.creator_id ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/communities/${community.id}/members`)}
                className="w-full sm:w-auto"
              >
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/messages/community/${community.id}`)}
                className="w-full sm:w-auto"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Button>
            </>
          ) : (
            <>
              {community.community_type === 'external' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(community.link, '_blank')}
                  className="w-full sm:w-auto"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Community
                </Button>
              ) : (
                <>
                  {!membershipStatus[community.id] ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onJoinRequest(community.id)}
                      className="w-full sm:w-auto"
                    >
                      Request to Join
                    </Button>
                  ) : membershipStatus[community.id].status === 'pending' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full sm:w-auto"
                    >
                      Pending Approval
                    </Button>
                  ) : (
                    membershipStatus[community.id].status === 'approved' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/communities/${community.id}/members`)}
                          className="w-full sm:w-auto"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Members
                        </Button>
                        {membershipStatus[community.id].can_message && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/messages/community/${community.id}`)}
                            className="w-full sm:w-auto"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Messages
                          </Button>
                        )}
                      </>
                    )
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CommunityItem;
