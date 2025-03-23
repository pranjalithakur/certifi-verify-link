
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const shortenAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleConnect = async () => {
    if (connected) {
      setConnected(false);
      setWalletAddress('');
      toast.success('Wallet disconnected');
      return;
    }
    
    setIsLoading(true);
    // Simulate connecting to wallet
    setTimeout(() => {
      const mockAddress = 'CeRt1F1C4t3V3r1F1c4T10n5o14N4';
      setWalletAddress(mockAddress);
      setConnected(true);
      setIsLoading(false);
      toast.success('Wallet connected successfully');
    }, 1000);
  };

  return (
    <div className="relative">
      <Button 
        onClick={handleConnect}
        variant={connected ? "outline" : "default"}
        className={`transition-all duration-300 ease-in-out ${connected ? 'border-solana-purple text-solana-purple hover:bg-solana-purple/10' : 'bg-solana-purple hover:bg-solana-purple/90'}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </span>
        ) : connected ? (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
            {shortenAddress(walletAddress)}
          </div>
        ) : (
          'Connect Wallet'
        )}
      </Button>
      
      {connected && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-full aspect-square">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down">
                <path d="m6 9 6 6 6-6"/>
              </svg>
              <span className="sr-only">Open wallet menu</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-0" align="end">
            <div className="flex flex-col text-sm">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Connected as</p>
                <p className="font-mono text-xs mt-1 break-all">{walletAddress}</p>
              </div>
              <button onClick={handleConnect} className="px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-red-500">
                Disconnect
              </button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default WalletConnect;
