# CertifiSol — Blockchain‑Backed Certificate Platform on Solana

[![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)](https://github.com/your-org/certifi-verify-link)  
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)  
[![Vite](https://img.shields.io/badge/bundler-Vite-646cff)](https://vitejs.dev)  
[![React](https://img.shields.io/badge/framework-React-61dafb)](https://reactjs.org)  
[![Solana](https://img.shields.io/badge/blockchain-Solana-00FFA3)](https://solana.com)  

CertifiSol is a modern web application for issuing, viewing and verifying digital certificates anchored on the Solana blockchain. It combines a sleek React/TypeScript frontend with Solana wallet integration, on‑chain metadata, and dynamic certificate image generation.

## Table of Contents

- [Features](#features)   
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Clone & Install](#clone--install)  
  - [Environment Variables](#environment-variables)  
  - [Run Locally](#run-locally)  
  - [Build & Preview](#build--preview)  
- [Folder Structure](#folder-structure)  
- [Environment Configuration](#environment-configuration)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  
- [Acknowledgements](#acknowledgements)  

---

## Features

- 🚀 **Issue Certificates**: Mint NFTs as tamper‑proof certificates on Solana.  
- 🔍 **Verify Certificates**: Check validity and metadata in real time.  
- 📄 **Certificate Details**: View on‑chain metadata, issuer, recipient and image.  
- 📸 **Dynamic Image Generation**: Render high‑resolution PNGs via `html2canvas`.  
- 🔑 **Wallet Integration**: Connect using any Solana wallet (Phantom, Solflare, etc.).  
- ⚡ **Optimistic Data Fetching**: Powered by TanStack Query for blazing fast UX.  
- 🎨 **Animations & Theming**: Framer Motion transitions and Tailwind CSS with dark mode.  

---

## Tech Stack

- **Language & Bundler**:  
  - Vite · TypeScript  
- **UI & Styling**:  
  - React · Tailwind CSS · shadcn‑UI (Radix UI primitives + CVA)  
- **Blockchain**:  
  - @solana/web3.js · @solana/wallet-adapter  
  - @coral-xyz/anchor · Metaplex UMI / Token Metadata  
- **Data Fetching**:  
  - @tanstack/react-query  
- **Animations**:  
  - Framer Motion  
- **Image Generation**:  
  - html2canvas · html-to-image  

---

## Getting Started

### Prerequisites

- Node.js ≥ 18.x (use [nvm](https://github.com/nvm-sh/nvm) to manage versions)  
- npm ≥ 8.x or yarn ≥ 1.x  

### Clone & Install
```
git clone https://github.com/your-org/certifi-verify-link.git
cd certifi-verify-link
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root, and the config file in `src/config.ts`

### 4. Run Locally

```
npm run dev
```

## 📁 Folder Structure

├── public/ # Static assets (SVGs, robots.txt, favicon)
├── src/
│ ├── assets/ # Images, icons
│ ├── components/ # Shared UI components & shadcn‑UI primitives
│ ├── hooks/ # Custom React hooks
│ ├── lib/ # Utilities & helpers
│ ├── pages/ # Route components (Index, Issue, Verify, Details, NotFound)
│ ├── styles/ # Global CSS (Tailwind)
│ ├── config.ts # Environment config (ignored in Git)
│ └── main.tsx # App entrypoint
├── .env.example # Example environment variables
├── tailwind.config.ts # Tailwind CSS config
├── postcss.config.js # PostCSS config
├── eslint.config.js # ESLint config
├── vite.config.ts # Vite config
├── package.json
└── README.md
