import {
  FKConfig,
  ThemeName,
  TransactionSuccessData,
  TransactionErrorData,
  SourceConnectorName,
  DefaultMode,
} from "@aarc-dev/fundkit-web-sdk";
import { MINTING_CONTRACT_ADDRESS } from "../constants";

export const aarcConfig: FKConfig = {
  appName: "RampX x Aarc",
  dappId: "rampx-nft-minting", // Required for v4
  userId: "placeholder-user-id", // Required for v4 - will be updated dynamically
  headerText: "Fund Your Wallet to Mint NFT", // Optional custom header
  defaultMode: DefaultMode.EXCHANGE, // Optional default mode
  module: {
    exchange: {
      enabled: true,
      moduleName: "Exchange", // Optional custom name
      quoteRefreshTime: 60, // Custom refresh time in seconds
    },
    onRamp: {
      enabled: true,
      onRampConfig: {},
      moduleName: "OnRamp", // Optional custom name
      quoteRefreshTime: 60, // Custom refresh time in seconds
    },
    bridgeAndSwap: {
      enabled: true,
      fetchOnlyDestinationBalance: false,
      routeType: "Value",
      moduleName: "Bridge & Swap", // Optional custom name
      quoteRefreshTime: 60, // Custom refresh time in seconds
      connectors: [SourceConnectorName.ETHEREUM],
    },
    qrPay: {
      enabled: true,
      moduleName: "QR Pay", // Optional custom name
      quoteRefreshTime: 20, // Custom refresh time in seconds
      refundAddress: MINTING_CONTRACT_ADDRESS, // Required for v4
    },
  },
  destination: {
    contract: {
      contractAddress: MINTING_CONTRACT_ADDRESS,
      contractName: "RampX NFT",
      contractLogoURI: "https://rampx.app/logo.png",
      contractGasLimit: "300000", // Standard gas limit, can be adjusted if needed
      contractPayload: "", // Required field, will be updated dynamically
      calldataABI: "", // Will be updated dynamically
      calldataParams: "", // Will be updated dynamically
    },
    walletAddress: MINTING_CONTRACT_ADDRESS,
    chainId: 42161, // Arbitrum chain ID
    tokenAddress: "0x0000000000000000000000000000000000000000", // ETH on Arbitrum
  },
  appearance: {
    roundness: 42,
    theme: ThemeName.DARK,
  },
  apiKeys: {
    aarcSDK: import.meta.env.VITE_AARC_API_KEY,
  },
  events: {
    onTransactionSuccess: (data: TransactionSuccessData) => {
      console.log("Transaction successful:", data);
    },
    onTransactionError: (data: TransactionErrorData) => {
      console.error("Transaction failed:", data);
    },
    onWidgetClose: () => {
      console.log("Widget closed");
    },
    onWidgetOpen: () => {
      console.log("Widget opened");
    },
  },
  origin: window.location.origin,
}; 