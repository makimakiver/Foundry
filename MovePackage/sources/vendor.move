module vendor3::buid {
    use sui::coin::{Self, DenyCapV2};
    use sui::coin_registry;
    use sui::deny_list::DenyList;
    use sui::url;
    public struct BUID has drop {}

    fun init(witness: BUID, ctx: &mut TxContext) {
        let (mut treasury_cap, mut metadata) = coin::create_currency(
            witness,
            9, // Decimals
            b"BUID", // Symbol
            b"BUID Coin", // Name
            b"Currency with DenyList Support", // Description
            option::some(url::new_unsafe_from_bytes(b"https://lime-adorable-ant-337.mypinata.cloud/ipfs/bafybeia3kms3aw67kzuj4v7ixuge3ni3soyxbiymu6yremslsmsjsplcn4?pinataGatewayToken=ENQNk1o-lof8hP0fSPVQeb7DVGFDnEuzsCq9A4YT0HlJbSOQW1t0vNNqsDE_cJkD")), // Icon URL
            ctx,
        );
        
        let sender = ctx.sender();
        coin::mint_and_transfer(&mut treasury_cap, 1_000_000_000, sender, ctx);
        transfer::public_transfer(treasury_cap, sender);
        transfer::public_freeze_object(metadata);
    }

    public fun add_addr_from_deny_list(
        denylist: &mut DenyList,
        denycap: &mut DenyCapV2<BUID>,
        denyaddy: address,
        ctx: &mut TxContext,
    ) {
        coin::deny_list_v2_add(denylist, denycap, denyaddy, ctx);
    }

    public fun remove_addr_from_deny_list(
        denylist: &mut DenyList,
        denycap: &mut DenyCapV2<BUID>,
        denyaddy: address,
        ctx: &mut TxContext,
    ) {
        coin::deny_list_v2_remove(denylist, denycap, denyaddy, ctx);
    }

    // probably adding minting functionality here
}