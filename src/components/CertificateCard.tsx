
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CertificateCardProps {
  title: string;
  issuer: string;
  issuedTo?: string;
  date: string;
  verified?: boolean;
  onClick?: () => void;
  className?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({
  title,
  issuer,
  issuedTo,
  date,
  verified,
  onClick,
  className
}) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card 
        className={cn(
          "overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-800 transition-all duration-300 h-full",
          verified !== undefined ? (verified ? "hover:border-green-500/50" : "hover:border-red-500/50") : "hover:border-solana-purple/50",
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge 
                variant="outline" 
                className={cn(
                  "font-normal text-xs px-2 py-0.5 rounded-full",
                  verified === true ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800" : 
                  verified === false ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800" :
                  "bg-solana-purple/10 text-solana-purple border-solana-purple/20"
                )}
              >
                {verified === true ? "Verified" : verified === false ? "Invalid" : "Certificate"}
              </Badge>
              <h3 className="font-medium text-lg leading-tight">{title}</h3>
            </div>
            
            {verified !== undefined && (
              <div className={cn(
                "shrink-0 rounded-full w-8 h-8 flex items-center justify-center",
                verified ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"  
              )}>
                {verified ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400">
                    <path d="m18 6-12 12"/>
                    <path d="m6 6 12 12"/>
                  </svg>
                )}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col text-sm space-y-1">
            <p className="text-muted-foreground">Issued by</p>
            <p className="font-medium">{issuer}</p>
          </div>
          
          {issuedTo && (
            <div className="flex flex-col text-sm space-y-1">
              <p className="text-muted-foreground">Issued to</p>
              <p className="font-medium">{issuedTo}</p>
            </div>
          )}
          
          <div className="flex flex-col text-sm space-y-1">
            <p className="text-muted-foreground">Date</p>
            <p className="font-medium">{date}</p>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <Button 
            variant="ghost" 
            className="text-solana-purple hover:text-solana-purple hover:bg-solana-purple/10 transition-all" 
            size="sm"
          >
            <span className="mr-1">View details</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;
