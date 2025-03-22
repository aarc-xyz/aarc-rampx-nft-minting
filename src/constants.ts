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

export const SEAPORT_ADDRESS = "0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC"; 

export const BASE_RPC_URL = "https://mainnet.base.org";