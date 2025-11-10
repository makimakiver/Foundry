module vendor3::job {
    use sui::balance::{Self, Balance};
    use usdc::usdc::{USDC};
    use sui::table::{Self, Table};
    use vendor3::contribution::{Self, Application};
    use std::string::String;
    
    // ---Enum
    public enum State has copy, drop, store {
        Hiring,
        InProgress,
        Completed
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

    fun mint_job_vault(
        ctx: &mut TxContext
    ): JobVault {
        let jobs = JobVault {
            id: object::new(ctx),
            jobs: vector::empty<Job>()
        };
        jobs
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

    fun find_job_index(id: ID, vault: &JobVault): u64 {
        let len = vault.jobs.length();
        let mut i = 0;
        while (i < len) {
            if (vault.jobs.borrow(i).id.to_inner() == id) return i;
            i = i + 1;
        };
        abort 0
    }

}