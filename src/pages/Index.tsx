import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecantForm } from "@/components/decant/DecantForm";
import { QRCodeDisplay } from "@/components/decant/QRCodeDisplay";
import { RecordsList } from "@/components/decant/RecordsList";
import { ScanQRCode } from "@/components/decant/ScanQRCode";
import { DecanterRecord } from "@/types/decanter";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
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

    if (data) setRecords(data);
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

    const { error } = await supabase
      .from('decanter_records')
      .insert(newRecord);

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

    setActiveRecord(data);
    toast({
      title: "Record Found",
      description: `Found record for ID: ${id}`,
    });
    navigate(`/record/${data.id}`);
  };

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Liquid Nitrogen Decanting System</h1>
        <p className="text-sm md:text-base text-muted-foreground">Track and generate QR codes for liquid nitrogen decanting</p>
      </div>

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
          <ScanQRCode onSearch={handleSearch} />
          {activeRecord && (
            <QRCodeDisplay 
              record={activeRecord} 
              onGeneratePDF={handleGeneratePDF} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
