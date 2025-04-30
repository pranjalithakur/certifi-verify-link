import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CertificateGeneratorProps {
  title: string;
  recipientAddress: string;
  recipientName: string;
  content: string;
  date?: string;
  onImageGenerated?: (imageData: string) => void;
  className?: string;
}

const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  title,
  recipientAddress,
  recipientName,
  content,
  date = new Date().toLocaleDateString(),
  onImageGenerated,
  className,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Generate image once all values are populated
    if (title && recipientAddress && content && certificateRef.current && onImageGenerated) {
      // Small delay to ensure the DOM has fully rendered
      const timeoutId = setTimeout(() => {
        generateImage();
      }, 500); // Increased delay to ensure proper rendering
      
      return () => clearTimeout(timeoutId);
    }
  }, [title, recipientAddress, recipientName, content, date, onImageGenerated]);
  
  const generateImage = async () => {
    if (!certificateRef.current || !onImageGenerated) return;
    
    try {
      // Import html2canvas dynamically to keep bundle size small
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#ffffff',
        scale: 3, // Higher resolution for clarity
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
          // Ensure all fonts are loaded in the cloned document
          const clonedElement = clonedDoc.body.querySelector('.certificate-container');
          if (clonedElement) {
            clonedElement.classList.add('ready-for-capture');
            // Force styles to be fully applied
            Array.from(clonedDoc.fonts).forEach(font => {
              if (!font.loaded) {
                console.log('Waiting for font to load:', font.family);
              }
            });
          }
        }
      });
      
      const imageData = canvas.toDataURL('image/png');
      onImageGenerated(imageData);
    } catch (error) {
      console.error("Error generating certificate image:", error);
    }
  };
  
  return (
    <div className={cn("relative w-[650px] h-[500px]", className)}>
      <div 
        ref={certificateRef}
        className="certificate-container w-full h-full p-12 bg-white border-8 border-solana-purple/20 rounded-xl shadow-lg relative overflow-hidden"
      >
        {/* Certificate header */}
        <div className="absolute top-0 left-0 w-full h-16 bg-solana-purple/10"></div>
        
        {/* Solana logo watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <svg width="300" height="300" viewBox="0 0 128 114" xmlns="http://www.w3.org/2000/svg">
            <path d="M113.6 36.4H14.2c-1.8 0-3.4 1-4.3 2.6-.8 1.6-.7 3.4.2 4.9l14.7 21.4c.7 1.1 2 1.7 3.4 1.7h87c1.8 0 3.4-1 4.3-2.6.8-1.6.7-3.4-.2-4.9l-14.7-21.4c-.7-1.1-2-1.7-3.4-1.7h-1.4z" fill="#000000"/>
            <path d="M14.2 76.9h99.4c1.8 0 3.4-1 4.3-2.6.8-1.6.7-3.4-.2-4.9L103 48c-.7-1.1-2-1.7-3.4-1.7h-87c-1.8 0-3.4 1-4.3 2.6-.8 1.6-.7 3.4.2 4.9l14.7 21.4c.7 1.1 2 1.7 3.4 1.7h-12.4z" fill="#000000"/>
            <path d="M113.6 113.1H14.2c-1.8 0-3.4-1-4.3-2.6-.8-1.6-.7-3.4.2-4.9l14.7-21.4c.7-1.1 2-1.7 3.4-1.7h87c1.8 0 3.4 1 4.3 2.6.8 1.6.7 3.4-.2 4.9l-14.7 21.4c-.7 1.1-2 1.7-3.4 1.7h10.4z" fill="#000000"/>
            <path d="M14.2 0h99.4c1.8 0 3.4 1 4.3 2.6.8 1.6.7 3.4-.2 4.9L103 28.9c-.7 1.1-2 1.7-3.4-1.7h-87c-1.8 0-3.4-1-4.3-2.6-.8-1.6-.7-3.4.2-4.9L23.2 1.7c.7-1.1 2-1.7 3.4-1.7H14.2z" fill="#000000"/>
          </svg>
        </div>
        
        {/* Certificate content */}
        <div className="flex flex-col items-center justify-between h-full z-10 relative">
          <div className="text-center space-y-3 w-full">
            <h2 className="text-2xl font-bold text-gray-800">Certificate of Achievement</h2>
            <h1 className="text-3xl font-bold text-solana-purple">{title}</h1>
          </div>
          
          <div className="text-center space-y-6 my-8 w-full">
            <p className="text-lg">This certifies that</p>
            <p className="text-2xl font-bold">{recipientName || "Recipient"}</p>
            <p className="text-lg">has successfully completed the requirements</p>
            <div className="max-w-md mx-auto mt-2 text-center">
              <p className="text-gray-600">{content}</p>
            </div>
          </div>
          
          <div className="w-full flex justify-between items-end mb-4">
            <div>
              <p className="text-sm text-gray-500">Date Issued</p>
              <p className="font-medium">{date}</p>
            </div>
            
            {/* <div className="flex flex-col items-center">
              <div className="w-40 h-[2px] bg-black mb-2"></div>
              <p className="font-medium">Authorized Signature</p>
            </div> */}
            
            <div className="text-right">
              <p className="text-sm text-gray-500">Recipient Address</p>
              <p className="font-mono text-xs truncate max-w-[150px]">{recipientAddress}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateGenerator;
