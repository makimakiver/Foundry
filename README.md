# Decentralized Venture Ecosystem (Foundry)

This is a Web3 crowdfunding and project launch platform built on the Sui blockchain. The original design is available at https://www.figma.com/design/1moZXP34xFbTYNMENOD6IZ/Decentralized-Venture-Ecosystem.

## Features

- 🚀 **Project Launch**: Multi-step wizard for launching blockchain projects
- 💰 **Crowdfunding**: Support projects with tiered or custom backing
- 🔗 **SuiNS Integration**: Automatic `.sui` domain registration for projects
- 💼 **Job Marketplace**: Post and apply for project-related jobs
- 📊 **Analytics Dashboard**: Track project performance and funding
- 🌐 **Walrus Storage**: Decentralized metadata storage
- 🎨 **Modern UI**: Built with Radix UI and Tailwind CSS

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

This project includes automatic SuiNS (Sui Name Service) registration for launched projects. When a project is submitted, a `.sui` domain is automatically registered and transferred to the founder.

For detailed documentation on the SuiNS integration, see [SUINS_INTEGRATION.md](./SUINS_INTEGRATION.md).

### Key Features:
- Automatic name sanitization (lowercase, hyphenated)
- Price calculation based on name length
- NFT transfer to project founder
- Optional subname creation for team members
- Comprehensive error handling

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
- Check the [SUINS_INTEGRATION.md](./SUINS_INTEGRATION.md) for SuiNS-related issues
- Review console logs for detailed error messages
- Ensure environment variables are configured correctly
