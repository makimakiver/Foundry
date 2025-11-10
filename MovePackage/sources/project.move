module vendor3::ideation {
    // --- imports
    use std::string::String;
    use std::macros::range_do;
    use sui::table::{Self, Table};
    use usdc::usdc::{USDC};
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Self, Coin};
    use sui::dynamic_object_field as df;
    use sui::dynamic_object_field as dof;
    use suins::suins_registration::{SuinsRegistration};
    use suins::subdomain_registration::{SubDomainRegistration};
    use vendor3::contribution::{Self, Application};
    use vendor3::suins_util;
    use walrus::blob::{Blob};
    use sui::coin::from_balance;

    // ---Enum
    public enum State has copy, drop, store {
        Hiring,
        InProgress,
        Completed
    }

    // public structs
    public struct Registry has key {
        id: UID,
        projects: vector<ID>,
        project_jobs: Table<ID, JobVault>,
        accessible_project: Table<address, vector<ID>>
    }

    public struct Project has key, store {
        id: UID,
        title: String,
        details: Blob,
        image_url: String,
        funding_goal: u64,
        open: bool,
        supporters: vector<address>,
        currentfunding: u64,
        category: String,
        // roles: vector<String>,
        // roles_num: Table<String, u64>
    }

    public struct ProjectCap has key, store {
        id: UID,
        project_id: ID
    }

    public struct ProjectCommunityVault has key, store {
        id: UID,
        project_sui_name: SuinsRegistration,
    }

    public struct AccountNSRegistry has key, store {
        id: UID,
        registry: Table<address, vector<String>>
    }

    public struct Job has key, store {
        id: UID,
        validator: address,
        details: vector<u8>,
        state: State,
        category: u64,
        prize_pool: Balance<USDC>,
        requirement: Requirement,
        applicants: vector<address>,
        applications: Table<address, Application>,
        selected: vector<address>,
        num_workers: u64,
    }

    public struct Requirement has key, store {
        id: UID,
        role: vector<String>,
        role_amount: vector<u64>,
        org: vector<String>,
        org_amount: vector<u64>,
    }

    public struct JobVault has key, store {
        id: UID,
        jobs: vector<Job>
    }

    public struct WrappedRole has key {
        id: UID,
        role: String,
        role_ns: SuinsRegistration
    }

    // --- Private functions
    // will create idea_registry, reward_pool, and reward_cap
    fun init(ctx: &mut TxContext) {
        let zero_vec = vector::empty<ID>();
        let vault_map = table::new<ID, JobVault>(ctx);
        let accessible_project_map = table::new<address, vector<ID>>(ctx);
        let registry = Registry {
            id: object::new(ctx),
            projects: zero_vec,
            project_jobs: vault_map,
            accessible_project: accessible_project_map
        };    
        let acc_registry = table::new<address, vector<String>>(ctx);
        let ns_registry = AccountNSRegistry {
            id: object::new(ctx),
            registry: acc_registry
        };
        transfer::share_object(registry);
        transfer::share_object(ns_registry);
    }

    fun mint_project(
        title: String, 
        details: Blob, 
        funding_goal: u64,
        image_url: String, 
        category: String,
        ctx: &mut TxContext
    ): Project {
        let idea = Project {
            id: object::new(ctx),
            title,
            details,
            image_url,
            funding_goal,
            open: true,
            supporters: vector::singleton(ctx.sender()),
            currentfunding: 0,
            category
        };
        idea
    }

    fun mint_job_vault(
        ctx: &mut TxContext
    ): JobVault {
        let jobs = JobVault {
            id: object::new(ctx),
            jobs: vector::empty<Job>()
        };
        jobs
    }

    fun mint_project_owner_cap(
        self: &Project, 
        ctx: &mut TxContext
    ): ProjectCap {
        let cap = ProjectCap {
            id: object::new(ctx),
            project_id: self.id.to_inner()
        };
        cap
    }

    fun mint_requirement(
        role: vector<String>,
        role_amount: vector<u64>,
        org: vector<String>,
        org_amount: vector<u64>,
        ctx: &mut TxContext
    ): Requirement {
        assert!(role.length() >= 0, 0);
        assert!(role_amount.length() >= 0, 1);
        assert!(org.length() >= 0, 2);
        assert!(org_amount.length() >= 0, 3);
        assert!(role.length() == role_amount.length(), 4);
        assert!(org.length() == org_amount.length(), 5);
        let requirement = Requirement {
            id: object::new(ctx),
            role,
            role_amount,
            org,
            org_amount
        };
        requirement
    }

    fun find_job_index(id: ID, vault: &JobVault): u64 {
        let len = vault.jobs.length();
        let mut i = 0;
        while (i < len) {
            if (vault.jobs.borrow(i).id.to_inner() == id) return i;
            i = i + 1;
        };
        abort 0
    }
    // --- Entry function
    entry fun seal_approve(id: vector<u8>, aggregator: &Registry, project: &Project, job_id: ID, registry: &AccountNSRegistry, ctx: &TxContext){
        let vault = aggregator.project_jobs.borrow(project.id.to_inner());
        let job_idx = find_job_index(job_id, vault);
        let job = vault.jobs.borrow(job_idx);
        if (registry.registry.contains(ctx.sender())){
            let domain_holdings = registry.registry.borrow(ctx.sender());
            let role = suins_util::decompose_role_vector(domain_holdings);
            let requirement_role = job.requirement.role;
            let requirement_role_num = job.requirement.role_amount;
            // let mut count = 0;
            assert!(requirement_role.length() == requirement_role_num.length(), 0);
            range_do!(0, requirement_role.length(), |i| {
                let label = requirement_role.borrow(i);
                let required_role_amount = requirement_role_num.borrow(i);
                let role_holding = vector::count!(&role, |holding: &String| holding == label);
                assert!(role_holding >= *required_role_amount, 1)
            });
            let org = suins_util::decompose_org_vector(domain_holdings);
            let requirement_org = job.requirement.org;
            let requirement_org_num = job.requirement.org_amount;
            // let mut count = 0;
            assert!(requirement_org.length() == requirement_org_num.length(), 2);
            range_do!(0, requirement_org.length(), |i| {
                let label = requirement_org.borrow(i);
                let required_org_amount = requirement_org_num.borrow(i);
                let org_holding = vector::count!(&org, |holding: &String| holding == label);
                assert!(org_holding >= *required_org_amount, 3)
            });
        }
        else{
            let requirement_role = job.requirement.role;
            assert!(requirement_role.length() == 0, 4);
            let requirement_org = job.requirement.org;
            assert!(requirement_org.length() == 0, 5);
        }
    }

    entry fun add_address_to_project_id(
        self: &mut Registry,
        project: &Project,
        ctx: &TxContext
    ){
        if (!self.accessible_project.contains(ctx.sender())){
            let roles = vector::singleton<ID>(project.id.to_inner());
            self.accessible_project.add<address, vector<ID>>(ctx.sender(), roles);
        }
        else {
            self.accessible_project.borrow_mut(ctx.sender()).push_back(project.id.to_inner());
        }
    }

    // submitting the application to job request
    entry fun submit_application(aggregator: &mut Registry, project: &Project, job_id: ID, details: Blob, clock: &Clock, ctx: &mut TxContext){
        let vault = aggregator.project_jobs.borrow_mut(project.id.to_inner());
        let job_idx = find_job_index(job_id, vault);
        let job = vault.jobs.borrow_mut(job_idx);
        assert!(!job.applicants.contains(&ctx.sender()), 0);
        assert!(!job.applications.contains(ctx.sender()), 1);
        let application = contribution::mint_application(details, clock, ctx);
        job.applications.add(ctx.sender(), application);
        job.applicants.push_back(ctx.sender());
    }

    // add target to the execution team
    entry fun add_member(aggregator: &mut Registry, project: &Project, job_id: ID, target: address, ctx: &TxContext){
        let vault = aggregator.project_jobs.borrow_mut(project.id.to_inner());
        let job_idx = find_job_index(job_id, vault);
        let job = vault.jobs.borrow_mut(job_idx);
        assert!(ctx.sender() == job.validator, 0);
        assert!(job.applicants.contains(&target), 1);
        assert!(job.applications.contains(target), 2);
        job.selected.push_back(target);
        if(job.num_workers == job.selected.length()){
            job.state = State::InProgress;
        };
    }
    // --- Public function
    public fun create_job(
        self: &mut Registry,
        project: &Project,
        details: vector<u8>,
        role: vector<String>,
        role_amount: vector<u64>,
        org: vector<String>,
        org_amount: vector<u64>,
        validator: address,
        category: u64,
        coin: Coin<USDC>,
        max_people: u64,

        ctx: &mut TxContext
    ){
        let requirement = mint_requirement(role, role_amount, org, org_amount, ctx);
        let job = Job {
            id: object::new(ctx),
            validator,
            details,
            state: State::Hiring,
            category,
            prize_pool: coin.into_balance(),
            requirement,
            applicants: vector::empty<address>(),
            applications: table::new<address, Application>(ctx),
            selected: vector::empty<address>(),
            num_workers: max_people
        };
        self.project_jobs.borrow_mut(project.id.to_inner()).jobs.push_back(job);
    }

    public fun add_job_identity_info(
        self: &mut AccountNSRegistry,
        role: &SubDomainRegistration,
        target: address
    ){
        if (!self.registry.contains(target)){
            let roles = vector::singleton<String>(role.nft().domain().to_string());
            self.registry.add<address, vector<String>>(target, roles);
        }
        else {
            self.registry.borrow_mut(target).push_back(role.nft().domain().to_string());
        }
    }

    public fun project_Id(self: &Project): ID {
        self.id.to_inner()
    }

    public fun get_supporters(self: &Project): vector<address> {
        self.supporters
    }
    
    public fun get_accessible_projects(self: &Registry, ctx: &TxContext): vector<ID> {
        *self.accessible_project.borrow(ctx.sender())
    }

    #[allow(lint(self_transfer))]
    public fun create_project(self: &mut Registry, title: String, details: Blob, image_url: String, funding_goal: u64, category: String, ctx: &mut TxContext): Project {
        let project = mint_project(title, details, funding_goal, image_url, category, ctx);
        self.add_address_to_project_id(&project, ctx);
        let vault = mint_job_vault(ctx);
        let cap = mint_project_owner_cap(&project, ctx);
        self.project_jobs.add<ID, JobVault>(project.id.to_inner(), vault);
        self.projects.push_back(project.id.to_inner());
        transfer::public_transfer(cap, ctx.sender());
        project
    }

    #[allow(lint(self_transfer))]
    public fun complete_job(aggregator: &mut Registry, project: &Project, job_id: ID, ctx: &mut TxContext) {
        let vault = aggregator.project_jobs.borrow_mut(project.id.to_inner());
        let job_idx = find_job_index(job_id, vault);
        let job = vault.jobs.borrow_mut(job_idx);
        assert!(ctx.sender() == job.validator, 0);
        let mut reward = job.prize_pool.withdraw_all();
        job.state = State::Completed;
        let reward_amount = reward.value();
        range_do!(0, job.selected.length(), |i| {
            let amount = reward_amount / job.selected.length();
            let salary = reward.split(amount);
            transfer::public_transfer(salary.into_coin(ctx), *job.selected.borrow(i));
        });
        transfer::public_transfer(reward.into_coin(ctx), ctx.sender());
    }
}