module vendor3::contribution {

    use sui::clock::{Self, Clock};
    use sui::coin::{Coin};
    use sui::table::{Self, Table};
    use walrus::blob::{Blob};
    use suins::subdomain_registration::SubDomainRegistration;

    // --- structs ---
    public struct Application has key, store {
        id: UID,
        from: address,
        details: Blob,
        submitted_time: u64
    }
    public struct AccountRegistry has key {
        id: UID,
        registry: Table<address, ID>
    }

    public struct Account has key, store {
        id: UID,
        details: Blob, 
        contributions: vector<Contribution>,
        roles: vector<SubDomainRegistration>
    }

    public struct Contribution has key, store {
        id: UID,
        details: Blob,
        nft: SubDomainRegistration
    }

    fun init(ctx: &mut TxContext){
        let acc_reg = AccountRegistry {
            id: object::new(ctx),
            registry: table::new<address, ID>(ctx)
        };
        transfer::share_object(acc_reg);
    }
    
    public(package) fun mint_application(details: Blob, clock: &Clock, ctx: &mut TxContext): Application {
        let application = Application {
            id: object::new(ctx),
            from: ctx.sender(),
            details,
            submitted_time: clock::timestamp_ms(clock)
        };
        application
    }

    #[allow(lint(self_transfer))]
    public fun register_account(
        registry: &mut AccountRegistry,
        details: Blob, 
        contributions: vector<Contribution>, 
        roles: vector<SubDomainRegistration>,
        ctx: &mut TxContext
    ) {
        let acc = Account {
            id: object::new(ctx),
            details,
            contributions,
            roles
        };
        registry.registry.add(ctx.sender(), acc.id.to_inner());
        transfer::public_transfer(acc, ctx.sender());
    }
}
