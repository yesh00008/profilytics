
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

const CreateResource = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [resource, setResource] = useState({
    title: "",
    description: "",
    url: "",
    type: "link",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      const { error } = await supabase
        .from('resources')
        .insert({
          ...resource,
          contributor_id: session.user.id,
        });

      if (error) throw error;

      toast({
        title: "Resource created",
        description: "Your resource has been shared successfully.",
      });
      
      navigate('/resources');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating resource",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/resources')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Resources
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Share a Resource</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={resource.title}
                onChange={e => setResource({ ...resource, title: e.target.value })}
                placeholder="Resource title"
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={resource.description}
                onChange={e => setResource({ ...resource, description: e.target.value })}
                placeholder="Describe the resource"
                required
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={resource.url}
                onChange={e => setResource({ ...resource, url: e.target.value })}
                placeholder="https://example.com"
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/resources')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sharing...' : 'Share Resource'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateResource;
