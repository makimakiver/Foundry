# Decentralized Venture Ecosystem (Foundry)

This is a Web3 crowdfunding and project launch platform built on the Sui blockchain. The original design is available at https://www.figma.com/design/1moZXP34xFbTYNMENOD6IZ/Decentralized-Venture-Ecosystem.

## Features

- 🚀 **Project Launch**: Multi-step wizard for launching blockchain projects
- 💰 **Crowdfunding**: Support projects with tiered or custom backing
- 🔗 **SuiNS Integration**: **Mandatory** `.sui` domain registration for all projects
- 💼 **Job Marketplace**: Post and apply for project-related jobs
- 📊 **Analytics Dashboard**: Track project performance and funding
- 🌐 **Walrus Storage**: Decentralized metadata storage
- 🎨 **Modern UI**: Built with Radix UI and Tailwind CSS

> **⚠️ Important**: SuiNS registration is now **mandatory** for project submission. If SuiNS registration fails, the entire project submission will be cancelled to prevent data inconsistency. See [MANDATORY_SUINS_FLOW_CONTROL.md](./MANDATORY_SUINS_FLOW_CONTROL.md) for details.

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Blockchain**: Sui (testnet), SuiNS, Walrus
- **UI Components**: Radix UI, Tailwind CSS, Motion
- **State Management**: React Context API
- **Forms**: React Hook Form

## Running the Code

### Prerequisites

- Node.js 18+ and npm
- A Sui wallet (for testnet)
- Sufficient SUI tokens for gas and transactions

### Installation

```bash
# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```env
VITE_PACKAGE_ID=<your-sui-package-id>
VITE_REGISTRY_ID=<your-registry-id>
VITE_FOUNDRY_ID=<your-foundry-id>
```

### Development

```bash
# Start the development server
npm run dev
```

The application will open at `http://localhost:3000`.

### Build

```bash
# Build for production
npm run build
```

## SuiNS Integration

This project includes automatic SuiNS (Sui Name Service) registration for launched projects. When a project is submitted, a `.sui` domain is automatically registered and transferred to the founder, along with subnames for all team members.

For detailed documentation on the SuiNS integration, see [SUINS_INTEGRATION.md](./SUINS_INTEGRATION.md).

### Key Features:
- **Primary Domain**: Automatic `.sui` domain registration for projects
- **Team Subnames**: Automatic subname registration for team members (e.g., `foundry.co-founder`)
- **Name Sanitization**: Automatic lowercase and hyphenation
- **Price Calculation**: Dynamic pricing based on name length
- **NFT Transfer**: Automatic transfer to project founder
- **Error Handling**: Comprehensive non-blocking error handling
- **Batch Processing**: Efficient team member registration with rate limiting
- **Input Validation**: Multi-layered validation to prevent TypeError issues

### Important Documentation:
- 🚨 [MANDATORY_SUINS_FLOW_CONTROL.md](./MANDATORY_SUINS_FLOW_CONTROL.md) - **CRITICAL: Mandatory SuiNS registration flow control**
- 📘 [SUINS_VALIDATION_ENHANCEMENT.md](./SUINS_VALIDATION_ENHANCEMENT.md) - **Preventing "TypeError: Invalid string value: undefined"**
- 📋 [VALIDATION_QUICK_REFERENCE.md](./VALIDATION_QUICK_REFERENCE.md) - Quick troubleshooting guide
- 📚 [SUINS_INTEGRATION.md](./SUINS_INTEGRATION.md) - Complete integration details
- 🔧 [TEAM_SUBNAMES_DOCUMENTATION.md](./TEAM_SUBNAMES_DOCUMENTATION.md) - Team subnames feature

### Team Subnames
Each team member automatically gets a subname in the format `{projectName}.{memberRole}`:
- Co-founder → `foundry.co-founder`
- Developer → `foundry.developer`
- Designer → `foundry.designer`

See [TEAM_SUBNAMES_DOCUMENTATION.md](./TEAM_SUBNAMES_DOCUMENTATION.md) for details.

## Project Structure

```
Foundry/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components (Radix)
│   │   └── *.tsx         # Feature components
│   ├── contexts/         # React Context providers
│   ├── lib/              # Utility functions
│   │   ├── suins-utils.ts        # SuiNS integration utilities
│   │   └── theme-colors.ts       # Theme configuration
│   ├── styles/           # Global styles
│   ├── App.tsx           # Main application component
│   └── main.tsx          # Application entry point
├── SUINS_INTEGRATION.md  # SuiNS integration documentation
└── package.json
```

## Key Components

- **LaunchProjectPage**: 4-step wizard for project creation
- **ProjectsPage**: Browse and filter projects
- **ProjectDetailsPage**: View project details and back projects
- **StatsPage**: Analytics and statistics dashboard
- **WalletContext**: Wallet connection management
- **ThemeContext**: Light/dark theme management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

[Add your license here]

## Support

For issues or questions:

### Common Errors

**"TypeError: Invalid string value: undefined"**
- See [VALIDATION_QUICK_REFERENCE.md](./VALIDATION_QUICK_REFERENCE.md) for immediate troubleshooting
- Check [SUINS_VALIDATION_ENHANCEMENT.md](./SUINS_VALIDATION_ENHANCEMENT.md) for detailed explanation
- Ensure wallet is connected before submitting project
- Verify project name is not empty

### General Troubleshooting
- Check the [SUINS_INTEGRATION.md](./SUINS_INTEGRATION.md) for SuiNS-related issues
- Review browser console logs for detailed error messages
- Ensure environment variables are configured correctly (see [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md))
- Verify wallet connection status
