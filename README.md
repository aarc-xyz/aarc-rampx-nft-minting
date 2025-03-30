# Cross-Chain NFT Minting with Aarc

This guide demonstrates how to implement cross-chain NFT minting using Aarc's FundKit SDK. We'll create a simple dApp that allows users to mint NFTs on Arbitrum using funds from any supported chain.

## Prerequisites

- Node.js and npm installed
- Basic understanding of React and Web3 development
- An Aarc API key

## Quick Start

1. Clone the example repository:
```bash
git clone https://github.com/aarc-xyz/aarc-rampx-nft-minting
cd aarc-rampx-nft-minting
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Aarc API key:
```env
VITE_AARC_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## Implementation Guide

### 1. Setup Aarc Configuration

Create a configuration file for Aarc's FundKit SDK:

```typescript
import { FKConfig, ThemeName } from "@aarc-xyz/fundkit-web-sdk";

export const aarcConfig: FKConfig = {
  appName: "Cross-Chain NFT Minting",
  module: {
    exchange: { enabled: true },
    onRamp: { enabled: true },
    bridgeAndSwap: {
      enabled: true,
      fetchOnlyDestinationBalance: false,
      routeType: "Value",
      connectors: [SourceConnectorName.ETHEREUM],
    },
  },
  destination: {
    contract: {
      contractAddress: "YOUR_CONTRACT_ADDRESS",
      contractName: "NFT Minting Contract",
      contractGasLimit: "200000",
    },
    chainId: 42161, // Arbitrum
    tokenAddress: "0x0000000000000000000000000000000000000000", // ETH
  },
  appearance: {
    theme: ThemeName.DARK,
    roundness: 42,
  },
  apiKeys: {
    aarcSDK: import.meta.env.VITE_AARC_API_KEY,
  },
};
```

### 2. Create the Minting Component

```typescript
import { useState } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';

export const NFTMintingComponent = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
  const { address } = useAccount();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleMint = async () => {
    if (!address) return;

    try {
      setIsProcessing(true);
      
      // Create contract interface
      const contractInterface = new ethers.Interface([
        "function mintTo(address recipient, uint256 quantity) external payable"
      ]);

      // Generate minting payload
      const contractPayload = contractInterface.encodeFunctionData("mintTo", [
        address,
        1
      ]);

      // Update Aarc configuration
      aarcModal.updateRequestedAmount(0.0001); // Mint price in ETH
      aarcModal.updateDestinationContract({
        contractAddress: "YOUR_CONTRACT_ADDRESS",
        contractPayload,
        contractGasLimit: "200000"
      });

      // Open Aarc modal
      aarcModal.openModal();
      setIsProcessing(false);
    } catch (error) {
      console.error("Minting error:", error);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handleMint}
      disabled={isProcessing || !address}
      className="mint-button"
    >
      {isProcessing ? 'Processing...' : 'Mint NFT'}
    </button>
  );
};
```

### 3. User Flow

1. User connects their wallet
2. Clicks the "Mint NFT" button
3. Aarc modal opens showing available payment options
4. User selects their preferred payment method
5. Transaction is processed cross-chain
6. NFT is minted directly to the user's wallet on Arbitrum

![Minting in Progress](/minting-progress.png)
*User selecting payment method in Aarc modal*

![Minting Complete](/minting-complete.png)
*Successfully minted NFT on Arbitrum*

## Example Implementation

You can find a complete working example at:
- GitHub: [aarc-xyz/aarc-rampx-nft-minting](https://github.com/aarc-xyz/aarc-rampx-nft-minting)
- Live Demo: [aarc-rampx-mint.netlify.app](https://aarc-rampx-mint.netlify.app/)

## Support

For additional queries contact [support](https://docs.aarc.xyz/introduction/support):