import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft, ExternalLink, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary_range?: string;
  employment_type?: string;
  link?: string | null;
  created_at: string;
  recruiter_id: string;
}

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error fetching jobs",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Job posting deleted successfully",
      });
      
      fetchJobs();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading jobs...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Jobs & Internships</h1>
            <p className="text-gray-600 mt-2">Find your next career opportunity</p>
          </div>
          {session && (
            <Button onClick={() => navigate("/jobs/post")} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow">
              <div onClick={() => navigate(`/jobs/${job.id}`)} className="cursor-pointer">
                <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
                <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                <p className="text-gray-600 mb-4">{job.location}</p>
                <p className="text-gray-700 line-clamp-3">{job.description}</p>
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {job.employment_type && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {job.employment_type}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {job.salary_range}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  {job.link && (
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(job.link, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  )}
                  {session?.user?.id === job.recruiter_id && (
                    <Button
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(job.id);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No jobs posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
