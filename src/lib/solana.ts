// src/lib/solana.ts
import { Connection, PublicKey} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from '../idl/solana_nft_anchor_hackernoon.json';
import axios from "axios";
import { PINATA_CONFIG, SOLANA_CONFIG, ALLOWED_ISSUER_ADDRESSES } from "@/config";
import {
  mplTokenMetadata,
  deserializeMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { decryptPayload, EncryptedPayload } from "@/lib/encryption";
import {
  publicKey as toUmiPublicKey,
  lamports as toSolAmount,
} from "@metaplex-foundation/umi";


export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuedTo: string;
  date: string;
  verified?: boolean;
  content: string;
  metadata: {
    issuerAddress: string;
    recipientAddress: string;
    tokenId?: string;
    mintAddress?: string;
    imageUrl?: string;
  }
}

function isEncrypted(m: any): m is EncryptedPayload {
  return (
    m != null &&
    typeof m === "object" &&
    typeof m.iv === "string" &&
    typeof m.ciphertext === "string"
  );
}

// Verify a certificate by its mint address
export const verifyCertificate = async (mintAddress: string): Promise<boolean> => {
  try {
    // Connect to Solana
    const connection = new Connection(
      SOLANA_CONFIG.RPC_URL || "https://api.devnet.solana.com"
    );
    
    // Convert the mint address string to a PublicKey
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get the token metadata account
    const metadataPDA = await getMetadataAccount(mintPublicKey);
    
    // Fetch the account info
    const accountInfo = await connection.getAccountInfo(metadataPDA);

    if (!accountInfo) {
      console.warn(`No metadata account found for mint ${mintAddress}`);
      return false;
    }

    const rpcAccount = {
      data: accountInfo.data,
      executable: accountInfo.executable,
      lamports: toSolAmount(accountInfo.lamports),
      owner: toUmiPublicKey(accountInfo.owner.toBase58()),
      publicKey: toUmiPublicKey(metadataPDA.toBase58()),
      rentEpoch: BigInt((accountInfo as any).rentEpoch || 0),
    };

    // 4) decode the metadata
    const meta = deserializeMetadata(rpcAccount);

    // 5) check that updateAuthority is in your allow‑list
    if (!ALLOWED_ISSUER_ADDRESSES.includes(meta.updateAuthority)) {
      console.warn(
        `Untrusted issuer ${meta.updateAuthority} for certificate ${mintAddress}`
      );
      return false;
    }

    return true;
    // If account info exists, the certificate is valid
    // return accountInfo !== null;
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return false;
  }
};

// Get all certificates for a wallet address
export const getCertificatesForAddress = async (
  walletAddress: string
): Promise<Certificate[]> => {
  const certificates: Certificate[] = []

  try {
    // 1) Connect to Solana
    const connection = new Connection(
      SOLANA_CONFIG.RPC_URL || "https://api.devnet.solana.com"
    )
    const walletPub = new PublicKey(walletAddress)

    // 2) Fetch all token accounts for this owner
    const parsed = await connection.getParsedTokenAccountsByOwner(walletPub, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    })

    // 3) Filter down to NFTs (1 token, 0 decimals)
    const nftAccounts = parsed.value.filter(acc => {
      const info = acc.account.data.parsed.info.tokenAmount
      return info.uiAmount === 1 && info.decimals === 0
    })

    // 4) For each NFT mint, pull the on‑chain metadata, then fetch and parse the JSON
    for (const { account } of nftAccounts) {
      const mintAddress = account.data.parsed.info.mint as string

      try {
        // 4a) Derive the metadata PDA and extract the URI field
        const metadataPDA = await getMetadataAccount(new PublicKey(mintAddress))
        const metadataUri = await extractMetadataUri(connection, metadataPDA)
        if (!metadataUri) continue

        // 4b) Ensure we have an HTTP‐accessible URL
        const httpUri = metadataUri.startsWith("ipfs://")
          ? metadataUri.replace(
              "ipfs://",
              "https://teal-dry-albatross-975.mypinata.cloud/ipfs/"
            )
          : metadataUri

        // 4c) Download the JSON package (either plain or encrypted)
        const response = await axios.get<EncryptedPayload | any>(httpUri)
        let metadata = response.data

        // 4d) If it looks encrypted, decrypt it
        if (isEncrypted(metadata)) {
          metadata = decryptPayload<{
            name: string
            symbol: string
            description: string
            attributes: { trait_type: string; value: string }[]
            imageDataUrl: string
          }>(metadata as EncryptedPayload)

          // normalize the field name so downstream logic is unchanged
          metadata.image = metadata.imageDataUrl
        }

        // 4e) Validate it’s one of our certificates
        if (
          !Array.isArray(metadata.attributes) ||
          !metadata.attributes.some((a) => a.trait_type === "Date Issued")
        ) {
          continue;
        }

        // 4f) Pull out recipient + date
        const recipient = metadata.attributes.find(
          (a) => a.trait_type === "Recipient Name"
        )?.value;
        const dateIssued = metadata.attributes.find(
          (a) => a.trait_type === "Date Issued"
        )?.value;

        // 4g) Build our Certificate shape
        certificates.push({
          id: mintAddress,
          title: metadata.name,
          issuer: "CertifiSol",
          issuedTo: recipient,
          date: dateIssued,
          content: metadata.description || "",
          verified: true,
          metadata: {
            issuerAddress: SOLANA_CONFIG.PROGRAM_ID,
            recipientAddress: walletAddress,
            mintAddress: mintAddress,
            imageUrl: metadata.image
          }
        })
      } catch (innerErr) {
        console.warn(`Skipping NFT ${mintAddress}:`, innerErr)
      }
    }
  } catch (err) {
    console.error("Error fetching certificates:", err)
  }

  return certificates
}
// Helper function to get the metadata account for a mint
const getMetadataAccount = async (mintPublicKey: PublicKey): Promise<PublicKey> => {
  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s").toBuffer(),
      mintPublicKey.toBuffer(),
    ],
    new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
  );
  
  return metadataPDA;
};

// Helper function to extract metadata URI from account data
export const extractMetadataUri = async (
  connection: Connection,
  metadataPDA: PublicKey
): Promise<string | null> => {
  const info = await connection.getAccountInfo(metadataPDA);
  if (!info) return null;

  // build the exact RpcAccount shape mpl-token-metadata expects
  const rpcAccount = {
    data: info.data,                                  // Uint8Array
    executable: info.executable,                      // boolean
    lamports: toSolAmount(info.lamports),             // SolAmount
    owner: toUmiPublicKey(info.owner.toBase58()),     // Umi PublicKey
    publicKey: toUmiPublicKey(metadataPDA.toBase58()),// Umi PublicKey
    rentEpoch: BigInt((info as any).rentEpoch || 0),  // bigint
  };

  const metadata = deserializeMetadata(rpcAccount);
  return metadata.uri.replace(/\0/g, "").trim();
};
