
import { HackathonFormData } from "./types";

interface HackathonFormFieldsProps {
  formData: HackathonFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const HackathonFormFields = ({ formData, handleChange }: HackathonFormFieldsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hackathon Title *
        </label>
        <input
          type="text"
          name="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter hackathon title"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Start Date *
        </label>
        <input
          type="datetime-local"
          name="start_date"
          required
          value={formData.start_date}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Date *
        </label>
        <input
          type="datetime-local"
          name="end_date"
          required
          value={formData.end_date}
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
          This is an online hackathon
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
            placeholder="Enter hackathon location"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Maximum Team Size
        </label>
        <input
          type="number"
          name="max_team_size"
          value={formData.max_team_size}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter maximum team size"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prize Pool
        </label>
        <input
          type="text"
          name="prize_pool"
          value={formData.prize_pool}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter prize pool details"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hackathon Link *
        </label>
        <input
          type="url"
          name="link"
          required
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 border rounded-md"
          placeholder="Enter hackathon website or registration link"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Requirements
        </label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows={4}
          className="w-full p-2 border rounded-md"
          placeholder="Enter hackathon requirements"
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
          placeholder="Describe your hackathon"
        />
      </div>
    </div>
  );
};

export default HackathonFormFields;
