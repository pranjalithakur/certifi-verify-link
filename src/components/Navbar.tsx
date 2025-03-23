
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import WalletConnect from './WalletConnect';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  
  // Safe way to access location that works even when not inside a Router
  let location;
  try {
    location = useLocation();
  } catch (e) {
    // If useLocation() fails, we're not in a Router context
    // Set a default value that won't break the component
    location = { pathname: '/' };
  }
  
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Issue', path: '/issue' },
    { name: 'Verify', path: '/verify' },
  ];

  return (
    <motion.header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-6 transition-all duration-300 ease-in-out',
        scrolled 
          ? 'py-4 bg-white/80 backdrop-blur-lg shadow-sm dark:bg-solana-black/80' 
          : 'py-6 bg-transparent'
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-solana-purple rounded-full opacity-70 blur-sm animate-pulse-slow"></div>
            <div className="relative flex items-center justify-center w-10 h-10 bg-white dark:bg-solana-black rounded-full border border-solana-purple/30">
              <span className="text-solana-purple font-bold text-xl">C</span>
            </div>
          </div>
          <span className="font-medium text-xl hidden sm:block">CertifiSol</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button 
                variant={location.pathname === link.path ? "default" : "ghost"} 
                className={cn(
                  "px-4 transition-all duration-200",
                  location.pathname === link.path 
                    ? "bg-solana-purple hover:bg-solana-purple/90" 
                    : "hover:bg-solana-purple/10 hover:text-solana-purple"
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    className="absolute bottom-0 left-0 h-0.5 bg-solana-purple w-full"
                    layoutId="navbar-indicator"
                  />
                )}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          <WalletConnect />
          <div className="md:hidden">
            <Button size="icon" variant="ghost">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu">
                <line x1="4" x2="20" y1="12" y2="12"></line>
                <line x1="4" x2="20" y1="6" y2="6"></line>
                <line x1="4" x2="20" y1="18" y2="18"></line>
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
