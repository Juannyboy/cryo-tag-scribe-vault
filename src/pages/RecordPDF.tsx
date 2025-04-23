import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DecanterRecord } from "@/types/decanter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "@/components/QRCode";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RecordPDF() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [record, setRecord] = useState<DecanterRecord | null>(null);

  // Fetch record from Supabase
  useEffect(() => {
    if (!id) return;
    
    const fetchRecord = async () => {
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
        return;
      }
      
      setRecord(data);
    };

    fetchRecord();
  }, [id, toast]);

  const scanDate = (() => {
    const d = new Date();
    return `${d.getDate()}-${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]}-${String(d.getFullYear()).slice(2)}`;
  })();

  const handlePDF = () => {
    if (!record) return;
    import("@/lib/pdf-generator").then(mod => {
      mod.generatePDF(record);
      toast({
        title: "PDF Downloaded",
        description: `PDF for ${record.id} generated with scan date ${scanDate}.`,
      });
    });
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

  if (!record)
    return (
      <div className="p-8">
        <p>No record found for id: {id}</p>
      </div>
    );

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
          <QRCodeCanvas value={window.location.href} size={140} />
          <div className="w-full text-left text-sm">
            <div className="mb-2"><b>Decanting ID:</b> {record.id}</div>
            <div className="mb-2"><b>Requester:</b> {record.requester}</div>
            <div className="mb-2"><b>Department:</b> {record.department}</div>
            <div className="mb-2"><b>Purchase Order:</b> {record.purchaseOrder}</div>
            <div className="mb-2"><b>Amount:</b> {record.amount}</div>
            <div className="mb-2"><b>Original Date:</b> {record.date}</div>
            <div className="mb-2"><b>PDF Scan Date:</b> {scanDate}</div>
          </div>
          <Button onClick={handlePDF}>Download PDF with Scan Date</Button>
        </CardContent>
      </Card>
    </div>
  );
}
