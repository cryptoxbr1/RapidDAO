import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWeb3 } from '@/context/Web3Context';
import { useToast } from '@/hooks/use-toast';

export const CreateProposal = () => {
  const navigate = useNavigate();
  const { createProposal, account } = useWeb3();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a proposal",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both title and description",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    createProposal(title, description)
      .then(() => {
        toast({
          title: "Proposal created! 🎉",
          description: "Your proposal has been published to the blockchain",
        });
        
        // Confetti effect
        setTimeout(() => {
          navigate('/');
        }, 1500);
      })
      .catch((error) => {
        toast({
          title: "Failed to create proposal",
          description: error.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Proposals
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Create New Proposal
            </CardTitle>
            <CardDescription>
              Submit your proposal to the DAO for community voting
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Proposal Title</Label>
                <Input
                  id="title"
                  placeholder="Should we fund..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={100}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500">{title.length}/100 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Details about the proposal..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                  className="resize-none"
                />
              </div>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting || !account}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                >
                  {isSubmitting ? (
                    <>
                      <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                      Confirm in Wallet...
                    </>
                  ) : (
                    'Publish to Chain'
                  )}
                </Button>
                
                <p className="text-xs text-center text-slate-500">
                  Estimated Cost: &lt; $0.01 (Base)
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};