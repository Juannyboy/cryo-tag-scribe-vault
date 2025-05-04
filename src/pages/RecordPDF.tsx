import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DecanterRecord } from "@/types/decanter";
import {
  Card, CardContent, CardHeader, CardTitle, CardFooter
} from "@/components/ui/card";
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
  const [editableRecord, setEditableRecord] = useState<DecanterRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch record
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    const fetchRecord = async () => {
      try {
        const { data, error } = await supabase
          .from("decanter_records")
          .select()
          .eq("id", id)
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

        const transformed: DecanterRecord = {
          id: data.id,
          date: data.date,
          requester: data.requester,
          department: data.department,
          purchaseOrder: data.purchase_order,
          amount: data.amount,
          representative: data.representative,
          requesterRepresentative: data.requester_representative,
        };

        setRecord(transformed);
        setEditableRecord(transformed);
        setIsLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
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

  const handleChange = (key: keyof DecanterRecord, value: string) => {
    setEditableRecord(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSaveChanges = async () => {
    if (!editableRecord) return;

    const { error } = await supabase
      .from("decanter_records")
      .update({
        id: editableRecord.id,
        date: editableRecord.date,
        requester: editableRecord.requester,
        department: editableRecord.department,
        purchase_order: editableRecord.purchaseOrder,
        amount: editableRecord.amount,
        representative: editableRecord.representative,
        requester_representative: editableRecord.requesterRepresentative,
      })
      .eq("id", record?.id);

    if (error) {
      toast({
        title: "Update Failed",
        description: "There was an error saving changes.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Changes Saved",
        description: `Record ${editableRecord.id} updated successfully.`,
      });
      setRecord(editableRecord);
    }
  };

  const handleGeneratePDF = () => {
    if (!editableRecord) return;

    import("@/lib/pdf-generator").then(mod => {
      mod.generatePDF(editableRecord);
      toast({
        title: "PDF Downloaded",
        description: `PDF for ${editableRecord.id} generated with scan date ${scanDate}.`,
      });
    });
  };

  const handleGenerateQRPDF = () => {
    if (!editableRecord) return;

    setTimeout(() => {
      import("@/lib/pdf-generator").then(mod => {
        mod.generateQROnlyPDF(editableRecord);
        toast({
          title: "QR Code PDF Downloaded",
          description: `QR Code PDF for ${editableRecord.id} generated.`,
        });
      });
    }, 300);
  };

  const handleGoBack = () => navigate("/");

  if (!id)
    return <div className="p-8"><p>No record specified.</p></div>;

  if (isLoading)
    return <div className="p-8 flex justify-center"><p>Loading...</p></div>;

  if (!editableRecord)
    return <div className="p-8"><p>No record found for id: {id}</p></div>;

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
            <QRCodeCanvas id={`record-qr-${editableRecord.id}`} value={qrCodeValue} size={200} />
          </div>

          <div className="w-full text-left text-sm">
            {[
              ["Decanting ID", "id"],
              ["Requester", "requester"],
              ["Department", "department"],
              ["Purchase Order", "purchaseOrder"],
              ["Amount", "amount"],
              ["Original Date", "date"]
            ].map(([label, key]) => (
              <div className="mb-2" key={key}>
                <b>{label}:</b>{" "}
                <input
                  className="border px-2 py-1 rounded w-full"
                  value={editableRecord[key as keyof DecanterRecord] || ""}
                  onChange={(e) =>
                    handleChange(key as keyof DecanterRecord, e.target.value)
                  }
                />
              </div>
            ))}

            <div className="mb-2">
              <b>PDF Scan Date:</b>{" "}
              <input
                className="border px-2 py-1 rounded w-full bg-gray-100"
                value={scanDate}
                readOnly
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-center">
          <Button onClick={handleSaveChanges} variant="secondary">
            💾 Save Changes
          </Button>
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
