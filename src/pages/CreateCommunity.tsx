
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CreateCommunity = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/communities')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Communities
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create a Community</h1>
          <form className="space-y-6">
            <div>
              <Label htmlFor="name">Community Name</Label>
              <Input
                id="name"
                placeholder="Enter community name"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your community"
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="link">Community Link (Optional)</Label>
              <Input
                id="link"
                type="url"
                placeholder="https://example.com"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/communities')}
              >
                Cancel
              </Button>
              <Button type="submit">
                Create Community
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCommunity;
