Foundry - Decentralized Crowdfunding Platform on Sui
Sui TypeScript React Vite

Foundry is a next-generation decentralized crowdfunding platform built on the Sui blockchain, enabling creators to launch innovative projects and backers to support them with transparent, secure, and efficient funding mechanisms.

🌟 Project Vision
Foundry revolutionizes crowdfunding by leveraging the power of blockchain technology to create a trustless, transparent, and efficient platform where:

Creators can launch projects with confidence, knowing their funding is secure
Backers can support projects they believe in with guaranteed refunds if goals aren't met
Communities can govern projects through decentralized voting mechanisms
Developers can find opportunities through integrated job postings
All participants benefit from the security and transparency of the Sui blockchain
✨ Key Features
🚀 Core Functionality
Project Creation: Launch crowdfunding campaigns with rich metadata
Secure Funding: Back projects with guaranteed refund protection
Goal-based Funding: Automatic fund distribution when goals are met
Deadline Management: Time-bound campaigns with automatic refunds
Transparent Transactions: All activities recorded on-chain
🏛️ Governance & Community
Decentralized Voting: Project owners can create polls for community decisions
Backer Participation: Only project backers can vote on governance proposals
Transparent Results: Real-time vote counting and result display
Community Feedback: Integrated feedback system for continuous improvement
💼 Professional Features
Job Postings: Project owners can post job opportunities
Rich Metadata: Detailed project information stored on Walrus decentralized storage
Social Integration: Social links and creator verification
Milestone Tracking: Project progress and milestone management
🔒 Security & Trust
Smart Contract Security: Audited Move smart contracts
Fund Protection: Automatic refunds if funding goals aren't met
Owner Verification: Creator verification system
Transparent Operations: All transactions visible on Sui blockchain
🏗️ Architecture
Smart Contracts (Move)
Project Management: Create, fund, and manage crowdfunding projects
Contribution Tracking: Secure contribution records with refund capabilities
Governance System: Decentralized voting and decision-making
Job Management: Post and manage project-related job opportunities
Feedback System: Community feedback and rating mechanisms
Frontend (React + TypeScript)
Modern UI: Clean, responsive interface built with React and TypeScript
Wallet Integration: Seamless Sui wallet connection via dApp Kit
Real-time Updates: Live data synchronization with blockchain
Mobile Responsive: Optimized for all device sizes
Progressive Web App: Fast, reliable user experience
Decentralized Storage (Walrus + Pinata IPFS)
Metadata Storage: Project descriptions and rich content on Walrus
Image Storage: Project images stored on IPFS via Pinata
Permanent Storage: Decentralized, censorship-resistant file storage
Fast Access: Optimized gateway for quick image loading
Content Addressing: Immutable content identifiers (CIDs)
Distributed Network: Resilient, censorship-resistant storage
Cost Effective: Efficient storage solution for large content
🚀 Quick Start
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher) - Download
Sui CLI (v1.58 or higher) - Installation Guide
Git - Download
Installation
Clone the repository

git clone https://github.com/y4hyya/Foundary.git
cd Foundary
Install dependencies

# Install smart contract dependencies
cd foundry
sui move build

# Install frontend dependencies
cd ../frontend
npm install
Configure environment

# Create local environment file
touch .env.local

# Add required environment variables (see ENV_VARIABLES.md for details)
# Required variables:
# - VITE_PACKAGE_ID
# - VITE_REGISTRY_ID
# - VITE_FOUNDRY_ID
# - VITE_PUBLISHER
# - VITE_PINATA_JWT (for IPFS image storage)
# - VITE_PINATA_GATEWAY (for IPFS image storage)

# See PINATA_SETUP.md for Pinata configuration instructions
Deploy smart contracts

# Switch to testnet
sui client switch --env testnet

# Deploy contracts
sui move build
sui client publish --gas-budget 100000000

# Save the package ID from the output
echo "PACKAGE_ID=0x..." >> .env
Start the frontend

npm run dev
Open your browser Navigate to http://localhost:5173

📋 Detailed Setup Guide
Smart Contract Setup
Initialize Sui CLI

sui client new-address ed25519
sui client switch --env testnet
Get testnet SUI

Visit Sui Testnet Faucet
Request testnet SUI for your address
Deploy the contract

cd foundry
sui move build
sui client publish --gas-budget 100000000
Update environment variables

# In your .env file
PACKAGE_ID=0x[YOUR_PACKAGE_ID]
VITE_PACKAGE_ID=0x[YOUR_PACKAGE_ID]
Frontend Setup
Install dependencies

cd frontend
npm install
Configure environment

# Create .env file
touch .env

# Add your configuration
echo "VITE_PACKAGE_ID=0x[YOUR_PACKAGE_ID]" >> .env
echo "VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space" >> .env
echo "VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space" >> .env
Start development server

npm run dev
