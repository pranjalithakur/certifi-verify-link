
import React, { useState, useEffect } from 'react';
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
  const [previewKey, setPreviewKey] = useState(0); // Add key to force re-render of preview

  useEffect(() => {
    // Update preview when form data changes
    setPreviewKey(prev => prev + 1);
  }, [title, recipientName, recipientAddress, content]);

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
      // Generate full-size certificate for NFT minting
      const certificateElement = document.createElement('div');
      certificateElement.style.width = '800px';
      certificateElement.style.height = '600px';
      certificateElement.style.position = 'absolute';
      certificateElement.style.left = '-9999px';
      certificateElement.style.top = '-9999px';
      document.body.appendChild(certificateElement);
      
      // Create a temporary container for the full-sized certificate
      const tempContainer = document.createElement('div');
      tempContainer.style.width = '800px';
      tempContainer.style.height = '600px';
      document.body.appendChild(tempContainer);
      
      // Render the generator component to the temporary container
      const html2canvas = (await import('html2canvas')).default;
      
      // Wait for fonts to load
      await document.fonts.ready;
      
      // Create a div with certificate content
      const certDiv = document.createElement('div');
      certDiv.className = 'certificate-for-nft';
      certDiv.style.width = '800px';
      certDiv.style.height = '600px';
      certDiv.style.backgroundColor = 'white';
      certDiv.style.padding = '40px';
      certDiv.style.border = '8px solid rgba(145, 85, 253, 0.2)';
      certDiv.style.borderRadius = '12px';
      certDiv.style.position = 'relative';
      certDiv.style.boxSizing = 'border-box';
      
      // Header
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '40px';
      
      const certTitle = document.createElement('h2');
      certTitle.textContent = 'Certificate of Achievement';
      certTitle.style.fontSize = '24px';
      certTitle.style.fontWeight = 'bold';
      certTitle.style.color = '#333';
      certTitle.style.marginBottom = '12px';
      
      const mainTitle = document.createElement('h1');
      mainTitle.textContent = title;
      mainTitle.style.fontSize = '30px';
      mainTitle.style.fontWeight = 'bold';
      mainTitle.style.color = '#9155FD';
      
      header.appendChild(certTitle);
      header.appendChild(mainTitle);
      
      // Body
      const body = document.createElement('div');
      body.style.textAlign = 'center';
      body.style.marginBottom = '40px';
      
      const intro = document.createElement('p');
      intro.textContent = 'This certifies that';
      intro.style.fontSize = '18px';
      intro.style.marginBottom = '12px';
      
      const name = document.createElement('p');
      name.textContent = recipientName || 'Recipient';
      name.style.fontSize = '24px';
      name.style.fontWeight = 'bold';
      name.style.marginBottom = '12px';
      
      const completed = document.createElement('p');
      completed.textContent = 'has successfully completed the requirements';
      completed.style.fontSize = '18px';
      completed.style.marginBottom = '12px';
      
      const description = document.createElement('p');
      description.textContent = content;
      description.style.fontSize = '16px';
      description.style.color = '#666';
      description.style.maxWidth = '80%';
      description.style.margin = '0 auto';
      
      body.appendChild(intro);
      body.appendChild(name);
      body.appendChild(completed);
      body.appendChild(description);
      
      // Footer
      const footer = document.createElement('div');
      footer.style.display = 'flex';
      footer.style.justifyContent = 'space-between';
      footer.style.alignItems = 'flex-end';
      footer.style.marginTop = '40px';
      
      const dateDiv = document.createElement('div');
      const dateLabel = document.createElement('p');
      dateLabel.textContent = 'Date Issued';
      dateLabel.style.fontSize = '14px';
      dateLabel.style.color = '#666';
      dateLabel.style.marginBottom = '4px';
      
      const dateValue = document.createElement('p');
      dateValue.textContent = new Date().toLocaleDateString();
      dateValue.style.fontWeight = '500';
      
      dateDiv.appendChild(dateLabel);
      dateDiv.appendChild(dateValue);
      
      const signatureDiv = document.createElement('div');
      signatureDiv.style.display = 'flex';
      signatureDiv.style.flexDirection = 'column';
      signatureDiv.style.alignItems = 'center';
      
      const signatureLine = document.createElement('div');
      signatureLine.style.width = '160px';
      signatureLine.style.height = '2px';
      signatureLine.style.backgroundColor = 'black';
      signatureLine.style.marginBottom = '8px';
      
      const signatureLabel = document.createElement('p');
      signatureLabel.textContent = 'Authorized Signature';
      signatureLabel.style.fontWeight = '500';
      
      signatureDiv.appendChild(signatureLine);
      signatureDiv.appendChild(signatureLabel);
      
      const addressDiv = document.createElement('div');
      addressDiv.style.textAlign = 'right';
      
      const addressLabel = document.createElement('p');
      addressLabel.textContent = 'Recipient Address';
      addressLabel.style.fontSize = '14px';
      addressLabel.style.color = '#666';
      addressLabel.style.marginBottom = '4px';
      
      const addressValue = document.createElement('p');
      addressValue.textContent = recipientAddress;
      addressValue.style.fontFamily = 'monospace';
      addressValue.style.fontSize = '12px';
      addressValue.style.maxWidth = '150px';
      addressValue.style.overflow = 'hidden';
      addressValue.style.textOverflow = 'ellipsis';
      
      addressDiv.appendChild(addressLabel);
      addressDiv.appendChild(addressValue);
      
      footer.appendChild(dateDiv);
      footer.appendChild(signatureDiv);
      footer.appendChild(addressDiv);
      
      // Solana logo watermark
      const watermark = document.createElement('div');
      watermark.style.position = 'absolute';
      watermark.style.inset = '0';
      watermark.style.display = 'flex';
      watermark.style.alignItems = 'center';
      watermark.style.justifyContent = 'center';
      watermark.style.opacity = '0.05';
      watermark.style.pointerEvents = 'none';
      watermark.style.zIndex = '0';
      watermark.innerHTML = `<svg width="300" height="300" viewBox="0 0 128 114" xmlns="http://www.w3.org/2000/svg">
        <path d="M113.6 36.4H14.2c-1.8 0-3.4 1-4.3 2.6-.8 1.6-.7 3.4.2 4.9l14.7 21.4c.7 1.1 2 1.7 3.4 1.7h87c1.8 0 3.4-1 4.3-2.6.8-1.6.7-3.4-.2-4.9l-14.7-21.4c-.7-1.1-2-1.7-3.4-1.7h-1.4z" fill="#000000"/>
        <path d="M14.2 76.9h99.4c1.8 0 3.4-1 4.3-2.6.8-1.6.7-3.4-.2-4.9L103 48c-.7-1.1-2-1.7-3.4-1.7h-87c-1.8 0-3.4 1-4.3 2.6-.8 1.6-.7 3.4.2 4.9l14.7 21.4c.7 1.1 2 1.7 3.4 1.7h-12.4z" fill="#000000"/>
        <path d="M113.6 113.1H14.2c-1.8 0-3.4-1-4.3-2.6-.8-1.6-.7-3.4.2-4.9l14.7-21.4c.7-1.1 2-1.7 3.4-1.7h87c1.8 0 3.4 1 4.3 2.6.8 1.6.7 3.4-.2 4.9l-14.7 21.4c-.7 1.1-2 1.7-3.4 1.7h10.4z" fill="#000000"/>
        <path d="M14.2 0h99.4c1.8 0 3.4 1 4.3 2.6.8 1.6.7 3.4-.2 4.9L103 28.9c-.7 1.1-2 1.7-3.4-1.7h-87c-1.8 0-3.4-1-4.3-2.6-.8-1.6-.7-3.4.2-4.9L23.2 1.7c.7-1.1 2-1.7 3.4-1.7H14.2z" fill="#000000"/>
      </svg>`;
      
      // Add the header bar
      const headerBar = document.createElement('div');
      headerBar.style.position = 'absolute';
      headerBar.style.top = '0';
      headerBar.style.left = '0';
      headerBar.style.width = '100%';
      headerBar.style.height = '64px';
      headerBar.style.backgroundColor = 'rgba(145, 85, 253, 0.1)';
      headerBar.style.zIndex = '1';
      
      // Assemble the certificate
      certDiv.appendChild(headerBar);
      certDiv.appendChild(watermark);
      
      const content = document.createElement('div');
      content.style.position = 'relative';
      content.style.zIndex = '2';
      content.style.height = '100%';
      content.style.display = 'flex';
      content.style.flexDirection = 'column';
      content.style.justifyContent = 'space-between';
      
      content.appendChild(header);
      content.appendChild(body);
      content.appendChild(footer);
      
      certDiv.appendChild(content);
      
      tempContainer.appendChild(certDiv);
      
      // Generate the image
      const canvas = await html2canvas(certDiv, {
        backgroundColor: 'white',
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
      });
      
      const imageData = canvas.toDataURL('image/png');
      setCertificateImage(imageData);
      
      // Clean up
      document.body.removeChild(tempContainer);
      
      // Issue the certificate with the generated image
      const result = await issueCertificate(title, recipientAddress, content, imageData);
      
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
                <div className="bg-white dark:bg-gray-800 shadow-xl p-6 rounded-lg relative h-full">
                  <h3 className="text-lg font-medium mb-4">Certificate Preview</h3>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 overflow-hidden" style={{ height: '400px' }}>
                    <div style={{ transform: 'scale(0.45)', transformOrigin: 'top left', position: 'relative', width: '800px', height: '600px' }} key={previewKey}>
                      <CertificateGenerator
                        title={title || "Certificate Title"}
                        recipientName={recipientName || "Recipient Name"}
                        recipientAddress={recipientAddress || "Wallet Address"}
                        content={content || "Certificate description and details will appear here."}
                        forPreview={true}
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
                  <div className="mb-8 rounded-lg overflow-hidden shadow-lg max-w-xl mx-auto">
                    <img 
                      src={certificateImage} 
                      alt="Certificate" 
                      className="w-full h-auto"
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
