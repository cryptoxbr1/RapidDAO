# RapidDAO: Decentralized Governance on Base

A professional, secure, and decentralized governance protocol built for the Base ecosystem. RapidDAO allows users to create on-chain proposals and vote in real-time with verified blockchain finality.

## Overview

RapidDAO is a streamlined governance application that interacts directly with Solidity smart contracts on the Base Mainnet. It provides a simple yet powerful interface for community-driven decision-making without the need for centralized intermediaries.

## Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Technical Stack](#-technical-stack)
- [Installation & Setup](#-installation--setup)
- [Smart Contract Details](#-smart-contract-details)
- [Development Workflow](#-development-workflow)
- [Recent Updates](#-recent-updates)

## Features

- **Wallet Integration**: Secure connection via MetaMask and other EIP-1193 compatible wallets.
- **On-chain Proposals**: Create governance proposals directly on the Base blockchain.
- **Real-time Voting**: Cast 'Yes' or 'No' votes with instant blockchain state updates.
- **Session Persistence**: Maintain wallet connectivity across page refreshes and navigation.
- **Network Safety**: Built-in network detection and automatic switching to Base Mainnet.
- **Responsive UI**: Professional dashboard styled with Tailwind CSS and Radix UI.

## Architecture

### Frontend Layer
- **Framework**: React 18 with TypeScript.
- **State Management**: Context-based Web3 provider managing global wallet and contract state.
- **Routing**: Client-side navigation using React Router.

### Blockchain Layer
- **Network**: Base Mainnet (Chain ID: 8453).
- **Interactions**: Ethers.js v6 for robust contract communication.
- **Persistence**: Hybrid approach using on-chain data and local storage for UI state.

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React, Vite, TypeScript |
| Styling | Tailwind CSS, Lucide Icons |
| UI Components | shadcn/ui (Radix UI) |
| Web3 Library | Ethers.js v6 |
| Blockchain | Base Mainnet |

## Installation & Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   pnpm install
   ```
3. **Configure Environment**: Ensure `VITE_CHAIN` is set appropriately in your environment.
4. **Run Development Server**:
   ```bash
   pnpm dev
   ```

## Smart Contract Details

- **Contract Name**: RapidDAO
- **Mainnet Address**: `0xBb950c8612FB7A51b2b2Fc52ac24b9F395122925`
- **Network**: Base Mainnet
- **RPC URL**: `https://mainnet.base.org`

## Development Workflow

The project follows a standard Vite-based React workflow:
- Components are located in `/src/components`
- Page-level logic in `/src/pages`
- Global Web3 state in `/src/context/Web3Context.tsx`
- Contract ABI and addresses in `metadata.json`



**Submitted for CodeNut Global Vibe AI Web3 Hackathon 2025**
