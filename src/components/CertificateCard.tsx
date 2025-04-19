import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface Certificate {
  id: string;              // mint address
  title: string;
  issuer: string;
  issuedTo: string;
  date: string;
  content: string;
  metadata: {
    imageUrl: string;      // URL (IPFS) of the flat certificate image
    [key: string]: any;
  };
  verified?: boolean;
}

interface CertificateCardProps {
  certificate: Certificate;
  className?: string;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, className }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/certificate/${certificate.id}`, {
      state: { certificate },
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Card className={cn("overflow-hidden border border-gray-200 dark:border-gray-800 transition-all duration-300 h-full", className)}>
        <CardHeader className="p-4 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <Badge
                variant="outline"
                className={
                  certificate.verified === true
                    ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                    : certificate.verified === false
                    ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                    : "bg-solana-purple/10 text-solana-purple border-solana-purple/20"
                }
              >
                {certificate.verified === true
                  ? "Verified"
                  : certificate.verified === false
                  ? "Invalid"
                  : "Certificate"}
              </Badge>
              <h3 className="font-medium text-lg leading-tight">
                {certificate.title}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-sm text-gray-600">Issued by</p>
          <p className="mb-2">{certificate.issuer}</p>
          <p className="text-sm text-gray-600">Issued to</p>
          <p className="mb-2">{certificate.issuedTo}</p>
          <p className="text-sm text-gray-600">Date</p>
          <p>{certificate.date}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-solana-purple hover:bg-solana-purple/10 transition-all"
            onClick={handleViewDetails}
          >
            <span className="mr-1">View details</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CertificateCard;
