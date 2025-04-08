# KMJ Payment Terminal

A modern web application for managing employee payments using Solana and Wise payment systems. This application allows businesses to process payments to employees through multiple payment methods, track payment history, and manage employee payment information.

## Features

- **Multiple Payment Methods**

  - Solana (SOL) payments
  - Wise international transfers
  - Support for multiple currencies

- **Employee Management**

  - Add and edit employee information
  - Store payment preferences and addresses
  - Track payment history per employee

- **Payment Processing**

  - Real-time USD to SOL conversion
  - Payment status tracking
  - Transaction history
  - Payment details modal

- **User Interface**
  - Modern, responsive design
  - Real-time payment status updates
  - Success notifications
  - Loading states and error handling

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Solana wallet (for Solana payments)
- Wise account (for Wise payments)
- Firebase account
- QuickNode account (for Solana RPC)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_WISE_API_KEY=your_wise_api_key
VITE_SOLANA_RPC_URL=your_quicknode_url
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/kmj-payment-terminal.git
cd kmj-payment-terminal
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Build for production:

```bash
npm run build
# or
yarn build
```

## Project Structure

```
kmj-payment-terminal/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts for state management
│   ├── firebase/          # Firebase service functions
│   ├── pages/             # Page components
│   ├── services/          # External service integrations
│   └── styles/            # CSS styles
├── public/                # Static assets
└── server.js             # Proxy server for Wise API
```

## Payment Methods

### Solana Payments

- Uses Solana Web3.js for blockchain interactions
- Real-time USD to SOL conversion
- Transaction tracking on Solana Explorer

### Wise Payments

- International transfer support
- Multiple currency support
- Payment status tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- [Wise API](https://wise.com/gb/developer)
- [Firebase](https://firebase.google.com/)
- [QuickNode](https://www.quicknode.com/)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Security

- Never commit your `.env` file or expose API keys
- Use environment variables for sensitive data
- Keep dependencies updated
- Follow security best practices for web applications

## Roadmap

- [ ] Add support for more payment methods
- [ ] Implement batch payments
- [ ] Add payment scheduling
- [ ] Enhance reporting features
- [ ] Add multi-language support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.
