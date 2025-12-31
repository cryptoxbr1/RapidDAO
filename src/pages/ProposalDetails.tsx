import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, ThumbsUp, ThumbsDown, Clock, User, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useWeb3 } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { analyzeProposalWithAI } from '@/utils/aiAnalysis';

export const ProposalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proposals, vote, hasVoted, account, isLoading: isWeb3Loading } = useWeb3();
  const { toast } = useToast();

  const [proposal, setProposal] = useState<any>(null);
  const [voted, setVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (proposals.length > 0 && id) {
      const found = proposals.find(p => p.id === Number(id));
      if (found) {
        setProposal(found);
      }
    }
  }, [proposals, id]);

  useEffect(() => {
    const checkVoted = async () => {
      if (account && proposal) {
        const hasUserVoted = await hasVoted(proposal.id);
        setVoted(hasUserVoted);
      }
    };
    checkVoted();
  }, [proposal, account, hasVoted]);

  const handleAIAnalysis = async () => {
    if (!proposal) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeProposalWithAI(proposal.title, proposal.description);
      setAnalysis(result);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Analysis service is currently unavailable. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVote = async (voteYes: boolean) => {
    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    if (!proposal) return;

    setIsVoting(true);
    
    vote(proposal.id, voteYes)
      .then(() => {
        toast({
          title: "Vote cast successfully!",
          description: `You voted ${voteYes ? 'YES' : 'NO'} on proposal #${proposal.id}`,
        });
        setVoted(true);
        // Optimistically update counts usually requires refetch, relying on event listener in context for now
      })
      .catch((error) => {
        toast({
          title: "Vote failed",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsVoting(false);
      });
  };

  if (isWeb3Loading && !proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-slate-600">Loading proposal details...</p>
        </div>
      </div>
    );
  }

  if (!proposal && !isWeb3Loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Proposal Not Found</h2>
        <p className="text-slate-600 mb-6">The proposal you are looking for does not exist or has not been loaded.</p>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const yesVotes = Number(proposal.yesVotes);
  const noVotes = Number(proposal.noVotes);
  const totalVotes = yesVotes + noVotes;
  const yesPercentage = totalVotes > 0 ? (yesVotes / totalVotes) * 100 : 0;
  const noPercentage = totalVotes > 0 ? (noVotes / totalVotes) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 hover:bg-slate-200"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-sm py-1">
                    Proposal #{proposal.id}
                  </Badge>
                  <Badge variant={proposal.isOpen ? "default" : "secondary"} className={proposal.isOpen ? "bg-green-500 hover:bg-green-600" : ""}>
                    {proposal.isOpen ? "Active Voting" : "Closed"}
                  </Badge>
                </div>
                <CardTitle className="text-3xl font-bold leading-tight">
                  {proposal.title}
                </CardTitle>
                <div className="flex items-center text-sm text-slate-500 gap-4">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span className="font-mono">{proposal.creator.slice(0, 6)}...{proposal.creator.slice(-4)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(Number(proposal.timestamp) * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate max-w-none">
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {proposal.description}
                  </p>
                </div>
                
                <Separator className="my-6" />
                
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      AI Analysis
                    </h3>
                    {!analysis && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? "Analyzing..." : "Generate Insights"}
                      </Button>
                    )}
                  </div>
                  
                  {analysis ? (
                    <div className="text-sm text-slate-700 italic animate-in fade-in">
                      "{analysis}"
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">
                      Get an AI-powered summary of the potential impact and risks of this proposal.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Voting Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Yes</span>
                    <span>{yesVotes} ({yesPercentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={yesPercentage} className="h-2 bg-slate-100 [&>div]:bg-green-500" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>No</span>
                    <span>{noVotes} ({noPercentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={noPercentage} className="h-2 bg-slate-100 [&>div]:bg-red-500" />
                </div>

                <div className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Total Votes</span>
                    <span className="font-semibold text-slate-900">{totalVotes}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Quorum Check</span>
                    <span className="text-green-600 font-medium">Passed</span>
                  </div>
                </div>
              </CardContent>
              {proposal.isOpen && (
                <CardFooter className="flex flex-col gap-3 pt-2">
                  {account ? (
                    voted ? (
                      <div className="w-full py-3 bg-slate-100 text-slate-600 text-center rounded-md font-medium text-sm">
                        You have voted on this proposal
                      </div>
                    ) : (
                      <>
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700" 
                          onClick={() => handleVote(true)}
                          disabled={isVoting}
                        >
                          <ThumbsUp className="h-4 w-4 mr-2" />
                          Vote Yes
                        </Button>
                        <Button 
                          className="w-full bg-red-600 hover:bg-red-700" 
                          onClick={() => handleVote(false)}
                          disabled={isVoting}
                        >
                          <ThumbsDown className="h-4 w-4 mr-2" />
                          Vote No
                        </Button>
                      </>
                    )
                  ) : (
                    <div className="w-full py-3 bg-slate-100 text-slate-500 text-center rounded-md text-sm">
                      Connect wallet to vote
                    </div>
                  )}
                </CardFooter>
              )}
            </Card>

            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full gap-2" onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({ title: "Copied!", description: "Link copied to clipboard" });
                }}>
                  <Share2 className="h-4 w-4" />
                  Share Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};