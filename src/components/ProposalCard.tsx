import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Sparkles, ExternalLink } from 'lucide-react';
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

  const handleAIAnalysis = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnalyzing(true);
    try {
      const result = await analyzeProposalWithAI(title, description);
      setAnalysis(result);
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Could not generate AI analysis. Please try again later.",
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
    <Card className="hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-slate-500">#{id}</span>
              <Badge variant={isOpen ? "default" : "secondary"} className={isOpen ? "bg-green-500" : ""}>
                {isOpen ? "Open" : "Closed"}
              </Badge>
            </div>
            <Link to={`/proposal/${id}`} className="hover:underline decoration-blue-500 underline-offset-2">
              <CardTitle className="text-xl leading-tight">{title}</CardTitle>
            </Link>
          </div>
        </div>
        <CardDescription className="line-clamp-2 mt-2">{description}</CardDescription>
        
        {analysis ? (
          <div className="mt-4 p-3 bg-indigo-50 rounded-md border border-indigo-100 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 mb-1 text-indigo-700 font-semibold text-xs uppercase tracking-wider">
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
            className="mt-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-medium flex items-center gap-1.5 transition-all w-fit"
            onClick={handleAIAnalysis}
            disabled={isAnalyzing}
          >
            <Sparkles className={`h-3.5 w-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? "Analyzing..." : "Analyze Impact with AI"}
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4 flex-1 flex flex-col justify-end">
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

        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => handleVote(true)}
            disabled={voted || isVoting || !account || !isOpen}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9"
            size="sm"
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1.5" />
            YES
          </Button>
          <Button
            onClick={() => handleVote(false)}
            disabled={voted || isVoting || !account || !isOpen}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white h-9"
            size="sm"
          >
            <ThumbsDown className="h-3.5 w-3.5 mr-1.5" />
            NO
          </Button>
        </div>
        
        <Link to={`/proposal/${id}`}>
          <Button variant="outline" className="w-full text-xs text-slate-500 h-8 mt-2" size="sm">
            View Full Details <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>

        {voted && (
          <p className="text-xs text-center text-slate-500 mt-1">You have voted on this proposal</p>
        )}
      </CardContent>
    </Card>
  );
};