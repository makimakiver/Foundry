module vendor3::ideation {
    // --- imports
    use std::string::{Self, String};
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
    use suins_temp_subdomain_proxy::subdomain_proxy;
    use vendor3::contribution::{Self, Application};
    use vendor3::suins_util;
    use sui::coin::from_balance;
    use walrus::blob::{Blob};
    use suins::suins::SuiNS;

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
        roles: vector<String>,
        roles_num: Table<String, u64>
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
            category,
            roles: vector::empty(),
            roles_num: table::new<String, u64>(ctx)
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

    public(package) fun mint_requirement(
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

    public(package) fun mint_job(
        self: Requirement,
        details: vector<u8>,
        validator: address,
        category: u64,
        coin: Coin<USDC>,
        max_people: u64,
        ctx: &mut TxContext
    ): Job {
      let job = Job {
            id: object::new(ctx),
            validator,
            details,
            state: State::Hiring,
            category,
            prize_pool: coin.into_balance(),
            requirement: self,
            applicants: vector::empty<address>(),
            applications: table::new<address, Application>(ctx),
            selected: vector::empty<address>(),
            num_workers: max_people
        };
        job
    }

    public(package) fun find_job_index(id: ID, vault: &JobVault): u64 {
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

    public fun distribute_role(
        self: &mut Project, 
        suins: &mut SuiNS,
        subdomain: &SubDomainRegistration,
        clock: &Clock,
        targets: vector<address>, 
        roles: &mut vector<String>, 
        expiration_timestamp_ms: u64,
        ctx: &mut TxContext
    ) {
        assert!(targets.length() == roles.length(), 0);
        let base_string = subdomain.nft().domain_name();
        range_do!(0, targets.length(), |i| {
            let mut role_number: u64;
            let role_ref = roles.borrow(i);
            let role_key = *role_ref;
            if(!self.roles_num.contains(*roles.borrow(i))) {
                self.roles.push_back(*roles.borrow(i));
                role_number = 0;
                self.roles_num.add(*roles.borrow(i), role_number);
            }
            else {
                role_number = *self.roles_num.borrow(*roles.borrow(i)) + 1;
                let n_ref = self.roles_num.borrow_mut(*roles.borrow(i));
                *n_ref = *n_ref + 1;
                role_number = *n_ref;
            };
            let mut label = role_key; // we can reuse role_key as the starting string
            string::append(&mut label, b"-".to_string());
            string::append(&mut label, role_number.to_string());
            string::append(&mut label, b".".to_string());
            string::append(&mut label, base_string);
            let role_nft = subdomain_proxy::new(suins, subdomain, clock, label, expiration_timestamp_ms, true, true, ctx);
            transfer::public_transfer(role_nft, *targets.borrow(i));
        });
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

    public fun get_job_mut_applications(self: &mut Job): &mut Table<address, Application> {
        &mut self.applications
    }

    public fun get_job_mut_applicants(self: &mut Job): &mut vector<address> {
        &mut self.applicants
    }  
    
    public fun get_job_applications(self: &Job): &Table<address, Application> {
        &self.applications
    }

    public fun get_job_applicants(self: &Job): &vector<address> {
        &self.applicants
    }  

    public fun get_project_id(self: &Project): ID {
        self.id.to_inner()
    }

    public fun get_project_supporters(self: &Project): vector<address> {
        self.supporters
    }
    
    public fun get_registry_projects(self: &Registry, ctx: &TxContext): vector<ID> {
        *self.accessible_project.borrow(ctx.sender())
    }

    public fun get_registry_project_table(self: &Registry): &Table<ID, JobVault> {
        &self.project_jobs
    }

    public fun get_registry_mut_project_table(self: &mut Registry): &mut Table<ID, JobVault> {
        &mut self.project_jobs
    }

    public fun get_nsregistry_registry(self: &AccountNSRegistry): &Table<address, vector<String>>{
        &self.registry
    }

    public fun get_requirement_job(self: &Job): &Requirement {
        &self.requirement
    }

    public fun get_requirement_role(self: &Requirement): &vector<String> {
        &self.role
    }

    public fun get_requirement_role_amount(self: &Requirement): &vector<u64> {
        &self.role_amount
    }
    
    public fun get_requirement_org(self: &Requirement): &vector<String> {
        &self.org
    }

    public fun get_requirement_org_amount(self: &Requirement): &vector<u64> {
        &self.org_amount
    }
    
    public fun get_vault_jobs(self: &JobVault): &vector<Job> {
        &self.jobs
    }

    public fun get_vault_mut_jobs(self: &mut JobVault): &mut vector<Job> {
        &mut self.jobs
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
    public(package) fun withdraw_fund(self: &mut Job, ctx: &mut TxContext){
        assert!(ctx.sender() == self.validator, 0);
        let mut reward = self.prize_pool.withdraw_all();
        self.state = State::Completed;
        let reward_amount = reward.value();
        range_do!(0, self.selected.length(), |i| {
            let amount = reward_amount / self.selected.length();
            let salary = reward.split(amount);
            transfer::public_transfer(salary.into_coin(ctx), *self.selected.borrow(i));
        });
        transfer::public_transfer(reward.into_coin(ctx), ctx.sender());
    }
}