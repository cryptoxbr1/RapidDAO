import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { contractAddress, contractABI, chainId, rpcUrl } from '@/utils/evmConfig';

export interface Proposal {
  id: number;
  title: string;
  description: string;
  yesVotes: bigint;
  noVotes: bigint;
  isOpen: boolean;
  creator: string;
  timestamp: bigint;
}

interface Web3ContextType {
  account: string | null;
  isConnecting: boolean;
  proposals: Proposal[];
  connectWallet: () => Promise<void>;
  createProposal: (title: string, description: string) => Promise<void>;
  vote: (proposalId: number, voteYes: boolean) => Promise<void>;
  hasVoted: (proposalId: number) => Promise<boolean>;
  fetchProposals: () => Promise<void>;
  isLoading: boolean;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contract, setContract] = useState<Contract | null>(null);

  // Initialize contract with provider
  useEffect(() => {
    const savedAccount = localStorage.getItem('connectedAccount');
    if (savedAccount) {
      setAccount(savedAccount);
    }

    const initContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new BrowserProvider(window.ethereum);
          // Initializing with provider only (read-only)
          const contractInstance = new Contract(contractAddress, contractABI, provider);
          setContract(contractInstance);
          
          // Initial load
          const count = await contractInstance.getProposalCount().catch(() => 0n);
          if (count > 0n) {
            fetchProposals(contractInstance);
          }
        } catch (error) {
          console.error("Failed to initialize contract:", error);
        }
      }
    };
    initContract();
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccounts = (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          localStorage.setItem('connectedAccount', accounts[0]);
        } else {
          setAccount(null);
          localStorage.removeItem('connectedAccount');
        }
      };

      window.ethereum.on('accountsChanged', handleAccounts);
      window.ethereum.on('chainChanged', () => window.location.reload());

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccounts);
        }
      };
    }
  }, []);

  // Real-time event listeners
  useEffect(() => {
    if (!contract) return;

    const handleUpdate = () => fetchProposals(contract);

    contract.on('ProposalCreated', handleUpdate);
    contract.on('VoteCast', handleUpdate);

    return () => {
      contract.off('ProposalCreated', handleUpdate);
      contract.off('VoteCast', handleUpdate);
    };
  }, [contract]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this dApp');
      return;
    }

    setIsConnecting(true);

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== chainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: `0x${chainId.toString(16)}`,
                rpcUrls: [rpcUrl],
                chainName: 'Base Mainnet',
                nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: ['https://base.blockscout.com/']
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setAccount(accounts[0]);
      localStorage.setItem('connectedAccount', accounts[0]);
      
      const updatedProvider = new BrowserProvider(window.ethereum);
      const contractInstance = new Contract(contractAddress, contractABI, updatedProvider);
      setContract(contractInstance);
      await fetchProposals(contractInstance);
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  const fetchProposals = async (contractToUse = contract) => {
    if (!contractToUse) return;

    setIsLoading(true);
    try {
      const count = await contractToUse.getProposalCount();
      const proposalsArray: Proposal[] = [];

      for (let i = 0; i < Number(count); i++) {
        const proposal = await contractToUse.getProposal(i);
        proposalsArray.push({
          id: Number(proposal.id),
          title: proposal.title,
          description: proposal.description,
          yesVotes: proposal.yesVotes,
          noVotes: proposal.noVotes,
          isOpen: proposal.isOpen,
          creator: proposal.creator,
          timestamp: proposal.timestamp,
        });
      }

      setProposals(proposalsArray.reverse());
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createProposal = async (title: string, description: string) => {
    if (!window.ethereum || !account) {
      throw new Error('Wallet not connected');
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractWithSigner = new Contract(contractAddress, contractABI, signer);

    const tx = await contractWithSigner.createProposal(title, description);
    await tx.wait();
  };

  const vote = async (proposalId: number, voteYes: boolean) => {
    if (!window.ethereum || !account) {
      throw new Error('Wallet not connected');
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contractWithSigner = new Contract(contractAddress, contractABI, signer);

    const tx = await contractWithSigner.vote(proposalId, voteYes);
    await tx.wait();
  };

  const hasVoted = async (proposalId: number): Promise<boolean> => {
    if (!contract || !account) return false;
    return await contract.hasVoted(proposalId, account);
  };

  const value: Web3ContextType = {
    account,
    isConnecting,
    proposals,
    connectWallet,
    createProposal,
    vote,
    hasVoted,
    fetchProposals,
    isLoading,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};