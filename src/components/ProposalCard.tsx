import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWeb3 } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';
import { analyzeProposalWithAI } from '@/utils/aiAnalysis';

interface ProposalCardProps {
  id: number;
  title: string;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  isOpen: boolean;
}

export const ProposalCard = ({ id, title, description, yesVotes, noVotes, isOpen }: ProposalCardProps) => {
  const { vote, hasVoted, account } = useWeb3();
  const { toast } = useToast();
  const [voted, setVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const checkVoted = async () => {
      if (account) {
        const hasUserVoted = await hasVoted(id);
        setVoted(hasUserVoted);
      }
    };
    checkVoted();
  }, [id, account, hasVoted]);

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeProposalWithAI(title, description);
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

    setIsVoting(true);
    
    vote(id, voteYes)
      .then(() => {
        toast({
          title: "Vote cast successfully!",
          description: `You voted ${voteYes ? 'YES' : 'NO'} on proposal #${id}`,
        });
        setVoted(true);
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

  const totalVotes = Number(yesVotes) + Number(noVotes);
  const yesPercentage = totalVotes > 0 ? (Number(yesVotes) / totalVotes) * 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-500">#{id}</span>
              <Badge variant={isOpen ? "default" : "secondary"} className={isOpen ? "bg-green-500" : ""}>
                {isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">{description}</CardDescription>
        
        {analysis ? (
          <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 mb-1 text-blue-700 font-semibold text-xs uppercase tracking-wider">
              <Sparkles className="h-3 w-3" />
              AI Impact Analysis
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic font-medium">
              "{analysis}"
            </p>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-medium flex items-center gap-1.5 transition-all"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? "Analyzing Proposal..." : "Analyze Impact with AI"}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-green-600 font-semibold">YES: {Number(yesVotes)}</span>
            <span className="text-red-600 font-semibold">NO: {Number(noVotes)}</span>
          </div>
          <Progress value={yesPercentage} className="h-2" />
          <p className="text-xs text-slate-500 text-center">
            {yesPercentage.toFixed(1)}% in favor
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => handleVote(true)}
            disabled={voted || isVoting || !account}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Vote YES
          </Button>
          <Button
            onClick={() => handleVote(false)}
            disabled={voted || isVoting || !account}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            Vote NO
          </Button>
        </div>

        {voted && (
          <p className="text-xs text-center text-slate-500">You have already voted on this proposal</p>
        )}
      </CardContent>
    </Card>
  );
};
