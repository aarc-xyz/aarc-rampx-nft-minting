import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { ethers } from 'ethers';
import { AarcFundKitModal } from '@aarc-dev/fundkit-web-sdk';
import { MINTING_CONTRACT_ADDRESS } from '../constants';
import { Navbar } from './Navbar';
import StyledConnectButton from './StyledConnectButton';
import { NFT } from '../types/nft';

const ETH_TO_BRETT_RATE = 71000; // 1 ETH = 71k BRETT
const HARDCODED_PRICE = 0.0017; // Hardcoded price in ETH

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

    const fetchNFTs = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `https://api.opensea.io/api/v2/collection/the-rbtz/nfts?limit=20`,
                {
                    headers: {
                        'X-API-KEY': import.meta.env.VITE_OPENSEA_API_KEY,
                        'Accept': 'application/json'
                    }
                }
            );

            const data = await response.json();
            console.log(data);

            const results = data.nfts;
            setNfts(results);
        } catch (error) {
            console.error('Error fetching NFTs:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeposit = async () => {
        if (!address || !selectedNFT) return;

        try {
            setIsProcessing(true);

            // Create the contract interface with mintTo function
            const simpleDappInterface = new ethers.Interface([
                "function mintTo(address recipient, uint256 quantity) external payable"
            ]);

            // Generate the contract payload for minting to the user's address
            const contractPayload = simpleDappInterface.encodeFunctionData("mintTo", [
                address, // recipient: user's address
                1 // quantity: mint 1 NFT
            ]);

            console.log(contractPayload);

            // Update the amount in ETH, price is hardcoded to 0.0001 ETH for this contract
            aarcModal.updateRequestedAmount(0.0001);

            // Update Aarc's destination contract configuration
            aarcModal.updateDestinationContract({
                contractAddress: MINTING_CONTRACT_ADDRESS,
                contractName: "RampX Mint",
                contractGasLimit: "200000",
                contractPayload: contractPayload, // Required by v4 interface
                calldataABI: JSON.stringify(simpleDappInterface.fragments), // Use the ABI fragments for v4
                calldataParams: contractPayload, // Use the encoded function data as params for v4
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

    const shouldDisableInteraction = !selectedNFT;

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
                                                {HARDCODED_PRICE} ETH
                                                <span className="text-xs ml-1">
                                                    ({convertEthToBrett(HARDCODED_PRICE).toFixed(2)} BRETT)
                                                </span>
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