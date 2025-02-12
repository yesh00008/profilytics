
import { FormData } from "./types";
import { Button } from "@/components/ui/button";

interface EventFormFieldsProps {
  formData: FormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

const EventFormFields = ({ formData, handleChange }: EventFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Title *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter event title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Type *
        </label>
        <select
          name="type"
          required
          value={formData.type}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        >
          <option value="">Select type</option>
          <option value="Conference">Conference</option>
          <option value="Workshop">Workshop</option>
          <option value="Meetup">Meetup</option>
          <option value="Webinar">Webinar</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Date *
        </label>
        <input
          type="datetime-local"
          name="event_date"
          required
          value={formData.event_date}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Registration Deadline
        </label>
        <input
          type="datetime-local"
          name="registration_deadline"
          value={formData.registration_deadline}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="is_online"
          checked={formData.is_online}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">
          This is an online event
        </label>
      </div>

      {!formData.is_online && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter event location"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Participants
        </label>
        <input
          type="number"
          name="max_participants"
          value={formData.max_participants}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Leave empty for unlimited"
        />
      </div>

      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          name="is_free"
          checked={formData.is_free}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium text-gray-700">
          This is a free event
        </label>
      </div>

      {!formData.is_free && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ticket Price
          </label>
          <input
            type="number"
            name="ticket_price"
            value={formData.ticket_price}
            onChange={handleChange}
            className="w-full p-2 border rounded-md"
            placeholder="Enter ticket price"
            step="0.01"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Link
        </label>
        <input
          type="url"
          name="link"
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter event website or registration link"
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
          rows={6}
          className="w-full p-2 border rounded-md"
          placeholder="Describe your event"
        />
      </div>
    </div>
  );
};

export default EventFormFields;
