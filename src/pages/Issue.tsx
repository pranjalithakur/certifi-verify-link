import React, { useState, useEffect, useRef } from "react";
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
import { toPng } from 'html-to-image';
import { encryptPayload, EncryptedPayload } from "@/lib/encryption";

const Issue = () => {
  const wallet = useWallet();
  const certRef = useRef<HTMLDivElement>(null)

  const [connection, setConnection] = useState<Connection | null>(null);
  const [encryptData, setEncryptData] = useState(false);

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

  const [certificateImage, setCertificateImage] = useState<string>("")

  const captureCertificate = async () => {
    if (!certRef.current) return;
    try {
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });
      setCertificateImage(dataUrl);
    } catch (err) {
      console.error("Failed to capture certificate image:", err);
    }
  };

  useEffect(() => {
    captureCertificate();
  }, [formData.title, formData.recipientName, formData.recipientAddress, formData.content, formData.date]);


  // ----------------------- Helper Functions -----------------------

  // Converts a data URL (from CertificateGenerator) to a Blob.
  const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new Blob([u8], { type: mime });
  };

  // Uploads an image Blob to Pinata IPFS and returns an ipfs:// URI.
  const uploadImageToIPFS = async (file: Blob): Promise<string> => {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
    const data = new FormData();
    data.append("file", file, "certificate.png");
    const resp = await axios.post(url, data, {
      maxBodyLength: Infinity,
      headers: { Authorization: `Bearer ${PINATA_CONFIG.JWT}` },
    });
    return `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${resp.data.IpfsHash}`;
  };

  // Uploads a metadata JSON object to Pinata IPFS and returns an ipfs:// URI.
  const uploadMetadataToIPFS = async (metadata: object): Promise<string> => {
    const url = "https://api.pinata.cloud/pinning/pinJSONToIPFS";
    const resp = await axios.post(url, metadata, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_CONFIG.JWT}`,
      },
    });
    return `https://teal-dry-albatross-975.mypinata.cloud/ipfs/${resp.data.IpfsHash}`;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ----------------------- Form Submission -----------------------

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey) return alert("Connect your wallet first");
    if (!connection) return alert("No Solana connection");
    if (!program) return alert("Program not initialized");
    if (!certificateImage) return alert("Certificate preview not ready");
    
    setMinting(true);
    try {
      let metadataUri: string;

      if (encryptData) {
        // 1) Bundle metadata+image into one object
        const payload = {
          name: formData.title,
          symbol: "CERT",
          description: formData.content,
          attributes: [
            { trait_type: "Recipient Name", value: formData.recipientName },
            { trait_type: "Date Issued",       value: formData.date },
          ],
          imageDataUrl: certificateImage,
        };

        // 2) Encrypt under your static key
        const encryptedPkg: EncryptedPayload = encryptPayload(payload);

        // 3) Pin the encrypted JSON
        metadataUri = await uploadMetadataToIPFS(encryptedPkg);

      } else {
      // 1. Convert the generated certificate image (data URL) to a Blob
        const imageBlob = dataURLtoBlob(certificateImage);

        // 2. Upload the image to Pinata, obtaining an ipfs:// URI
        console.log("Uploading image to Pinata...");
        const imageURI = await uploadImageToIPFS(imageBlob);
        console.log("Image uploaded to IPFS:", imageURI);

        // 3. Build the metadata JSON (include title, description, image, etc.)
        const metadata = {
          name: formData.title,
          symbol: "CERT",
          description: formData.content,
          image: imageURI,
          attributes: [
            { trait_type: "Recipient Name", value: formData.recipientName },
            { trait_type: "Date Issued", value: formData.date },
          ],
        };
        // 4. Upload the metadata JSON to Pinata
        console.log("Uploading metadata to Pinata...");
        metadataUri = await uploadMetadataToIPFS(metadata);
        console.log("Metadata uploaded to IPFS:", metadataUri);
      }

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
        .initNft(formData.title, "CERT", metadataUri)
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
        <h1 className="text-3xl font-bold text-center mb-8">
          Issue Certificate
        </h1>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <form
            onSubmit={handleIssue}
            className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6"
          >
            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">
                  Certificate Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Recipient Name
                </label>
                <input
                  name="recipientName"
                  value={formData.recipientName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Recipient Address
                </label>
                <input
                  name="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">
                  Certificate Content
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border rounded-lg min-h-[100px]"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Date Issued</label>
                <input
                  name="date"
                  value={formData.date}
                  readOnly
                  className="w-full p-3 border rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <input
                  id="encryptData"
                  type="checkbox"
                  checked={encryptData}
                  onChange={() => setEncryptData(!encryptData)}
                  className="h-4 w-4"
                />
                <label htmlFor="encryptData" className="select-none">
                  Encrypt certificate data
                </label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg"
              disabled={minting || !program || !wallet.publicKey}
            >
              {minting ? "Issuing..." : "Issue Certificate"}
            </Button>

            {!wallet.publicKey && (
              <p className="text-red-500 text-sm text-center mt-2">
                Please connect your wallet first
              </p>
            )}
            {!connection && (
              <p className="text-amber-500 text-sm text-center mt-2">
                Connecting to Solana network...
              </p>
            )}
          </form>

          {/* Certificate Preview */}
          <div
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24"
          >
            <h2 className="text-xl font-medium mb-4">
              Certificate Preview
            </h2>
            <div 
              ref={certRef}
              className="transform scale-75 origin-top-left"
            >
              <CertificateGenerator
                title={formData.title || "Certificate Title"}
                recipientName={
                  formData.recipientName || "Recipient Name"
                }
                recipientAddress={
                  formData.recipientAddress || "Recipient Address"
                }
                content={formData.content || "Certificate Content..."}
                date={formData.date}
              />
            </div>
          </div>
        </div>

        {/* Success Notification */}
        {txSignature && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center mr-4">
                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-medium text-green-800 dark:text-green-300">
                Certificate issued successfully!
              </h3>
            </div>
            <div className="space-y-3">
              {/* Transaction */}
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Transaction
                </span>
                <div className="flex items-center">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 text-sm font-mono overflow-x-auto rounded">
                    {txSignature}
                  </code>
                  <CopyButton textToCopy={txSignature} />
                  <a
                    href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-2 hover:bg-green-100 dark:hover:bg-green-800/50 rounded transition"
                  >
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </a>
                </div>
              </div>
              {/* Mint Address */}
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Certificate ID (Mint Address)
                </span>
                <div className="flex items-center">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 text-sm font-mono overflow-x-auto rounded">
                    {mintAddress}
                  </code>
                  <CopyButton textToCopy={mintAddress} />
                  <a
                    href={`https://explorer.solana.com/address/${mintAddress}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 p-2 hover:bg-green-100 dark:hover:bg-green-800/50 rounded transition"
                  >
                    <ExternalLink className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </a>
                </div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Copy this ID to verify on the Verify page
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/verify")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Go to Verify Page
              </Button>
            </div>
          </div>
        )}
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
      className="ml-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
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
