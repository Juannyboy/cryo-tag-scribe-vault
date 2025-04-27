
import { useState } from "react";
import { QrReader } from "react-qr-reader";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generatePDF } from "@/lib/pdf-generator";
import { DecanterRecord } from "@/types/decanter";

export function LiveQRCodeScanner() {
  const { toast } = useToast();
  const [scanned, setScanned] = useState(false);

  const handleScan = async (data: string | null) => {
    if (!data || scanned) return;

    setScanned(true); // Prevent multiple scans

    // Check if the scanned data is a URL containing a record ID
    let recordId: string;
    
    try {
      // Try to extract ID from URL if it's a URL
      if (data.includes('/record/')) {
        const url = new URL(data);
        const pathSegments = url.pathname.split('/');
        recordId = pathSegments[pathSegments.length - 1];
      } else {
        // Otherwise use the data directly as ID
        recordId = data.trim();
      }
      
      const { data: record, error } = await supabase
        .from("decanter_records")
        .select()
        .eq("id", recordId)
        .single();

      if (error || !record) {
        toast({
          title: "Record Not Found",
          description: `No record found with ID: ${recordId}`,
          variant: "destructive",
        });
        setScanned(false); // allow retry
        return;
      }

      const transformedRecord: DecanterRecord = {
        id: record.id,
        date: record.date,
        requester: record.requester,
        department: record.department,
        purchaseOrder: record.purchase_order,
        amount: record.amount,
        representative: record.representative,
        requesterRepresentative: record.requester_representative
      };

      generatePDF(transformedRecord);
      toast({
        title: "PDF Generated",
        description: `PDF for ID: ${recordId} has been downloaded.`,
      });
    } catch (error) {
      console.error("QR scan error:", error);
      toast({
        title: "Scan Error",
        description: "Could not process the QR code. Please try again.",
        variant: "destructive",
      });
    }

    // Optional: reset scanning after delay
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-center">Scan QR Code to Generate PDF</h2>
      <div className="rounded-lg overflow-hidden border w-full max-w-md mx-auto">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={(result, error) => {
            if (result) {
              handleScan(result.getText());
            }
            if (error) {
              console.error(error);
            }
          }}
          scanDelay={500}
          videoContainerStyle={{ width: '100%', height: 'auto' }}
          videoStyle={{ width: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}
