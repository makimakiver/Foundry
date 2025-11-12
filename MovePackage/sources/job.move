module vendor3::view_job {

    use std::string::String;
    use std::macros::range_do;
    use sui::balance::{Self, Balance};
    use sui::clock::{Self, Clock};
    use sui::coin::{Coin};
    use sui::table::{Self, Table};
    use vendor3::contribution::{Self, Application};
    use vendor3::suins_util;
    use vendor3::ideation::{Self, Registry, AccountNSRegistry, Project, State, Job};
    use usdc::usdc::{USDC};
    use walrus::blob::{Blob};
    use suins::subdomain_registration::SubDomainRegistration;
    
    // --- Entry function
    entry fun seal_approve(id: vector<u8>, aggregator: &Registry, project: &Project, job_id: ID, ns_registry: &AccountNSRegistry, ctx: &TxContext){
        let vault = aggregator.get_registry_project_table().borrow(project.get_project_id());
        let job_idx = ideation::find_job_index(job_id, vault);
        let job = vault.get_vault_jobs().borrow(job_idx);
        if (ns_registry.get_nsregistry_registry().contains(ctx.sender())){
            let domain_holdings = ns_registry.get_nsregistry_registry().borrow(ctx.sender());
            let role = suins_util::decompose_role_vector(domain_holdings);
            let requirement_role = job.get_requirement_job().get_requirement_role();
            let requirement_role_num = job.get_requirement_job().get_requirement_role_amount();
            // let mut count = 0;
            assert!(requirement_role.length() == requirement_role_num.length(), 0);
            range_do!(0, requirement_role.length(), |i| {
                let label = requirement_role.borrow(i);
                let required_role_amount = requirement_role_num.borrow(i);
                let role_holding = vector::count!(&role, |holding: &String| holding == label);
                assert!(role_holding >= *required_role_amount, 1)
            });
            let org = suins_util::decompose_org_vector(domain_holdings);
            let requirement_org = job.get_requirement_job().get_requirement_org();
            let requirement_org_num = job.get_requirement_job().get_requirement_org_amount();
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
            let requirement_role = job.get_requirement_job().get_requirement_role();
            assert!(requirement_role.length() == 0, 4);
            let requirement_org = job.get_requirement_job().get_requirement_org();
            assert!(requirement_org.length() == 0, 5);
        }
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
        let requirement = ideation::mint_requirement(role, role_amount, org, org_amount, ctx);
        let job = requirement.mint_job(details, validator, category, coin, max_people, ctx);
        self.get_registry_mut_project_table().borrow_mut(project.get_project_id()).get_vault_mut_jobs().push_back(job);
    }

    // submitting the application to job request
    entry fun submit_application(aggregator: &mut Registry, project: &Project, job_id: ID, details: Blob, clock: &Clock, ctx: &mut TxContext){
        let vault = aggregator.get_registry_mut_project_table().borrow_mut(project.get_project_id());
        let job_idx = ideation::find_job_index(job_id, vault);
        let job = vault.get_vault_mut_jobs().borrow_mut(job_idx);
        assert!(!job.get_job_applications().contains(ctx.sender()), 0);
        assert!(!job.get_job_applicants().contains(&ctx.sender()), 1);
        let application = contribution::mint_application(details, clock, ctx);
        job.get_job_mut_applications().add(ctx.sender(), application);
        job.get_job_mut_applicants().push_back(ctx.sender());
    }

    #[allow(lint(self_transfer))]
    public fun complete_job(aggregator: &mut Registry, project: &Project, job_id: ID, ctx: &mut TxContext) {
        let vault = aggregator.get_registry_mut_project_table().borrow_mut(project.get_project_id());
        let job_idx = ideation::find_job_index(job_id, vault);
        let job = vault.get_vault_mut_jobs().borrow_mut(job_idx);
        job.withdraw_fund(ctx);
    }

}