export enum SupportedChainId {
    BASE = 8453,
    ETHEREUM = 1
}

export type AddressMap = {
    [chainId: number]: string;
};

export const THE_RBTZ_NFT_CONTRACT_ADDRESS: AddressMap = {
    [SupportedChainId.ETHEREUM]: '0x4db9e0d1631491a3edba3e2cc9e581cac1d29699'
};

export const MINTING_CONTRACT_ADDRESS = "0x45c0470ef627a30efe30c06b13d883669b8fd3a8";


export const BASE_RPC_URL = "https://mainnet.base.org";