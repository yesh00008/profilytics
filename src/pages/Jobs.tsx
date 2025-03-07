
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, ArrowLeft, ExternalLink, Trash, Search, Filter, Clock, MapPin, Briefcase } from "lucide-react";
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
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
      setAllJobs(data || []);
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
    if (!confirm("Are you sure you want to delete this job posting?")) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Verify ownership before deletion
      const { data: jobData } = await supabase
        .from('jobs')
        .select('recruiter_id')
        .eq('id', jobId)
        .single();

      if (!jobData || jobData.recruiter_id !== user?.id) {
        throw new Error("You don't have permission to delete this job posting");
      }

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const filteredJobs = allJobs.filter(job => 
      job.title.toLowerCase().includes(query.toLowerCase()) ||
      job.company.toLowerCase().includes(query.toLowerCase()) ||
      job.description.toLowerCase().includes(query.toLowerCase()) ||
      (job.employment_type && job.employment_type.toLowerCase().includes(query.toLowerCase()))
    );
    setJobs(filteredJobs);
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const jobDate = new Date(date);
    const diffInDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Loading jobs...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 hover:bg-green-50 hover:text-green-600"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Jobs & Internships</h1>
            <p className="text-gray-600 mt-2">Find your next career opportunity</p>
          </div>
          {session && (
            <Button 
              onClick={() => navigate("/jobs/post")} 
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4" />
              Post a Job
            </Button>
          )}
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search jobs by title, company, or type..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="flex justify-end mt-2">
            <Button variant="ghost" className="text-sm text-gray-600 hover:bg-green-50 hover:text-green-600">
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="p-6 hover:shadow-lg transition-shadow border border-gray-200 rounded-xl">
              <div className="cursor-pointer">
                <h2 className="text-xl font-semibold mb-2 text-gray-800">{job.title}</h2>
                <p className="text-green-600 font-medium mb-2">{job.company}</p>
                
                <div className="flex items-center text-gray-500 mb-2">
                  <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <p className="text-sm">{job.location}</p>
                </div>
                
                {job.employment_type && (
                  <div className="flex items-center text-gray-500 mb-2">
                    <Briefcase className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    <p className="text-sm">{job.employment_type}</p>
                  </div>
                )}
                
                <div className="flex items-center text-gray-500 mb-4">
                  <Clock className="h-4 w-4 mr-1.5 flex-shrink-0" />
                  <p className="text-sm">{timeAgo(job.created_at)}</p>
                </div>
                
                <p className="text-gray-700 line-clamp-3 text-sm">{job.description}</p>
              </div>
              
              <div className="mt-5 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {job.employment_type && (
                    <span className="tag-pill tag-pill-green text-xs">
                      {job.employment_type}
                    </span>
                  )}
                  {job.salary_range && (
                    <span className="tag-pill tag-pill-green text-xs">
                      {job.salary_range}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  {job.link && (
                    <Button
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => window.open(job.link!, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply Now
                    </Button>
                  )}
                  {session?.user?.id === job.recruiter_id && (
                    <Button
                      variant="outline"
                      className="p-2 border-gray-300"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">
                {searchQuery ? "No jobs found matching your search." : "No jobs posted yet."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
