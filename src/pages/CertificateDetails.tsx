import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Certificate } from "@/components/CertificateCard";

const CertificateDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const certificate = location.state?.certificate as Certificate;

  if (!certificate) {
    return (
      <div className="container mx-auto px-4 py-20 mt-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Certificate Not Found</h1>
        <p className="mb-8">The certificate you're looking for could not be found.</p>
        <Button onClick={() => navigate("/verify")}>
          Go to Verification Page
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="container mx-auto px-4 py-20 mt-16"
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-gray-800 dark:to-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2" variant={certificate.verified ? "default" : "secondary"}>
                {certificate.verified ? "Verified" : "Certificate"}
              </Badge>
              <h1 className="text-2xl font-bold">{certificate.title}</h1>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Certificate Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Issued By</p>
                  <p className="font-medium">{certificate.issuer}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issued To</p>
                  <p className="font-medium">{certificate.issuedTo}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{certificate.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Certificate ID</p>
                  <p className="font-mono text-xs break-all">{certificate.id}</p>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold mb-4">Certificate Content</h2>
              <p>{certificate.content}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Button onClick={() => window.open(`https://explorer.solana.com/tx/${certificate.id}?cluster=devnet`, "_blank")}>
            View on Solana Explorer
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CertificateDetails; 
