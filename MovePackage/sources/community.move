module vendor3::community {
    // either community should own the sui_name or the subname of the community should be owned
    // proposal logic should come here 
    // claude will generate the test code 
    // --- Imports
    use sui::balance::{Balance};
    use sui::coin::{Coin};
    use sui::sui::{SUI};
    use walrus::blob::{Blob};
    use vendor3::contribution::{Self, Test};
    use vendor3::ideation::{Project, Registry};
    use std::string::{String};
    use std::vector::borrow;
    use std::macros::range_do;
    // --- Struct
    public struct Proposal has key, store {
        id: UID,
        content: Blob,
        tests: vector<Test>,
    }

    public struct Proposals has key, store {
        id: UID,
        proposals: vector<Proposal>
    }
    public struct AdminCap has key, store {
        id: UID,
        project_id: ID
    }

    public(package) fun mint_proposal(content: Blob, tests: vector<Test>, ctx: &mut TxContext): Proposal {
        let proposal = Proposal {
            id: object::new(ctx),
            content,
            tests
        };
        proposal
    }

    public(package) fun mint_proposals(proposal: Proposal, ctx: &mut TxContext): Proposals {
        let proposals = Proposals {
            id: object::new(ctx),
            proposals: vector::singleton(proposal)
        };
        proposals
    }

    public(package) fun add_proposal(self: &mut Proposals, proposal: Proposal) {
        self.proposals.push_back(proposal);
    }
    // ---entry functions
    entry fun submit_proposal(
        distribution: vector<u64>, 
        content: Blob,
        fund: &mut Coin<SUI>, 
        test_names: vector<String>, 
        proposals: &mut Proposals,
        ctx: &mut TxContext
    ) {
        let mut tests = vector::empty<Test>();
        range_do!(0, distribution.length(), |i| {
            let x = vector::borrow(&distribution, i);
            assert!(fund.value() > *x, 0);
            let coin = fund.split(*x, ctx);
            let vault = contribution::create_proposal_vault(*vector::borrow(&test_names, i), coin.into_balance(), ctx);
            tests.push_back(vault);
        });
        let proposal = mint_proposal(content, tests, ctx);
        proposals.proposals.push_back(proposal);
    }

    
}