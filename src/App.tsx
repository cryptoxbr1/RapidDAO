import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Web3Provider } from '@/context/Web3Context';
import { Navbar } from '@/components/Navbar';
import { Home } from '@/pages/Home';
import { CreateProposal } from '@/pages/CreateProposal';
import { ProposalDetails } from '@/pages/ProposalDetails';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Web3Provider>
        <Toaster />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateProposal />} />
            <Route path="/proposal/:id" element={<ProposalDetails />} />
          </Routes>
        </BrowserRouter>
      </Web3Provider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;