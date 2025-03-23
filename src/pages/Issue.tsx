
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { issueCertificate } from '@/lib/solana';
import CertificateCard from '@/components/CertificateCard';
import CertificateGenerator from '@/components/CertificateGenerator';

const Issue = () => {
  const [title, setTitle] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [content, setContent] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [certificateDetails, setCertificateDetails] = useState<any>(null);
  const [certificateImage, setCertificateImage] = useState<string | null>(null);

  const handleImageGenerated = (imageData: string) => {
    setCertificateImage(imageData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !recipientAddress || !content) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsIssuing(true);
    
    try {
      // Wait for the certificate image to be generated if it hasn't already
      if (!certificateImage) {
        toast.info('Generating certificate image...');
        // Give it a moment to generate the image
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!certificateImage) {
          throw new Error('Failed to generate certificate image');
        }
      }
      
      const result = await issueCertificate(title, recipientAddress, content, certificateImage);
      
      if (result) {
        setCertificateDetails(result);
        setIsSuccess(true);
        toast.success('Certificate issued successfully as an NFT!');
      } else {
        toast.error('Failed to issue certificate');
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast.error('An error occurred while issuing the certificate');
    } finally {
      setIsIssuing(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setRecipientName('');
    setRecipientAddress('');
    setContent('');
    setIsSuccess(false);
    setCertificateDetails(null);
    setCertificateImage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <div className="pt-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Issue Certificates</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Create and issue blockchain-verified certificates securely on the Solana network.
            </p>
          </motion.div>
          
          {!isSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Card className="bg-white dark:bg-gray-800 shadow-xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Certificate Title</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Solana Developer Certification"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="recipient">Recipient Wallet Address</Label>
                    <Input
                      id="recipient"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Solana wallet address"
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-mono text-sm"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Certificate Content</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Describe what this certificate represents..."
                      className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 min-h-32"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-solana-purple hover:bg-solana-purple/90 text-white py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300"
                    disabled={isIssuing}
                  >
                    {isIssuing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {certificateImage ? 'Minting NFT...' : 'Generating Certificate...'}
                      </span>
                    ) : "Issue Certificate as NFT"}
                  </Button>
                </form>
              </Card>
              
              <div className="hidden md:block">
                <div className="bg-white dark:bg-gray-800 shadow-xl p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Certificate Preview</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 overflow-hidden">
                    {/* Add a scaled-down version of the certificate for preview */}
                    <div className="transform scale-[0.4] origin-top-left ml-[-240px] mt-[-180px]">
                      <CertificateGenerator
                        title={title || "Certificate Title"}
                        recipientName={recipientName || "Recipient Name"}
                        recipientAddress={recipientAddress || "Wallet Address"}
                        content={content || "Certificate description and details will appear here."}
                        onImageGenerated={handleImageGenerated}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    This certificate will be minted as an NFT on the Solana blockchain.
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-3xl mx-auto">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                </div>
                
                <h2 className="text-2xl font-bold mb-4">Certificate Issued Successfully!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  The certificate has been issued as an NFT on the Solana blockchain and can now be verified by the recipient.
                </p>
                
                {certificateImage && (
                  <div className="mb-8">
                    <img 
                      src={certificateImage} 
                      alt="Certificate" 
                      className="mx-auto rounded-lg shadow-lg max-w-md"
                    />
                  </div>
                )}
                
                <div className="mb-8">
                  <CertificateCard
                    title={certificateDetails?.title || "Certificate"}
                    issuer={certificateDetails?.issuer || "Issuer"}
                    issuedTo={certificateDetails?.issuedTo || "Recipient"}
                    date={certificateDetails?.date || new Date().toLocaleDateString()}
                    className="max-w-md mx-auto"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button 
                    onClick={resetForm}
                    variant="outline" 
                    className="border-solana-purple text-solana-purple hover:bg-solana-purple/10 px-6 py-2"
                  >
                    Issue Another Certificate
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Issue;
