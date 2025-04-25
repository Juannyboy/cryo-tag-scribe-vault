import { LiveQRCodeScanner } from "./LiveQRCodeScanner";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecantForm } from "./DecantForm";
import { QRCodeDisplay } from "./QRCodeDisplay";
import { RecordsList } from "./RecordsList";
import { ScanQRCode } from "./ScanQRCode";
import { DecanterRecord } from "@/types/decanter";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function TabsContainer() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [records, setRecords] = useState<DecanterRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<DecanterRecord | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from('decanter_records')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error Loading Records",
        description: "There was an error loading the records.",
        variant: "destructive",
      });
      return;
    }

    if (data) {
      // Transform the data to match our DecanterRecord type
      const transformedRecords: DecanterRecord[] = data.map(item => ({
        id: item.id,
        date: item.date,
        requester: item.requester,
        department: item.department,
        purchaseOrder: item.purchase_order,
        amount: item.amount,
        representative: item.representative,
        requesterRepresentative: item.requester_representative
      }));
      
      setRecords(transformedRecords);
    }
  };

  const handleSubmit = async (formData: Omit<DecanterRecord, "date"> & { date: string }) => {
    const newRecord: DecanterRecord = {
      ...formData,
      date: formData.date,
      purchaseOrder: formData.purchaseOrder || "0000-000000",
    };
    
    if (records.some(record => record.id === newRecord.id)) {
      toast({
        title: "ID Already Exists",
        description: "Please choose a different Decanting ID.",
        variant: "destructive",
      });
      return;
    }

    // Transform the record to match the database structure
    const dbRecord = {
      id: newRecord.id,
      date: newRecord.date,
      requester: newRecord.requester,
      department: newRecord.department,
      purchase_order: newRecord.purchaseOrder,
      amount: newRecord.amount,
      representative: newRecord.representative,
      requester_representative: newRecord.requesterRepresentative
    };

    const { error } = await supabase
      .from('decanter_records')
      .insert(dbRecord);

    if (error) {
      console.error('Error inserting record:', error);
      toast({
        title: "Error Saving Record",
        description: "There was an error saving the record.",
        variant: "destructive",
      });
      return;
    }

    await fetchRecords();
    setActiveRecord(newRecord);
    toast({
      title: "Record Created",
      description: "New decanting record has been created successfully.",
    });
  };

  const handleGeneratePDF = (record: DecanterRecord) => {
    import("@/lib/pdf-generator").then(module => {
      module.generatePDF(record);
    }).catch(error => {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error Generating PDF",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive",
      });
    });
  };

  const handleSearch = async (id: string) => {
    const { data, error } = await supabase
      .from('decanter_records')
      .select()
      .eq('id', id)
      .single();

    if (error || !data) {
      toast({
        title: "Record Not Found",
        description: `No record found with ID: ${id}`,
        variant: "destructive",
      });
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

    setActiveRecord(transformedRecord);
    toast({
      title: "Record Found",
      description: `Found record for ID: ${id}`,
    });
    navigate(`/record/${data.id}`);
  };

  return (
    <Tabs defaultValue="new" className="max-w-4xl mx-auto">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6 md:mb-8">
        <TabsTrigger value="new">New Decant Record</TabsTrigger>
        <TabsTrigger value="records">View Records</TabsTrigger>
        <TabsTrigger value="scan">Scan QR</TabsTrigger>
      </TabsList>

      <TabsContent value="new">
        <DecantForm onSubmit={handleSubmit} />
        {activeRecord && (
          <QRCodeDisplay 
            record={activeRecord} 
            onGeneratePDF={handleGeneratePDF} 
          />
        )}
      </TabsContent>

      <TabsContent value="records">
        <RecordsList 
          records={records}
          onViewQRCode={setActiveRecord}
          onGeneratePDF={handleGeneratePDF}
        />
      </TabsContent>

      <TabsContent value="scan">
        <LiveQRCodeScanner />
      </TabsContent>
    </Tabs>
  );
}
