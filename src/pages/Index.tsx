import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DecantForm } from "@/components/decant/DecantForm";
import { QRCodeDisplay } from "@/components/decant/QRCodeDisplay";
import { RecordsList } from "@/components/decant/RecordsList";
import { ScanQRCode } from "@/components/decant/ScanQRCode";
import { DecanterRecord } from "@/types/decanter";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [records, setRecords] = useState<DecanterRecord[]>(() => {
    const saved = localStorage.getItem("decanterRecords");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeRecord, setActiveRecord] = useState<DecanterRecord | null>(null);
  const [lastId, setLastId] = useState(() => {
    const saved = localStorage.getItem("lastDecanterID");
    return saved ? parseInt(saved) : 1000;
  });

  useEffect(() => {
    localStorage.setItem("decanterRecords", JSON.stringify(records));
  }, [records]);

  const generateDecanterId = () => {
    const nextId = lastId + 1;
    setLastId(nextId);
    localStorage.setItem("lastDecanterID", nextId.toString());
    return `LN2${nextId}`;
  };

  const handleSubmit = (formData: Omit<DecanterRecord, "id" | "date">) => {
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]}-${String(currentDate.getFullYear()).slice(2)}`;
    
    const newRecord: DecanterRecord = {
      id: generateDecanterId(),
      date: formattedDate,
      ...formData,
      purchaseOrder: formData.purchaseOrder || "0000-000000",
    };
    
    setRecords(prev => [newRecord, ...prev]);
    setActiveRecord(newRecord);
  };

  const withScanDate = (record: DecanterRecord, scanDateStr: string): DecanterRecord => ({
    ...record,
    date: scanDateStr,
  });

  const handleGeneratePDF = (record: DecanterRecord) => {
    import("@/lib/pdf-generator").then(module => {
      module.generatePDF(record);
    }).catch(error => {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    });
  };

  const handleSearch = (id: string) => {
    const foundRecord = records.find(record => record.id === id);
    if (foundRecord) {
      setActiveRecord(foundRecord);
      toast({
        title: "Record Found",
        description: `Found record for ID: ${id}`,
      });

      navigate(`/record/${foundRecord.id}`);
    } else {
      toast({
        title: "Record Not Found",
        description: `No record found with ID: ${id}`,
        variant: "destructive",
      });
    }
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
