module vendor3::contribution {
    use walrus::blob::{Blob};
    use sui::clock::{Self, Clock};
    
    // --- structs ---
    public struct Application has key, store {
        id: UID,
        from: address,
        details: Blob,
        submitted_time: u64
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
}
