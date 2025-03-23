
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { verifyCertificate, getCertificatesForAddress } from '@/lib/solana';
import Navbar from '@/components/Navbar';
import CertificateCard from '@/components/CertificateCard';

const Verify = () => {
  const [certId, setCertId] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [certificates, setCertificates] = useState<any[]>([]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!certId) {
      toast.error('Please enter a certificate ID');
      return;
    }
    
    setIsVerifying(true);
    setVerificationResult(null);
    
    try {
      const result = await verifyCertificate(certId);
      setVerificationResult(result);
      
      if (result) {
        toast.success('Certificate verified successfully!');
      } else {
        toast.error('Certificate verification failed');
      }
    } catch (error) {
      console.error("Error verifying certificate:", error);
      toast.error('An error occurred during verification');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress) {
      toast.error('Please enter a wallet address');
      return;
    }
    
    setIsSearching(true);
    setCertificates([]);
    
    try {
      const results = await getCertificatesForAddress(walletAddress);
      setCertificates(results);
      
      if (results.length === 0) {
        toast.info('No certificates found for this address');
      } else {
        toast.success(`Found ${results.length} certificate(s)`);
      }
    } catch (error) {
      console.error("Error searching certificates:", error);
      toast.error('An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      <Navbar />
      
      <div className="pt-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold mb-4">Verify Certificates</h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Instantly verify the authenticity of certificates issued on the Solana blockchain.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800 shadow-xl p-6 md:p-8 max-w-3xl mx-auto">
              <Tabs defaultValue="id" className="space-y-6">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="id">Verify by ID</TabsTrigger>
                  <TabsTrigger value="wallet">Search by Wallet</TabsTrigger>
                </TabsList>
                
                <TabsContent value="id" className="space-y-6">
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="certId">Certificate ID</Label>
                      <Input
                        id="certId"
                        value={certId}
                        onChange={(e) => setCertId(e.target.value)}
                        placeholder="Enter certificate ID"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-solana-purple hover:bg-solana-purple/90 text-white py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300"
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verifying...
                        </span>
                      ) : "Verify Certificate"}
                    </Button>
                  </form>
                  
                  {verificationResult !== null && (
                    <div className={`mt-6 p-6 rounded-lg ${verificationResult ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${verificationResult ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {verificationResult ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                              <path d="m18 6-12 12"/>
                              <path d="m6 6 12 12"/>
                            </svg>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className={`text-lg font-medium ${verificationResult ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                            {verificationResult ? 'Certificate is Valid' : 'Certificate is Invalid'}
                          </h3>
                          <p className={`text-sm ${verificationResult ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {verificationResult 
                              ? 'This certificate has been verified on the blockchain and is authentic.' 
                              : 'This certificate could not be verified or may have been tampered with.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="wallet" className="space-y-6">
                  <form onSubmit={handleSearch} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Wallet Address</Label>
                      <Input
                        id="walletAddress"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="Enter Solana wallet address"
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 font-mono text-sm"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-solana-purple hover:bg-solana-purple/90 text-white py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300"
                      disabled={isSearching}
                    >
                      {isSearching ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </span>
                      ) : "Search Certificates"}
                    </Button>
                  </form>
                  
                  {certificates.length > 0 && (
                    <div className="mt-8 space-y-6">
                      <h3 className="text-xl font-medium">Certificates</h3>
                      <div className="grid gap-4">
                        {certificates.map((cert, index) => (
                          <CertificateCard
                            key={index}
                            title={cert.title}
                            issuer={cert.issuer}
                            issuedTo={cert.issuedTo}
                            date={cert.date}
                            className="w-full"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Verify;
