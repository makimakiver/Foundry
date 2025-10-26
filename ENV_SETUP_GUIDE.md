# Environment Variables Setup Guide

## 🐛 Error: "Invalid string value: undefined"

If you're getting this error when clicking "Submit Project", it means your environment variables are not configured.

## ✅ Solution

### Step 1: Create `.env` File

Create a file named `.env` in the project root directory:

```bash
# From the project root
touch .env
```

### Step 2: Add Environment Variables

Open the `.env` file and add these variables:

```env
# Sui Smart Contract Configuration

# Your Sui package ID (the deployed smart contract package)
VITE_PACKAGE_ID=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef

# Your registry object ID
VITE_REGISTRY_ID=0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890

# Your foundry parent NFT object ID (optional, for subname creation)
VITE_FOUNDRY_ID=0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321
```

**⚠️ Important**: Replace the placeholder values with your actual Sui object IDs from your deployed smart contracts.

### Step 3: Restart Dev Server

Environment variables are only loaded when the server starts, so you must restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## 📋 How to Get Your Object IDs

### If You Have Deployed Contracts:

1. Check your deployment output for the package ID
2. Look for the registry object ID in your transaction results
3. Note the foundry NFT object ID if you have one

### If You Don't Have Contracts Yet:

You can use placeholder values for development, but blockchain features won't work:

```env
VITE_PACKAGE_ID=0x0000000000000000000000000000000000000000000000000000000000000000
VITE_REGISTRY_ID=0x0000000000000000000000000000000000000000000000000000000000000000
VITE_FOUNDRY_ID=0x0000000000000000000000000000000000000000000000000000000000000000
```

## 🔍 Verification

After setting up your `.env` file and restarting the server:

1. Open browser console (F12)
2. Try to submit a project
3. You should see proper error messages instead of "undefined" errors
4. Check console logs for environment variable values

## 🚨 Common Issues

### Issue: Still getting "undefined" error

**Solution**: Make sure you:
- Named the file exactly `.env` (not `.env.txt` or `env`)
- Placed it in the project root (same directory as `package.json`)
- Restarted the dev server after creating the file
- Used `VITE_` prefix for all variables

### Issue: Variables not loading

**Solution**: 
- Check file location: `/Users/yahya/Desktop/Foundry/.env`
- Verify no typos in variable names
- Ensure no extra spaces around `=` signs
- Restart dev server completely

### Issue: "Failed to create blob object"

**Solution**: This means the Walrus upload succeeded but the blob wasn't found. Check:
- Network connection
- Sui testnet status
- Transaction confirmation

## 📝 Example `.env` File

```env
# Real example (with fake IDs - replace with yours)
VITE_PACKAGE_ID=0x8d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9e
VITE_REGISTRY_ID=0x7d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9f
VITE_FOUNDRY_ID=0x6d97f1cd6ac663735be08d1d2b6d02a159e711586461306ce60a2b7a6a565a9g
```

## ✅ What Was Fixed

The code now includes proper validation:

1. **Environment Variable Check**: Validates `VITE_PACKAGE_ID` and `VITE_REGISTRY_ID` before submission
2. **Blob Object Validation**: Ensures blob was created successfully
3. **Image Fallback**: Uses empty string if no image is provided
4. **Clear Error Messages**: Shows helpful error messages instead of cryptic "undefined" errors

## 🎯 Next Steps

1. Create your `.env` file
2. Add your Sui object IDs
3. Restart the dev server
4. Try submitting a project again

If you still have issues, check the browser console for detailed error messages.

