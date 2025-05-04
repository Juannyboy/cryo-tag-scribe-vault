import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DecanterRecord } from "@/types/decanter";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "@/components/QRCode";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileText, QrCode } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function RecordPDF() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DecanterRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch record from Supabase
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    
    const fetchRecord = async () => {
      try {
        const { data, error } = await supabase
          .from('decanter_records')
          .select()
          .eq('id', id)
          .single();
        
        if (error || !data) {
          toast({
            title: "Record Not Found",
            description: "Could not find the requested record.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        
        // Transform the data to match our DecanterRecord type
        const transformedRecord: DecanterRecord = {
          id: data.id,
          date: data.date,
          requester: data.requester,
          department: data.department,
          purchaseOrder: data.purchase_order,
          amount: data.amount,
          representative: data.representative,
          requesterRepresentative: data.requester_representative
        };
        
        setRecord(transformedRecord);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching record:", error);
        toast({
          title: "Error",
          description: "There was an error fetching the record.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchRecord();
  }, [id, toast]);

  const scanDate = (() => {
    const d = new Date();
    return `${d.getDate()}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
  })();

  const handleGeneratePDF = () => {
    if (!record) return;
    
    import("@/lib/pdf-generator").then(mod => {
      mod.generatePDF(record);
      toast({
        title: "PDF Downloaded",
        description: `PDF for ${record.id} generated with scan date ${scanDate}.`,
      });
    });
  };
  
  const handleGenerateQRPDF = () => {
    if (!record) return;
    
    // Add a small delay to ensure QR code is rendered
    setTimeout(() => {
      import("@/lib/pdf-generator").then(mod => {
        mod.generateQROnlyPDF(record);
        toast({
          title: "QR Code PDF Downloaded",
          description: `QR Code PDF for ${record.id} generated successfully.`,
        });
      });
    }, 300);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  if (!id)
    return (
      <div className="p-8">
        <p>No record specified.</p>
      </div>
    );

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <p>Loading record information...</p>
      </div>
    );

  if (!record)
    return (
      <div className="p-8">
        <p>No record found for id: {id}</p>
      </div>
    );

  // Use the deployed URL for the QR code value
  const qrCodeValue = `https://decanting.vercel.app/record/${id}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 relative">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4"
        onClick={handleGoBack}
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Liquid Nitrogen Decant Record</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="border p-4 bg-white">
            <QRCodeCanvas id={`record-qr-${record.id}`} value={qrCodeValue} size={200} />
          </div>
          <div className="w-full text-left text-sm">
      <div className="mb-2">
        <b>Decanting ID:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.id}
          onChange={(e) => handleChange("id", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>Requester:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.requester}
          onChange={(e) => handleChange("requester", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>Department:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.department}
          onChange={(e) => handleChange("department", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>Purchase Order:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.purchaseOrder}
          onChange={(e) => handleChange("purchaseOrder", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>Amount:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.amount}
          onChange={(e) => handleChange("amount", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>Original Date:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.date}
          onChange={(e) => handleChange("date", e.target.value)}
        />
      </div>
      <div className="mb-2">
        <b>PDF Scan Date:</b>{" "}
        <input
          className="border px-2 py-1 rounded w-full"
          value={editableRecord.scanDate}
          onChange={(e) => handleChange("scanDate", e.target.value)}
        />
      </div>
    </div>
        </CardContent>
        <CardFooter className="flex gap-2 justify-center">
          <Button onClick={handleGenerateQRPDF} variant="outline">
            <QrCode className="mr-2 h-4 w-4" /> Download QR Code
          </Button>
          <Button onClick={handleGeneratePDF}>
            <FileText className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
