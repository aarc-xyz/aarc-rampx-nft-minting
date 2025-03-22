export interface Listing {
    order_hash: string;
    price: {
        current: {
            value: string;
            decimals: number;
        };
    };
    protocol_data: {
        parameters: {
            offerer: string;
            zone: string;
            offer: {
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
            }[];
            consideration: {
                itemType: number;
                token: string;
                identifierOrCriteria: string;
                startAmount: string;
                endAmount: string;
                recipient: string;
            }[];
            startTime: string;
            endTime: string;
            zoneHash: string;
            salt: string;
            conduitKey: string;
            signature: string;
        };
    };
}

export interface Trait {
    trait_type: string;
    display_type?: string;
    max_value: string;
}

export interface NFT {
    identifier: string;
    collection: string;
    contract: string;
    token_standard: string;
    name: string;
    description: string;
    image_url?: string;
    display_image_url?: string;
    display_animation_url?: string;
    metadata_url?: string;
    opensea_url?: string;
    updated_at: string;
    is_disabled: boolean;
    is_nsfw: boolean;
    animation_url?: string;
    is_suspicious: boolean;
    creator: string;
    traits: Trait[];
    listing?: Listing;
} 