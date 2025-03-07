
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AddExperience from "./pages/AddExperience";
import AddEducation from "./pages/AddEducation";
import AddSkills from "./pages/AddSkills";
import Events from "./pages/Events";
import CreateEvent from "./pages/CreateEvent";
import Hackathons from "./pages/Hackathons";
import CreateHackathon from "./pages/CreateHackathon";
import Resources from "./pages/Resources";
import CreateResource from "./pages/CreateResource";
import Network from "./pages/Network";
import Messages from "./pages/Messages";
import Communities from "./pages/Communities";
import CreateCommunity from "./pages/CreateCommunity";
import CommunityMembers from "./pages/CommunityMembers";
import CommunityMessages from "./pages/CommunityMessages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/post" element={<PostJob />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/edit" element={<EditProfile />} />
          <Route path="/profile/add-experience" element={<AddExperience />} />
          <Route path="/profile/add-education" element={<AddEducation />} />
          <Route path="/profile/add-skills" element={<AddSkills />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/create" element={<CreateEvent />} />
          <Route path="/hackathons" element={<Hackathons />} />
          <Route path="/hackathons/create" element={<CreateHackathon />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/resources/create" element={<CreateResource />} />
          <Route path="/network" element={<Network />} />
          <Route path="/messages/:userId" element={<Messages />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/communities/create" element={<CreateCommunity />} />
          <Route path="/communities/:communityId/members" element={<CommunityMembers />} />
          <Route path="/communities/:communityId/messages" element={<CommunityMessages />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
