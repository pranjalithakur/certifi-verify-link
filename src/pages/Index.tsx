
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import CertificateCard from '@/components/CertificateCard';

const Index = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100]);

  const featureItems = [
    {
      title: "Issue Certificates",
      description: "Create and issue blockchain-verified certificates securely on the Solana network.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-solana-purple">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <path d="M3 9h18"/>
          <path d="M9 21V9"/>
        </svg>
      )
    },
    {
      title: "Verify Instantly",
      description: "Validate certificates in seconds with cryptographic proof of authenticity.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-solana-green">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
          <path d="m9 12 2 2 4-4"/>
        </svg>
      )
    },
    {
      title: "Immutable Records",
      description: "Certificates are permanently stored on the blockchain, immune to tampering or loss.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-solana-cyan">
          <path d="M12 2v8"/>
          <path d="m4.93 10.93 1.41 1.41"/>
          <path d="M2 18h2"/>
          <path d="M20 18h2"/>
          <path d="m19.07 10.93-1.41 1.41"/>
          <path d="M22 22H2"/>
          <path d="m8 22 4-10 4 10"/>
        </svg>
      )
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <div ref={targetRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-6">
        <motion.div 
          className="absolute inset-0 -z-10"
          style={{ opacity, scale, y }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-solana-purple/5 via-white to-white dark:from-solana-purple/10 dark:via-gray-900 dark:to-gray-900" />
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-solana-purple/20 via-solana-cyan/10 to-transparent blur-3xl opacity-50 dark:from-solana-purple/10 dark:via-solana-cyan/5" />
        </motion.div>
        
        <div className="max-w-5xl mx-auto pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
              <span className="block">Blockchain</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-solana-purple to-solana-cyan">Certificate Verification</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Issue and verify certificates with the speed and security of Solana blockchain. Tamper-proof, instant verification for a new era of digital credentials.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Link to="/issue">
                <Button className="bg-solana-purple hover:bg-solana-purple/90 text-white px-8 py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300">
                  Issue Certificate
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="outline" className="border-solana-purple text-solana-purple hover:bg-solana-purple/10 px-8 py-6 rounded-lg text-lg transition-all duration-300">
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="mt-16 md:mt-24 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 pointer-events-none -bottom-10 z-10" />
            <div className="max-w-3xl mx-auto">
              <CertificateCard 
                title="Solana Certified Developer"
                issuer="Solana Foundation"
                date="May 15, 2023"
                verified={true}
                className="shadow-xl shadow-solana-purple/10"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Features Section */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Secure, Scalable</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Built on Solana's high-performance blockchain for lightning-fast verification with minimal fees.
              </p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {featureItems.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                A seamless experience from issuance to verification, powered by blockchain technology.
              </p>
            </motion.div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Connect your Solana wallet to authenticate as an issuer or verifier."
              },
              {
                step: "02",
                title: "Issue or Verify",
                description: "Create a new certificate or verify an existing one with just a few clicks."
              },
              {
                step: "03", 
                title: "Blockchain Confirmation",
                description: "The certificate is securely stored on Solana with cryptographic proof of authenticity."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                <div className="text-9xl font-bold text-gray-100 dark:text-gray-800 absolute -top-8 -left-3 z-0">
                  {item.step}
                </div>
                <div className="relative z-10 pt-6">
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-solana-purple/10 to-solana-cyan/5 dark:from-solana-purple/20 dark:to-solana-cyan/10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-solana-purple opacity-10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-solana-cyan opacity-10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
              Join the future of credential verification. Issue tamper-proof certificates and verify with confidence.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/issue">
                <Button className="bg-solana-purple hover:bg-solana-purple/90 text-white px-8 py-6 rounded-lg text-lg shadow-lg shadow-solana-purple/20 hover:shadow-xl hover:shadow-solana-purple/30 transition-all duration-300">
                  Start Issuing
                </Button>
              </Link>
              <Link to="/verify">
                <Button variant="outline" className="border-solana-purple text-solana-purple hover:bg-solana-purple/10 px-8 py-6 rounded-lg text-lg transition-all duration-300">
                  Verify Certificates
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-solana-purple rounded-full opacity-70 blur-sm"></div>
                  <div className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-solana-black rounded-full border border-solana-purple/30">
                    <span className="text-solana-purple font-bold text-xl">C</span>
                  </div>
                </div>
                <span className="font-medium text-xl">CertifiSol</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Blockchain Certificate Verification</p>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-500 dark:text-gray-400">© 2023 CertifiSol. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
