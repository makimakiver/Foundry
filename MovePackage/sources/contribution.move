module vendor3::contribution {

    use walrus::blob::{Self, Blob};
    use std::string::{Self, String};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::dynamic_object_field as dof;
    use sui::dynamic_field as df;
    use sui::coin::{Self, Coin};
    use suins::{ 
        suins::SuiNS,
        registry::Registry,
        domain,
        suins_registration::SuinsRegistration
    };
    use sui::clock::{Clock};
    
    // --- Error message
    const ENameNotFound: u64 = 0;
    const ENameNotPointingToAddress: u64 = 1;
    const ENameExpired: u64 = 2;
    const MONTH_MS: u64 = 30 * 24 * 60 * 60 * 1000;
    // --- structs ---
    public struct MovePackage has key, store {
        id: UID,
        sources: MoveFiles,
        move_lock: Blob,
        move_toml: Blob,
        // store the tests
    }

    public struct MoveFiles has key, store {
        id: UID,
        file_names: vector<String>,
        content: Blob
    }

    public struct TestFile has key, store {
        id: UID,
        file_names: vector<String>,
        content: Blob,
        test: vector<Test>
    }

    // reward can be our original token
    public struct Test has key, store {
        id: UID,
        title: String,
        reward_pool: Balance<SUI>
        // path: String
    }
    
    public struct TestSolvedCap has key {
        id: UID,
        test_id: ID
    }
    // --- functions: mint files ---
    /// Creates a new MoveFile object (does not transfer).
    fun create_sources(
        file_names: vector<String>,
        content: Blob,
        test: &mut Option<vector<Test>>,
        ctx: &mut TxContext
    ): MoveFiles {
        let id = sui::object::new(ctx);
        // want to add verification layer for validating whether the file_name is valid for the quilt
        let mut move_file = MoveFiles { id, file_names, content };
        if(test.is_some()) {
            let test_list = test.extract();
            df::add(&mut move_file.id, b"tests".to_string(), test_list);
        };
        move_file
    }

    public(package) fun create_proposal_vault(
        title: String,
        fund: Balance<SUI>,
        ctx: &mut TxContext
    ): Test {
        let test = Test {
            id: object::new(ctx),
            title,
            reward_pool: fund
        };
        test
    }

    #[allow(lint(self_transfer))]
    fun receive_reward(self: &TestSolvedCap, test_vault: &mut Test, ctx: &mut TxContext) {
        assert!(self.test_id == test_vault.id.to_inner(), 0);
        let withdrawn = test_vault.reward_pool.withdraw_all();
        let reward = coin::from_balance(withdrawn, ctx);
        transfer::public_transfer(reward, ctx.sender())
    }

    /// Entry: mints a MoveFile to the transaction sender.
    entry fun mint_move_package(
        file_names: vector<String>,
        content: Blob,
        ctx: &mut TxContext
    ) {
        let mut none = option::none();
        let f = create_sources(file_names, content, &mut none, ctx);
        option::destroy_none(none);
        transfer::transfer(f, ctx.sender());
    }

    //     /// A function to transfer an object of any type T to a name (for instance `example.sui`)
    // #[allow(lint(self_transfer))]
    // public fun assign_test_name(suins: &mut SuiNS, parent: &SuinsRegistration, name: String, clock: &Clock, test: &Test, ctx: &mut TxContext) {
    //     subdomains::new_leaf(suins, parent, clock, test.title, test.id.to_address(), ctx);
    //     let subname = subdomains::new(suins, parent, clock, test.title, clock.timestamp_ms(), true, true, ctx);
    //     transfer::public_transfer(subname, ctx.sender());
    // }

    // you have to pass domain name with .sui
    // #[allow(lint(self_transfer))]
    // public fun assign_test_name_test(suins: &mut SuiNS, parent: &SuinsRegistration, clock: &Clock, project_name: &mut String, ctx: &mut TxContext) {
    //     let test = Test {
    //         id: object::new(ctx),
    //         title: b"foundry.sui".to_string(),
    //         reward_pool: balance::zero()
    //     };
    //     let foundry = b".foundry.sui".to_string();
    //     string::append(project_name, foundry);
    //     subdomains::new_leaf(suins, parent, clock, *project_name, test.id.to_address(), ctx);
    //     let subname = subdomains::new(suins, parent, clock, *project_name, clock.timestamp_ms()+MONTH_MS, true, true, ctx);
    //     transfer::public_transfer(subname, ctx.sender());
    // }

    // distribute the reward when users have solved the test
    entry fun solve_tests(){
    }

    // encrypt the access
    entry fun seal_approve(id: vector<u8>) {

    }

    // distributing on-chain identiry visa suins
}
