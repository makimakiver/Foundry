// Example Move Smart Contract Update for SuiNS Name Storage
// File: sources/ideation.move

module foundry::ideation {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::event;

    // ========================================================================
    // UPDATED STRUCT: Added suins_name field
    // ========================================================================
    struct Idea has key, store {
        id: UID,
        name: String,              // Original project name
        suins_name: String,        // NEW: SuiNS name (e.g., "my-project.sui")
        blob_id: ID,               // Walrus blob ID for metadata
        image: String,             // Project image URL
        funding_goal: u64,         // Funding goal amount
        current_funding: u64,      // Current funding amount
        creator: address,          // Project creator address
        timestamp: u64,            // Creation timestamp
    }

    struct Registry has key {
        id: UID,
        ideas: vector<Idea>,
    }

    // Event emitted when a new idea is suggested
    struct IdeaSuggested has copy, drop {
        idea_id: ID,
        name: String,
        suins_name: String,        // NEW: Include SuiNS name in event
        creator: address,
    }

    // ========================================================================
    // UPDATED FUNCTION: Added suins_name parameter
    // ========================================================================
    /// Suggest a new project idea with SuiNS name
    /// 
    /// # Arguments
    /// * `registry` - The registry to add the idea to
    /// * `name` - The original project name
    /// * `suins_name` - The SuiNS name (e.g., "my-project.sui")
    /// * `blob_id` - The Walrus blob ID containing project metadata
    /// * `image` - The project image URL
    /// * `coin` - The funding coin
    /// * `ctx` - The transaction context
    public entry fun suggest_idea(
        registry: &mut Registry,
        name: String,
        suins_name: String,        // NEW PARAMETER (position 3)
        blob_id: ID,
        image: String,
        coin: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let creator = tx_context::sender(ctx);
        let funding_amount = coin::value(&coin);
        let timestamp = tx_context::epoch(ctx);

        // Create the idea with SuiNS name
        let idea = Idea {
            id: object::new(ctx),
            name,
            suins_name,            // Store SuiNS name
            blob_id,
            image,
            funding_goal: funding_amount,
            current_funding: 0,
            creator,
            timestamp,
        };

        let idea_id = object::id(&idea);

        // Emit event with SuiNS name
        event::emit(IdeaSuggested {
            idea_id,
            name: idea.name,
            suins_name: idea.suins_name,  // Include in event
            creator,
        });

        // Add to registry
        vector::push_back(&mut registry.ideas, idea);

        // Transfer the coin to the registry or treasury
        // (Implement your funding logic here)
        transfer::public_transfer(coin, creator);
    }

    // ========================================================================
    // GETTER FUNCTIONS
    // ========================================================================

    /// Get the SuiNS name of an idea
    public fun get_suins_name(idea: &Idea): String {
        idea.suins_name
    }

    /// Get the original name of an idea
    public fun get_name(idea: &Idea): String {
        idea.name
    }

    /// Get idea by SuiNS name (helper for lookups)
    public fun find_by_suins_name(registry: &Registry, suins_name: String): Option<&Idea> {
        let ideas = &registry.ideas;
        let len = vector::length(ideas);
        let i = 0;
        
        while (i < len) {
            let idea = vector::borrow(ideas, i);
            if (idea.suins_name == suins_name) {
                return option::some(idea)
            };
            i = i + 1;
        };
        
        option::none()
    }

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    /// Initialize the registry (called once during deployment)
    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            ideas: vector::empty(),
        };
        
        transfer::share_object(registry);
    }

    // ========================================================================
    // TESTING
    // ========================================================================

    #[test_only]
    public fun test_suggest_idea_with_suins() {
        use sui::test_scenario;
        use std::string;

        let admin = @0xAD;
        let user = @0xUSER;

        let scenario = test_scenario::begin(admin);
        
        // Initialize
        {
            init(test_scenario::ctx(&mut scenario));
        };

        // User suggests an idea
        test_scenario::next_tx(&mut scenario, user);
        {
            let registry = test_scenario::take_shared<Registry>(&scenario);
            let coin = coin::mint_for_testing<SUI>(1000000, test_scenario::ctx(&mut scenario));
            
            suggest_idea(
                &mut registry,
                string::utf8(b"My Awesome Project"),
                string::utf8(b"my-awesome-project.sui"),  // SuiNS name
                object::id_from_address(@0xBLOB),
                string::utf8(b"https://image.url"),
                coin,
                test_scenario::ctx(&mut scenario)
            );

            // Verify the idea was added with SuiNS name
            let ideas = &registry.ideas;
            assert!(vector::length(ideas) == 1, 0);
            
            let idea = vector::borrow(ideas, 0);
            assert!(idea.suins_name == string::utf8(b"my-awesome-project.sui"), 1);
            assert!(idea.name == string::utf8(b"My Awesome Project"), 2);

            test_scenario::return_shared(registry);
        };

        test_scenario::end(scenario);
    }
}

