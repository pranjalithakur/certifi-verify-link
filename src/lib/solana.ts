// src/lib/solana.ts
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from '../idl/solana_nft_anchor_hackernoon.json';
import axios from "axios";
import { PINATA_CONFIG, SOLANA_CONFIG } from "@/config";
import { 
  mplTokenMetadata, 
  MPL_TOKEN_METADATA_PROGRAM_ID
} from '@metaplex-foundation/mpl-token-metadata';

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
    
    // If account info exists, the certificate is valid
    return accountInfo !== null;
  } catch (error) {
    console.error("Error verifying certificate:", error);
    return false;
  }
};

// Get all certificates for a wallet address
export const getCertificatesForAddress = async (walletAddress: string): Promise<Certificate[]> => {
  try {
    console.log(`Searching for certificates for wallet: ${walletAddress}`);

    // Connect to Solana
    const connection = new Connection(
      SOLANA_CONFIG.RPC_URL || "https://api.devnet.solana.com"
    );
    
    // Convert the wallet address string to a PublicKey
    const walletPublicKey = new PublicKey(walletAddress);
    
    // Get all token accounts owned by this wallet
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPublicKey,
      { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
    );

    console.log(`Found ${tokenAccounts.value.length} token accounts`);
    
    // Filter for NFTs (amount = 1)
    const nftAccounts = tokenAccounts.value.filter(
      account => {
        const amount = account.account.data.parsed.info.tokenAmount;
        return amount.uiAmount === 1 && amount.decimals === 0;
      }
    );

    console.log(`Found ${nftAccounts.length} NFT accounts`);
    
    // For each NFT, get the metadata
    const certificates: Certificate[] = [];
    
    for (const nftAccount of nftAccounts) {
      const mintAddress = nftAccount.account.data.parsed.info.mint;
      console.log(`Processing NFT with mint: ${mintAddress}`);
      
      try {
        // Get the metadata account
        const metadataPDA = await getMetadataAccount(new PublicKey(mintAddress));
        
        // Get the metadata URI
        const metadataAccount = await connection.getAccountInfo(metadataPDA);
        
        if (metadataAccount) {
          // Parse the metadata (this is a simplified version)
          // In a real implementation, you'd need to properly decode the account data
          // using the Metaplex SDK
          
          // For now, we'll fetch the metadata from the URI
          // This assumes our program stores the URI in a way we can extract
          const metadataUri = await extractMetadataUri(connection, metadataPDA);
          console.log(`Metadata URI: ${metadataUri}`);
          
          if (metadataUri) {
            // Convert IPFS URI to HTTP URL if needed
            const httpUri = metadataUri.startsWith('ipfs://')
            ? metadataUri.replace('ipfs://', 'https://teal-dry-albatross-975.mypinata.cloud/ipfs/')
            : metadataUri;
            // Fetch the metadata from IPFS or wherever it's stored
            const response = await axios.get(httpUri);
            const metadata = response.data;
            console.log(`Metadata:`, metadata);
            
            // Check if this is one of our certificates by looking for specific attributes
            const isCertificate = metadata.attributes && 
              metadata.attributes.some(attr => attr.trait_type === "Date Issued");
            
            if (isCertificate) {
              // Create a certificate object
              const recipientName = metadata.attributes.find(
                attr => attr.trait_type === "Recipient Name"
              )?.value || "Unknown";
              
              const dateIssued = metadata.attributes.find(
                attr => attr.trait_type === "Date Issued"
              )?.value || new Date().toLocaleDateString();
              
              certificates.push({
                id: mintAddress,
                title: metadata.name,
                issuer: "CertifiSol",
                issuedTo: recipientName,
                date: dateIssued,
                content: metadata.description || "",
                verified: true,
                metadata: {
                  issuerAddress: SOLANA_CONFIG.PROGRAM_ID,
                  recipientAddress: walletAddress,
                  mintAddress: mintAddress,
                  imageUrl: metadata.image
                }
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing NFT ${mintAddress}:`, error);
      }
    }
    
    return certificates;
  } catch (error) {
    console.error("Error getting certificates:", error);
    return [];
  }
};

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
// const extractMetadataUri = async (
//   connection: Connection,
//   metadataPDA: PublicKey
// ): Promise<string | null> => {
//   try {
//     // Fetch the metadata account data
//     const accountInfo = await connection.getAccountInfo(metadataPDA);
    
//     if (!accountInfo) {
//       console.error("Metadata account not found");
//       return null;
//     }
    
//     // Decode the metadata using Metaplex's Metadata class
//     const metadataData = mplTokenMetadata.deserializeMetadata(accountInfo.data)[0];
    
//     // Return the URI from the decoded metadata
//     return metadataData.data.uri.replace(/\0/g, ''); // Remove null terminators
//   } catch (error) {
//     console.error("Error extracting metadata URI:", error);
//     return null;
//   }
// };


const extractMetadataUri = async (
  connection: Connection,
  metadataPDA: PublicKey
): Promise<string | null> => {
  try {
    // Fetch the metadata account data
    const accountInfo = await connection.getAccountInfo(metadataPDA);
    
    if (!accountInfo) {
      console.error("Metadata account not found");
      return null;
    }
    
    // Manual parsing of metadata account data
    const data = accountInfo.data;
    
    // Skip key, update authority, and mint (1 + 32 + 32 = 65 bytes)
    let offset = 65;
    
    // Skip name
    const nameLength = data.readUInt32LE(offset);
    offset += 4 + nameLength;
    
    // Skip symbol
    const symbolLength = data.readUInt32LE(offset);
    offset += 4 + symbolLength;
    
    // Read URI
    const uriLength = data.readUInt32LE(offset);
    offset += 4;
    
    // Extract URI as string and remove null terminators
    return data.slice(offset, offset + uriLength).toString('utf8').replace(/\0/g, '');
  } catch (error) {
    console.error("Error extracting metadata URI:", error);
    return null;
  }
};
