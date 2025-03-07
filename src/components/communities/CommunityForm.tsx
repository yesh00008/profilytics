
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
}

interface CommunityFormProps {
  editingCommunity: Community | null;
  onFormSubmit: () => void;
  onCancel: () => void;
}

const CommunityForm: React.FC<CommunityFormProps> = ({
  editingCommunity,
  onFormSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CommunityFormData>(
    editingCommunity
      ? {
          name: editingCommunity.name,
          description: editingCommunity.description,
          link: editingCommunity.link || "",
          is_private: editingCommunity.is_private,
          college_name: editingCommunity.college_name || "",
          community_type: editingCommunity.community_type,
        }
      : {
          name: "",
          description: "",
          link: "",
          is_private: false,
          college_name: "",
          community_type: "public",
        }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create a community");

      const communityData = {
        ...formData,
        creator_id: user.id,
        is_private: formData.community_type === 'private',
      };

      if (editingCommunity) {
        const { error } = await supabase
          .from("communities")
          .update(communityData)
          .eq('id', editingCommunity.id);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Community updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("communities")
          .insert([communityData]);
        if (error) throw error;
        toast({
          title: "Success!",
          description: "Community created successfully.",
        });
      }

      onFormSubmit();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error with community",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 sm:p-8 mb-8 shadow-md rounded-xl border-gray-200">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        {editingCommunity ? "Edit Community" : "Create a New Community"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Community Type *
          </label>
          <select
            name="community_type"
            value={formData.community_type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            required
          >
            <option value="public">Public Community</option>
            <option value="private">Private Community (College-specific)</option>
            <option value="external">External Community</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Community Name *
          </label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Enter community name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Describe your community"
          />
        </div>

        {formData.community_type === 'external' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              External Link *
            </label>
            <input
              type="url"
              name="link"
              required
              value={formData.link}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="https://..."
            />
          </div>
        )}

        {formData.community_type === 'private' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              College Name *
            </label>
            <input
              type="text"
              name="college_name"
              required
              value={formData.college_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Enter college name"
            />
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? "Saving..." : (editingCommunity ? "Update Community" : "Create Community")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CommunityForm;
