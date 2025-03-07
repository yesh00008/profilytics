
import React from "react";
import CommunityItem from "./CommunityItem";

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

interface CommunityListProps {
  communities: Community[];
  userId: string | null;
  membershipStatus: { [key: string]: CommunityMember };
  onEdit: (community: Community) => void;
  onDelete: (communityId: string) => void;
  onJoinRequest: (communityId: string) => void;
  canJoinCommunity: (community: Community) => boolean;
}

const CommunityList: React.FC<CommunityListProps> = ({
  communities,
  userId,
  membershipStatus,
  onEdit,
  onDelete,
  onJoinRequest,
  canJoinCommunity,
}) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6">
      {communities.map((community) => (
        <CommunityItem
          key={community.id}
          community={community}
          userId={userId}
          membershipStatus={membershipStatus}
          onEdit={onEdit}
          onDelete={onDelete}
          onJoinRequest={onJoinRequest}
          canJoinCommunity={canJoinCommunity}
        />
      ))}
      {communities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No communities found. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
};

export default CommunityList;
