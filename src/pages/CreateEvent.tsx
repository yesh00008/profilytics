
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft } from "lucide-react";
import EventFormFields from "@/components/events/EventFormFields";
import { FormData } from "@/components/events/types";

const CreateEvent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    event_date: "",
    type: "",
    location: "",
    is_online: false,
    max_participants: "",
    registration_deadline: "",
    is_free: true,
    ticket_price: "",
    link: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to create an event");

      const eventData = {
        ...formData,
        organizer_id: user.id,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        ticket_price: formData.is_free ? null : parseFloat(formData.ticket_price),
      };

      const { error } = await supabase.from("tech_events").insert([eventData]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your event has been created.",
      });
      navigate("/events");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating event",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({ ...formData, [name]: checkbox.checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/events")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">Create a New Event</h1>
          <form onSubmit={handleSubmit}>
            <EventFormFields formData={formData} handleChange={handleChange} />
            <Button type="submit" disabled={loading} className="w-full mt-6">
              {loading ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateEvent;
