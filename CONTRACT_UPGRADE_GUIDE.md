# Smart Contract Upgrade Guide

## Issue Encountered

**Error:** `Incorrect number of arguments for suggest_idea`

**Root Cause:** The deployed smart contract on Sui testnet is the **old version** without the `suins_name` parameter, but the Move source code was updated to include it. This created a mismatch between the on-chain contract and the frontend expectations.

## Why This Happened

1. **Source Code Updated**: The `ideation.move` file was modified to include `suins_name` parameter
2. **Contract Not Redeployed**: The contract at the package address in `VITE_PACKAGE_ID` is still the old version
3. **Frontend Called New Signature**: The frontend tried to call with 6 arguments (including `suins_name`) but the deployed contract only accepts 5

### Old Contract (Currently Deployed)
```move
public fun suggest_idea(
    registry: &mut Registry,
    name: String,
    blob_id: ID,
    image: String,
    coin: Coin<SUI>,
    ctx: &mut TxContext
)
```

### New Contract (In Source Code)
```move
public fun suggest_idea(
    registry: &mut Registry,
    name: String,
    suins_name: String,        // ← NEW PARAMETER
    blob_id: ID,
    image: String,
    coin: Coin<SUI>,
    ctx: &mut TxContext
)
```

## Current Workaround (Implemented)

The frontend has been updated to work with the old contract:
- Removed `suins_name` from the transaction arguments
- Added TODO comments marking where to restore it after upgrade
- ProjectsContext generates SuiNS names client-side as fallback

## Option 1: Deploy Updated Contract (Recommended)

### Steps to Deploy New Contract with suins_name

1. **Navigate to the Move project directory:**
```bash
cd Foundry
```

2. **Build the Move package:**
```bash
sui move build
```

3. **Publish the updated contract to testnet:**
```bash
sui client publish --gas-budget 100000000
```

4. **Note the new Package ID** from the output:
```
----- Transaction Effects ----
Status : Success
Created Objects:
  - ID: 0xNEW_PACKAGE_ID , Owner: Immutable
```

5. **Update your `.env` file with the new Package ID:**
```env
VITE_PACKAGE_ID=0xNEW_PACKAGE_ID
```

6. **Get the new Registry Object ID** from the transaction output and update:
```env
VITE_REGISTRY_ID=0xNEW_REGISTRY_ID
```

7. **Update the frontend to use the new contract:**

In `src/components/LaunchProjectPage.tsx`, uncomment the suins_name parameter:

```typescript
tx.moveCall({
  target: `${vendor}::ideation::suggest_idea`,
  arguments: [
    tx.object(registry),
    tx.pure.string(data.name),
    tx.pure.string(suinsName), // ✅ Uncomment this line
    tx.object(blob_objectId),
    tx.pure.string(data.image),
    coin
  ]
});
```

8. **Test the deployment:**
- Connect your wallet
- Try launching a test project
- Verify it completes successfully
- Check that the project appears with the correct SuiNS name

## Option 2: Continue with Old Contract

If you prefer to keep using the old contract without `suins_name`:

### Remove suins_name from Move Contract

1. **Edit `Foundry/sources/ideation.move`:**

Remove the `suins_name` parameter:

```move
public fun suggest_idea(
    registry: &mut Registry,
    name: String,
    // Remove: suins_name: String,
    blob_id: ID,
    image: String,
    coin: Coin<SUI>,
    ctx: &mut TxContext
) {
    // Remove validation:
    // assert!(...check suins_name..., EInvalidSuiNSName);
    
    let idea = Idea {
        id: object::new(ctx),
        name,
        // Remove: suins_name,
        blob_id,
        image,
        funding_goal: funding_amount,
        current_funding: 0,
        creator,
        timestamp,
    };
    
    event::emit(IdeaSuggested {
        idea_id,
        name: idea.name,
        // Remove: suins_name: idea.suins_name,
        creator,
        funding_goal: funding_amount,
        timestamp,
    });
}
```

2. **Update the Idea struct:**
```move
public struct Idea has key, store {
    id: UID,
    name: String,
    // Remove: suins_name: String,
    blob_id: ID,
    image: String,
    funding_goal: u64,
    current_funding: u64,
    creator: address,
    timestamp: u64,
}
```

**Note:** This approach loses the benefit of storing SuiNS names on-chain. The frontend will generate them client-side, but they won't be permanently associated with projects.

## Recommended Approach

**Deploy the updated contract** (Option 1) because:

1. ✅ **On-chain SuiNS Identity**: Projects have permanent blockchain identity
2. ✅ **Data Consistency**: Frontend and blockchain data match
3. ✅ **Future-Proof**: Supports advanced features like subnames
4. ✅ **Better UX**: Users see consistent SuiNS names everywhere
5. ✅ **Validation**: Smart contract validates SuiNS name format

## Testing Checklist After Upgrade

- [ ] Build succeeds without errors
- [ ] Publish transaction completes successfully
- [ ] New Package ID noted and saved
- [ ] `.env` file updated with new Package ID and Registry ID
- [ ] Frontend uncommented to pass `suins_name`
- [ ] Test project submission works
- [ ] Verify project appears with correct SuiNS name
- [ ] Check ProjectsContext fetches data correctly
- [ ] Confirm no console errors

## Troubleshooting

### Build Fails
- Check syntax in `ideation.move`
- Verify all `suins_name` references are consistent
- Run `sui move test` to check for logic errors

### Publish Fails
- Ensure you have enough SUI for gas
- Check network connection to testnet
- Verify wallet has permissions

### Frontend Still Shows Error
- Clear browser cache
- Restart dev server: `npm run dev`
- Check `.env` file has correct values
- Verify uncommented the right line in LaunchProjectPage.tsx

### Projects Don't Show SuiNS Names
- Check that contract stores `suins_name` field
- Verify ProjectsContext accesses correct field
- Look for console errors during fetch

## Summary

The error occurred because of a version mismatch between:
- **Source code**: Updated to include `suins_name`
- **Deployed contract**: Still running old version without it

**Current Status**: Frontend patched to work with old contract
**Recommended Action**: Deploy updated contract and uncomment frontend code
**Time Required**: ~10 minutes for deployment + testing

This is a common issue in blockchain development where contract upgrades require redeployment and coordination between on-chain and off-chain components.

