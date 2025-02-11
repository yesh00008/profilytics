
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Communities = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Communities</h1>
          <Button onClick={() => navigate("/communities/create")}>
            Create Community
          </Button>
        </div>
        <Card className="p-6">
          <p className="text-gray-600">Communities features coming soon...</p>
        </Card>
      </div>
    </div>
  );
};

export default Communities;
