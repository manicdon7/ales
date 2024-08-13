# Ales

Ales is a decentralized application (dApp) that allows users to publish and access articles on the blockchain. The platform supports both free and subscription-based content, and readers can support authors by sending cryptocurrency through a "Buy Me a Coffee" feature for free articles.

## Features

- **Blockchain-Powered Article Publishing**: Publish articles directly on the blockchain, ensuring immutability and transparency.
- **Free and Subscription-Based Content**: Authors can choose to publish articles for free or set a subscription price in ETH.
- **Reader Support**: Readers can show their support for authors by sending cryptocurrency tips via the "Buy Me a Coffee" button.
- **Secure and Decentralized**: Leveraging Ethereum smart contracts for secure transactions and content management.
- **Responsive Design**: Ales is designed to be responsive and accessible on various devices.

## Technology Stack

- **Frontend**: React, Tailwind CSS, React Router, React Quill (for rich text editing)
- **Smart Contracts**: Solidity (Ethereum)
- **Blockchain Interaction**: ethers.js
- **Storage**: IPFS via Infura or Pinata for decentralized content storage
- **Development Tools**: MetaMask, Hardhat, Remix IDE

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine
- MetaMask browser extension for connecting to Ethereum
- An Ethereum testnet or mainnet account with some ETH

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/yourusername/ales.git
   cd ales


2. **Install Dependencies**:

    ```bash
    npm install

3. **Environment Setup**:

    Create a .env file in the root directory and add your Infura and Pinata API keys:

    REACT_APP_INFURA_PROJECT_ID=your_infura_project_id
    REACT_APP_INFURA_PROJECT_SECRET=your_infura_project_secret
    REACT_APP_PINATA_API_KEY=your_pinata_api_key
    REACT_APP_PINATA_SECRET_API_KEY=your_pinata_secret_api_key

4. **Start the Development Server:**:

    ```bash
    npm start

The application should now be running on http://localhost:3000.

### Usage
Publishing an Article: Navigate to the "Publish" page, write your article using the editor, and choose whether it's free or subscription-based. Upon submission, the article will be stored on IPFS, and its reference will be recorded on the blockchain.

Viewing Articles: Browse through the available articles on the "Articles" page. Click on an article card to view its details. If it's a free article, you can support the author by sending a tip in ETH.

Buying a Subscription: For subscription-based articles, readers need to pay the specified amount in ETH to unlock the content.

## Smart Contract Interaction
The smart contracts are written in Solidity and deployed on the Ethereum network. You can find the ABI and contract address in the abi folder.

## Key Functions
publishArticle: Allows authors to publish articles with a title, content hash (IPFS), subscription price, and free flag.
buyArticle: Allows users to purchase access to subscription-based articles.
buyCoffee: Enables readers to send a tip in ETH to the author of a free article.
getArticle: Fetches the details of a specific article by its ID.
getArticleCount: Returns the total number of articles published on the platform.
Contributing
Contributions are welcome! Please fork the repository and submit a pull request with your changes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments
Thanks to the Ethereum and IPFS communities for providing the underlying technology.
Special thanks to all contributors and users of Ales.

```plaintext
This `README.md` provides an overview of the Ales dApp, explains how to set it up, and includes instructions for usage, contributing, and acknowledging the open-source community.

