module vendor3::start_project {

    use vendor3::ideation::{Self, Project, ProjectCap};

    public struct CreationCap has key, store{
        id: UID,
        project_id: ID
    }

    public struct OffChainCap has key {
        id: UID
    }

    fun init(ctx: &mut TxContext) {
        let offchain_cap = OffChainCap {
            id: object::new(ctx)
        };
        let id = object::new(ctx);
        let project_id = id.to_inner();
        let creation_cap = CreationCap {
            id,
            project_id
        };
        transfer::transfer(offchain_cap, @offchain_acc);
        transfer::share_object(creation_cap);
    }

    public fun mint_creation_cap(_: &OffChainCap, project: &Project, target: address, ctx: &mut TxContext) {
        let cap = CreationCap {
            id: object::new(ctx),
            project_id: project.get_project_id()
        };
        transfer::public_transfer(cap, target);
    }

    public fun finish_creation_cap(cap: CreationCap){
        let CreationCap { id, project_id } = cap;
        id.delete();
    }

    entry fun seal_approve(id: vector<u8>, cap: &CreationCap, project: &Project) {
        assert!(cap.project_id == project.get_project_id(), 0);
    }
}