import React, { useState, useEffect } from "react";
import axios from "axios";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  findMetadataPda,
  findMasterEditionPda,
  mplTokenMetadata,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import CertificateGenerator from "@/components/CertificateGenerator";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { publicKey } from "@metaplex-foundation/umi";
import idl from '../idl/solana_nft_anchor_hackernoon.json';
import { PINATA_CONFIG, SOLANA_CONFIG } from "@/config";
import { Button } from "@/components/ui/button";
import { Check, Copy, ExternalLink } from "lucide-react";
import { useState as useHookState } from "react";


const Issue = () => {
  const wallet = useWallet();
  const [connection, setConnection] = useState<Connection | null>(null);

  useEffect(() => {
    const conn = new Connection(import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com");
    setConnection(conn);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    recipientName: "",
    recipientAddress: "",
    content: "",
    date: new Date().toLocaleDateString(),
    certificateImage: "",
  });

  // Set up Anchor provider using the connected wallet
  // const provider = new anchor.AnchorProvider(connection, wallet as any, anchor.AnchorProvider.defaultOptions());
  // anchor.setProvider(provider);
  const provider = connection ? 
    new anchor.AnchorProvider(connection, wallet as any, anchor.AnchorProvider.defaultOptions()) : 
    null;

  // Only set provider when it's available
  useEffect(() => {
    if (provider) {
      anchor.setProvider(provider);
    }
  }, [provider]);

  // Program details (update your IDL as needed)
  const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

  // const program = new anchor.Program(idl as anchor.Idl, programId, provider);
  const program = provider ? new anchor.Program(idl as anchor.Idl, programId, provider) : null;


  const [minting, setMinting] = useState(false);
  const [txSignature, setTxSignature] = useState("");
  const [mintAddress, setMintAddress] = useState("");

  // Update state on input change (keeps UI unchanged)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ----------------------- Helper Functions -----------------------

  // Converts a data URL (from CertificateGenerator) to a Blob.
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error("Invalid dataURL");
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Uploads an image Blob to Pinata IPFS and returns an ipfs:// URI.
  const uploadImageToIPFS = async (file: Blob): Promise<string> => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const data = new FormData();
    data.append("file", file, "certificate.png");

    console.log("Using Pinata credentials:");

    try {
      const response = await axios.post(url, data, {
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        headers: {
          "Authorization": `Bearer ${PINATA_CONFIG.JWT}`
        },
      });

      console.log("Pinata response:", response.data);
      
      const ipfsHash = response.data.IpfsHash;
      return `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${ipfsHash}`;
    } catch (error) {
      console.error("Pinata upload error details:", error.response?.data || error.message);
      throw error;
    }
    
  };

  // Uploads a metadata JSON object to Pinata IPFS and returns an ipfs:// URI.
  const uploadMetadataToIPFS = async (metadata: object): Promise<string> => {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const response = await axios.post(url, metadata, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PINATA_CONFIG.JWT}`
      },
    });
    
    const ipfsHash = response.data.IpfsHash;
    return `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${ipfsHash}`;
  };

  // ----------------------- Form Submission -----------------------

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!connection) {
      alert("Waiting for connection to Solana network...");
      return;
    }
    if (!program) {
      alert("Program not initialized. Please try again.");
      return;
    }
    if (!formData.certificateImage) {
      alert("Certificate image not generated yet!");
      return;
    }
    
    setMinting(true);
    try {
      // 1. Convert the generated certificate image (data URL) to a Blob
      const imageBlob = dataURLtoBlob(formData.certificateImage);

      // 2. Upload the image to Pinata, obtaining an ipfs:// URI
      console.log("Uploading image to Pinata...");
      const imageURI = await uploadImageToIPFS(imageBlob);
      console.log("Image uploaded to IPFS:", imageURI);

      // 3. Build the metadata JSON (include title, description, image, etc.)
      const metadata = {
        name: formData.title,
        description: formData.content,
        image: imageURI,
        attributes: [
          { trait_type: "Recipient Name", value: formData.recipientName },
          { trait_type: "Date Issued", value: formData.date },
        ],
      };

      // 4. Upload the metadata JSON to Pinata
      console.log("Uploading metadata to Pinata...");
      const metadataURI = await uploadMetadataToIPFS(metadata);
      console.log("Metadata uploaded to IPFS:", metadataURI);

      // 5. Generate a new mint keypair for the NFT
      const mint = Keypair.generate();

      // 6. Derive the associated token account for the NFT
      const associatedTokenAccount = await getAssociatedTokenAddress(mint.publicKey, wallet.publicKey);

      // 7. Derive the metadata and master edition PDAs from the mint
      // const umi = createUmi(import.meta.env.VITE_SOLANA_RPC_URL!)
      //   .use(walletAdapterIdentity(wallet));
      const umi = createUmi(import.meta.env.VITE_SOLANA_RPC_URL || "https://api.devnet.solana.com")
        .use(walletAdapterIdentity(wallet as any))
        .use(mplTokenMetadata());

      const metadataAccount = findMetadataPda(umi, { 
        mint: publicKey(mint.publicKey.toString()) 
      })[0];

      const masterEditionAccount = findMasterEditionPda(umi, { 
        mint: publicKey(mint.publicKey.toString()) 
      })[0];

      // 8. Call the smart contract's init_nft instruction.
      // We pass:
      // • formData.title as the certificate title,
      // • metadataURI (from Pinata) as the NFT URI,
      // • formData.content as the certificate description.
      const tx = await program.methods
        // .initNft(formData.title, metadataURI, formData.content)
        .initNft(formData.title, "CERT", metadataURI)
        .accounts({
          signer: wallet.publicKey,
          mint: mint.publicKey,
          associatedTokenAccount: associatedTokenAccount,
          metadataAccount: metadataAccount,
          masterEditionAccount: masterEditionAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          tokenMetadataProgram: MPL_TOKEN_METADATA_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([mint])
        .rpc();

      setTxSignature(tx);
      setMintAddress(mint.publicKey.toString());
      // alert(`Certificate NFT minted successfully!\nView at: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert("Minting failed: " + err);
    }
    setMinting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-8">Issue Certificate</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleIssue} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-medium">Certificate Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Recipient Name</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Recipient Address</label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={formData.recipientAddress}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Certificate Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg min-h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block mb-2 font-medium">Date Issued</label>
                  <input
                    type="text"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  type="submit" 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors" 
                  disabled={minting || !connection || !program || !wallet.publicKey}
                >
                  {minting ? "Issuing..." : "Issue Certificate"}
                </Button>
                
                {!wallet.publicKey && (
                  <p className="text-red-500 mt-2 text-sm text-center">Please connect your wallet first</p>
                )}
                {!connection && (
                  <p className="text-amber-500 mt-2 text-sm text-center">Connecting to Solana network...</p>
                )}
              </div>
            </form>

            {txSignature && (
              <div className="mt-6 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-4">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-green-800 dark:text-green-300">Certificate issued successfully!</h3>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">Your certificate has been minted as an NFT on Solana.</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300">Transaction ID</label>
                    <div className="flex items-center">
                      <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded border border-green-200 dark:border-green-800 text-sm font-mono flex-1 overflow-x-auto">
                        {txSignature}
                      </code>
                      <CopyButton textToCopy={txSignature} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300">Explorer Link</label>
                    <div className="flex items-center">
                      <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded border border-green-200 dark:border-green-800 text-sm font-mono flex-1 overflow-x-auto truncate">
                        https://explorer.solana.com/tx/{txSignature}?cluster=devnet
                      </code>
                      <CopyButton textToCopy={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} />
                      <a 
                        href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
                        title="Open in Solana Explorer"
                      >
                        <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-green-700 dark:text-green-300">
                      Certificate ID (Use this to verify)
                    </label>
                    <div className="flex items-center">
                      <code className="bg-white dark:bg-gray-800 px-3 py-2 rounded border border-green-200 dark:border-green-800 text-sm font-mono flex-1 overflow-x-auto">
                        {mintAddress}
                      </code>
                      <CopyButton textToCopy={mintAddress} />
                      <a 
                        href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
                        title="View NFT on Solana Explorer"
                      >
                        <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </a>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Copy this ID to verify your certificate on the Verify page
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                    <Button 
                      onClick={() => window.location.href = '/verify'}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                    >
                      Go to Verify Page
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit sticky top-24">
            <h2 className="text-xl font-medium mb-4">Certificate Preview</h2>
            <div className="certificate-preview-container bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
              <div 
                className="certificate-preview-wrapper relative" 
                style={{ 
                  transform: 'scale(0.65)', // Reduce scale to show more content
                  transformOrigin: 'center top',
                  height: '800px', // Increase height to show full certificate
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  padding: '1rem'
                }}
              >
                <div className="w-[800px]"> {/* Fixed width container */}
                  <CertificateGenerator
                    title={formData.title || "Certificate"}
                    recipientAddress={formData.recipientAddress}
                    recipientName={formData.recipientName || "Recipient"}
                    content={formData.content || ""}
                    date={formData.date}
                    onImageGenerated={(img) =>
                      setFormData({ ...formData, certificateImage: img })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const [copied, setCopied] = useHookState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button
      onClick={handleCopy}
      className="ml-2 p-2 rounded-md hover:bg-green-100 dark:hover:bg-green-800/50 transition-colors"
      title={copied ? "Copied!" : "Copy to clipboard"}
    >
      {copied ? (
        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
      ) : (
        <Copy className="h-5 w-5 text-green-600 dark:text-green-400" />
      )}
    </button>
  );
};

export default Issue;
