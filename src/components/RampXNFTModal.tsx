import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-xyz/fundkit-web-sdk';
import { THE_RBTZ_NFT_CONTRACT_ADDRESS, SupportedChainId, MINTING_CONTRACT_ADDRESS } from '../constants';
import { Navbar } from './Navbar';
import StyledConnectButton from './StyledConnectButton';
import { NFT, Listing } from '../types/nft';

const CACHE_KEY = 'rbtz_nft_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes in milliseconds

// Simple minting contract address on mainnet

interface CacheData {
    timestamp: number;
    nfts: NFT[];
}

const getCachedNFTs = (): NFT[] | null => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData: CacheData = JSON.parse(cached);
    if (Date.now() - cacheData.timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
    }

    return cacheData.nfts;
};

const setCachedNFTs = (nfts: NFT[]) => {
    const cacheData: CacheData = {
        timestamp: Date.now(),
        nfts
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
};

const ETH_TO_BRETT_RATE = 71000; // 1 ETH = 71k BRETT

const convertEthToBrett = (ethAmount: number): number => {
    return (ethAmount * ETH_TO_BRETT_RATE);
};

export const RampXNFTModal = ({ aarcModal }: { aarcModal: AarcFundKitModal }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [nfts, setNfts] = useState<NFT[]>([]);
    const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const { address } = useAccount();

    useEffect(() => {
        if (address) {
            fetchNFTs();
        }
    }, [address]);

    const fetchNFTDetails = async (tokenId: string, listing: Listing): Promise<NFT | null> => {
        try {
            const response = await fetch(
                `https://api.opensea.io/api/v2/chain/ethereum/contract/${THE_RBTZ_NFT_CONTRACT_ADDRESS[SupportedChainId.ETHEREUM]}/nfts/${tokenId}`,
                {
                    headers: {
                        'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
                        'Accept': 'application/json'
                    }
                }
            );
            const data = await response.json();

            // Map the API response to our NFT interface
            const nft: NFT = {
                identifier: data.nft.identifier,
                collection: data.nft.collection,
                contract: data.nft.contract,
                token_standard: data.nft.token_standard,
                name: data.nft.name,
                description: data.nft.description,
                image_url: data.nft.image_url,
                display_image_url: data.nft.display_image_url,
                display_animation_url: data.nft.display_animation_url,
                metadata_url: data.nft.metadata_url,
                opensea_url: data.nft.opensea_url,
                updated_at: data.nft.updated_at,
                is_disabled: data.nft.is_disabled,
                is_nsfw: data.nft.is_nsfw,
                animation_url: data.nft.animation_url,
                is_suspicious: data.nft.is_suspicious,
                creator: data.nft.creator,
                traits: data.nft.traits,
                listing
            };

            return nft;
        } catch (error) {
            console.error(`Error fetching NFT details for token ${tokenId}:`, error);
            return null;
        }
    };

    const fetchNFTs = async () => {
        // Check cache first
        const cachedNFTs = getCachedNFTs();
        if (cachedNFTs) {
            setNfts(cachedNFTs);
            return;
        }

        setIsLoading(true);
        try {
            // Get the listings
            const listingsResponse = await fetch(
                'https://api.opensea.io/api/v2/listings/collection/the-rbtz/best?limit=50',
                {
                    headers: {
                        'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
                        'Accept': 'application/json'
                    }
                }
            );
            const listingsData = await listingsResponse.json();

            // Create a Map to track unique NFTs by identifier
            const uniqueNFTs = new Map<string, NFT>();

            // Fetch details for each listed NFT
            const nftPromises = listingsData.listings.map(async (listing: Listing) => {
                const tokenId = listing.protocol_data.parameters.offer[0].identifierOrCriteria;
                const nft = await fetchNFTDetails(tokenId, listing);
                if (nft) {
                    // Only add if we haven't seen this identifier before
                    if (!uniqueNFTs.has(nft.identifier)) {
                        uniqueNFTs.set(nft.identifier, nft);
                    }
                }
                return nft;
            });

            await Promise.all(nftPromises);
            const validNFTs = Array.from(uniqueNFTs.values());
            // Cache the results
            setCachedNFTs(validNFTs);
            setNfts(validNFTs);
        } catch (error) {
            console.error('Error fetching NFTs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!address || !selectedNFT?.listing) return;

        try {
            setIsProcessing(true);

            // Create the simple minting contract interface
            const simpleDappInterface = new ethers.Interface([
                "function mint(address token, address to, uint256 amount) external"
            ]);

            // Hardcoded values for demo
            const tokenAddress = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913"; // USDC on Base
            const amount = "10000";

            // Generate the contract payload for minting
            const contractPayload = simpleDappInterface.encodeFunctionData("mint", [
                tokenAddress,
                MINTING_CONTRACT_ADDRESS,
                amount
            ]);
            // Update the amount in ETH - use the same amount as the working implementation
            aarcModal.updateRequestedAmount(0.01);

            // Update Aarc's destination contract configuration
            aarcModal.updateDestinationContract({
                contractAddress: MINTING_CONTRACT_ADDRESS,
                contractName: "RampX Mint",
                contractGasLimit: "200000",
                contractPayload: contractPayload,
                contractLogoURI: "https://rampx.app/logo.png"
            });

            // Open the Aarc modal
            aarcModal.openModal();
            setSelectedNFT(null);
            setIsProcessing(false);
        } catch (error) {
            console.error("Error preparing deposit:", error);
            setIsProcessing(false);
            aarcModal.close();
        }
    };

    const shouldDisableInteraction = !selectedNFT || !selectedNFT.listing;

    return (
        <div className="min-h-screen bg-aarc-bg grid-background">
            <Navbar />
            <main className="mt-24 gradient-border flex items-center justify-center mx-auto max-w-4xl shadow-[4px_8px_8px_4px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col items-center w-full bg-[#2D2D2D] rounded-[24px] p-8 pb-[22px] gap-3">
                    {!address ? (
                        <StyledConnectButton />
                    ) : (
                        <>
                            {/* NFT Grid */}
                            <div className="w-full grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                                {isLoading ? (
                                    <div className="col-span-3 text-center text-white">Loading NFTs...</div>
                                ) : nfts.length === 0 ? (
                                    <div className="col-span-3 text-center text-white">No NFTs available</div>
                                ) : (
                                    nfts.map((nft) => (
                                        <div
                                            key={nft.identifier}
                                            onClick={() => setSelectedNFT(nft)}
                                            className={`cursor-pointer p-2 rounded-lg border-2 transition-all ${selectedNFT?.identifier === nft.identifier
                                                ? 'border-[#A5E547] bg-[#A5E547]/10'
                                                : 'border-[#424242] hover:border-[#A5E547]/50'
                                                }`}
                                        >
                                            <div className="relative w-full aspect-square mb-2">
                                                <img
                                                    src={nft.display_image_url || nft.image_url || '/placeholder-nft.png'}
                                                    alt={nft.name}
                                                    className="w-full h-full object-cover rounded-lg"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = '/placeholder-nft.png';
                                                    }}
                                                />
                                            </div>
                                            <div className="text-white text-sm truncate">{nft.name}</div>
                                            <div className="text-[#A5E547] text-sm">
                                                {nft.listing ? (
                                                    <>
                                                        {Number(nft.listing.price.current.value) /
                                                            Math.pow(10, nft.listing.price.current.decimals)} ETH
                                                        <span className="text-xs ml-1">
                                                            ({convertEthToBrett(Number(nft.listing.price.current.value) /
                                                                Math.pow(10, nft.listing.price.current.decimals)).toFixed(2)} BRETT)
                                                        </span>
                                                    </>
                                                ) : 'Not Listed'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Buy NFT Button */}
                            <button
                                onClick={handleDeposit}
                                disabled={isProcessing || shouldDisableInteraction}
                                className="w-full h-11 mt-2 bg-[#A5E547] hover:opacity-90 text-[#003300] font-semibold rounded-2xl border border-[rgba(0,51,0,0.05)] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                    {isProcessing ? 'Processing...' : 'Mint NFT'}
                            </button>
                        </>
                    )}

                    {/* Powered by Footer */}
                    <div className="flex flex-col items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-semibold text-[#F6F6F6]">Powered by</span>
                            <img src="/aarc-logo-small.svg" alt="Aarc" />
                        </div>
                        <p className="text-[10px] text-[#C3C3C3]">
                            By using this service, you agree to Aarc <span className="underline cursor-pointer">terms</span>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RampXNFTModal;