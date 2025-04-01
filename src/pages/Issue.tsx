// import React, { useState, useEffect } from 'react';
// import { motion } from 'framer-motion';
// import { Button } from '@/components/ui/button';
// import { Card } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { toast } from 'sonner';
// import { issueCertificate } from '@/lib/solana';
// import CertificateCard from '@/components/CertificateCard';
// import CertificateGenerator from '@/components/CertificateGenerator';

// const Issue = () => {
//   const [title, setTitle] = useState('');
//   const [recipientName, setRecipientName] = useState('');
//   const [recipientAddress, setRecipientAddress] = useState('');
//   const [content, setContent] = useState('');
//   const [isIssuing, setIsIssuing] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [certificateDetails, setCertificateDetails] = useState<any>(null);
//   const [certificateImage, setCertificateImage] = useState<string | null>(null);
//   const [previewKey, setPreviewKey] = useState(0);
//   const [displayImage, setDisplayImage] = useState<string | null>(null);
  
//   useEffect(() => {
//     setPreviewKey(prev => prev + 1);
//   }, [title, recipientName, recipientAddress, content]);

//   const handleImageGenerated = (imageData: string) => {
//     setCertificateImage(imageData);
//     setDisplayImage(imageData);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!title || !recipientAddress || !content) {
//       toast.error('Please fill in all required fields');
//       return;
//     }
    
//     setIsIssuing(true);
    
//     try {
//       if (!certificateImage) {
//         toast.info('Generating certificate image...');
//         await new Promise(resolve => setTimeout(resolve, 1500));
//         if (!certificateImage) {
//           throw new Error('Failed to generate certificate image');
//         }
//       }
      
//       // const result = await issueCertificate({
//       //   title,
//       //   recipientName,
//       //   recipientAddress,
//       //   date: new Date().toISOString()
//       // }, wallet);

//       const result = await issueCertificate(title, recipientAddress, content, certificateImage);

      
//       if (result) {
//         setCertificateDetails({
//           ...result,
//           issuedTo: recipientName || "Recipient"
//         });
//         setIsSuccess(true);
//         setDisplayImage(certificateImage);
//         toast.success('Certificate issued successfully as an NFT!');
//       } else {
//         toast.error('Failed to issue certificate');
//       }
//     } catch (error) {
//       console.error("Error issuing certificate:", error);
//       toast.error('An error occurred while issuing the certificate');
//     } finally {
//       setIsIssuing(false);
//     }
//   };

//   const resetForm = () => {
//     setTitle('');
//     setRecipientName('');
//     setRecipientAddress('');
//     setContent('');
//     setIsSuccess(false);
//     setCertificateDetails(null);
//     setCertificateImage(null);
//     setDisplayImage(null);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
//       <div className="pt-32 px-6">
//         <div className="max-w-5xl mx-auto">
//           <motion.div 
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-4xl font-bold mb-4">Issue Certificates</h1>
//             <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
//               Create and issue blockchain-verified certificates securely on the Solana network.
//             </p>
//           </motion.div>
          
//           {!isSuccess ? (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.1 }}
//               className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//               <Card className="bg-white dark:bg-gray-800 shadow-xl p-6 md:p-8">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="space-y-2">
//                     <Label htmlFor="title">Certificate Title</Label>
//                     <Input
//                       id="title"
//                       value={title}
//                       onChange={(e) => setTitle(e.target.value)}
//                       placeholder="e.g. Solana Developer Certification"
//                       className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="recipientName">Recipient Name</Label>
//                     <Input
//                       id="recipientName"
//                       value={recipientName}
//                       onChange={(e) => setRecipientName(e.target.value)}
//                       placeholder="e.g. John Doe"
//                       className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="recipient">Recipient Wallet Address</Label>
//                     <Input
//                       id="recipient"
//                       value={recipientAddress}
//                       onChange={(e) => setRecipientAddress(e.target.value)}
//                       placeholder="Solana wallet address"
//                       className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-mono text-sm"
//                     />
//                   </div>
                  
//                   <div className="space-y-2">
//                     <Label htmlFor="content">Certificate Content</Label>
//                     <Textarea
//                       id="content"
//                       value={content}
//                       onChange={(e) => setContent(e.target.value)}
//                       placeholder="Describe what this certificate represents..."
//                       className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-32"
//                     />
//                   </div>
                  
//                   <Button 
//                     type="submit" 
//                     className="w-full bg-solana-purple hover:bg-solana-purple/90 text-white py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300"
//                     disabled={isIssuing}
//                   >
//                     {isIssuing ? (
//                       <span className="flex items-center justify-center">
//                         <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         {certificateImage ? 'Minting NFT...' : 'Generating Certificate...'}
//                       </span>
//                     ) : "Issue Certificate as NFT"}
//                   </Button>
//                 </form>
//               </Card>
              
//               <div className="hidden md:block">
//                 <div className="bg-white dark:bg-gray-800 shadow-xl p-6 rounded-lg relative h-full">
//                   <h3 className="text-lg font-medium mb-4">Certificate Preview</h3>
//                   <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 overflow-hidden" style={{ height: '400px' }}>
//                     <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', width: '800px', height: '600px', position: 'absolute' }} key={previewKey}>
//                       <CertificateGenerator
//                         title={title || "Certificate Title"}
//                         recipientName={recipientName || "Recipient Name"}
//                         recipientAddress={recipientAddress || "Wallet Address"}
//                         content={content || "Certificate description and details will appear here."}
//                         onImageGenerated={handleImageGenerated}
//                       />
//                     </div>
//                   </div>
//                   <p className="text-sm text-gray-500 mt-4">
//                     This certificate will be minted as an NFT on the Solana blockchain.
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           ) : (
//             <motion.div
//               initial={{ opacity: 0, scale: 0.95 }}
//               animate={{ opacity: 1, scale: 1 }}
//               transition={{ duration: 0.5 }}
//               className="text-center"
//             >
//               <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto">
//                 <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
//                   <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
//                     <path d="M20 6 9 17l-5-5"/>
//                   </svg>
//                 </div>
                
//                 <h2 className="text-2xl font-bold mb-4">Certificate Issued Successfully!</h2>
//                 <p className="text-gray-600 dark:text-gray-300 mb-8">
//                   The certificate has been issued as an NFT on the Solana blockchain and can now be verified by the recipient.
//                 </p>
                
//                 {displayImage && (
//                   <div className="mb-8 border-4 border-solana-purple/20 rounded-lg shadow-lg overflow-hidden max-w-lg mx-auto">
//                     <img 
//                       src={displayImage} 
//                       alt="Certificate" 
//                       className="w-full h-auto"
//                     />
//                   </div>
//                 )}
                
//                 <div className="mb-8">
//                   <CertificateCard
//                     title={title || "Certificate"}
//                     issuer={certificateDetails?.issuer || "Issuer"}
//                     issuedTo={recipientName || "Recipient"}
//                     date={new Date().toLocaleDateString()}
//                     className="max-w-md mx-auto"
//                   />
//                 </div>
                
//                 <div className="flex flex-col sm:flex-row justify-center gap-4">
//                   <Button 
//                     onClick={resetForm}
//                     variant="outline" 
//                     className="border-solana-purple text-solana-purple hover:bg-solana-purple/10 px-6 py-2"
//                   >
//                     Issue Another Certificate
//                   </Button>
//                 </div>
//               </div>
//             </motion.div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Issue;

import React, { useState } from "react";
import axios from "axios";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  findMetadataPda,
  findMasterEditionPda,
  MPL_TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import CertificateGenerator from "@/components/CertificateGenerator";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { publicKey } from "@metaplex-foundation/umi";
import idl from '../idl/solana_nft_anchor_hackernoon.json';
import { PINATA_CONFIG, SOLANA_CONFIG } from "@/config";

const Issue = () => {
  const wallet = useWallet();
  const connection = new Connection(SOLANA_CONFIG.RPC_URL, "confirmed");

  // Set up Anchor provider using the connected wallet
  const provider = new anchor.AnchorProvider(connection, wallet as any, anchor.AnchorProvider.defaultOptions());
  anchor.setProvider(provider);

  // Program details (update your IDL as needed)
  const programId = new PublicKey(SOLANA_CONFIG.PROGRAM_ID);

  const program = new anchor.Program(idl as anchor.Idl, programId, provider);

  // Form state – collects title, recipient name, certificate content, etc.
  const [formData, setFormData] = useState({
    title: "",
    recipientName: "",
    recipientAddress: wallet.publicKey?.toBase58() || "",
    content: "",
    date: new Date().toLocaleDateString(),
    certificateImage: "", // Data URL generated from CertificateGenerator
  });

  const [minting, setMinting] = useState(false);
  const [txSignature, setTxSignature] = useState("");

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
    import.meta.env.VITE_PINATA_API_KEY,
    e.preventDefault();
    if (!wallet.publicKey) {
      alert("Please connect your wallet first!");
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
      const umi = createUmi(import.meta.env.VITE_SOLANA_RPC_URL!)
        .use(walletAdapterIdentity(wallet));

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
        .initNft(formData.title, metadataURI, formData.content)
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
      alert(`Certificate NFT minted successfully!\nView at: https://explorer.solana.com/tx/${tx}?cluster=devnet`);
    } catch (err) {
      console.error("Error issuing certificate:", err);
      alert("Minting failed: " + err);
    }
    setMinting(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Issue Certificate</h1>
      <form onSubmit={handleIssue} className="space-y-4">
        <div>
          <label className="block">Certificate Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block">Recipient Name</label>
          <input
            type="text"
            name="recipientName"
            value={formData.recipientName}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block">Recipient Address</label>
          <input
            type="text"
            name="recipientAddress"
            value={formData.recipientAddress}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label className="block">Certificate Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            className="border p-2 w-full"
            required
          />
                </div>
        <div>
          <label className="block">Date Issued</label>
          <input
            type="text"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="border p-2 w-full"
            readOnly
          />
              </div>
        <div>
          {/*
            CertificateGenerator produces the certificateImage as a data URL.
            Its onImageGenerated callback updates formData.certificateImage.
          */}
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
        <button type="submit" className="bg-solana-purple text-white px-4 py-2 rounded" disabled={minting}>
          {minting ? "Issuing..." : "Issue Certificate"}
        </button>
      </form>
      {txSignature && (
        <div className="mt-4">
          <p className="text-green-600">Transaction Signature: {txSignature}</p>
      </div>
      )}
    </div>
  );
};

export default Issue;
