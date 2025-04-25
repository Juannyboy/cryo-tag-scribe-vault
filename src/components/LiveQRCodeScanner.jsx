import { useState } from "react";
import QrReader from "react-qr-reader";
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

    const { data: record, error } = await supabase
      .from("decanter_records")
      .select()
      .eq("id", data.trim())
      .single();

    if (error || !record) {
      toast({
        title: "Record Not Found",
        description: `No record found with ID: ${data}`,
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
      description: `PDF for ID: ${data} has been downloaded.`,
    });

    // Optional: reset scanning after delay
    setTimeout(() => setScanned(false), 3000);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-center">Scan QR Code to Generate PDF</h2>
      <div className="rounded-lg overflow-hidden border w-full max-w-md mx-auto">
        <QrReader
          delay={500}
          onError={(err) => console.error(err)}
          onScan={handleScan}
          style={{ width: "100%" }}
        />
      </div>
    </div>
  );
}