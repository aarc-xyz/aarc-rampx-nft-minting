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

export const MINTING_CONTRACT_ADDRESS = "0xb5d19615088272Db49d12F317BF9481b2C236854";