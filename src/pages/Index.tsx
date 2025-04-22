import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QRCodeCanvas } from "@/components/QRCode";

interface DecanterRecord {
  id: string;
  date: string;
  requester: string;
  department: string;
  purchaseOrder: string;
  amount: string;
  representative: string;
  requesterRepresentative: string;
}

const Index = () => {
  const [records, setRecords] = useState<DecanterRecord[]>(() => {
    const saved = localStorage.getItem("decanterRecords");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [activeRecord, setActiveRecord] = useState<DecanterRecord | null>(null);
  const [formData, setFormData] = useState({
    requester: "",
    department: "",
    purchaseOrder: "",
    amount: "",
    representative: "Tiaan van der Merwe",
    requesterRepresentative: "",
  });
  
  const [lastId, setLastId] = useState(() => {
    const saved = localStorage.getItem("lastDecanterID");
    return saved ? parseInt(saved) : 1000;
  });

  const generateDecanterId = () => {
    const nextId = lastId + 1;
    setLastId(nextId);
    localStorage.setItem("lastDecanterID", nextId.toString());
    return `LN2${nextId}`;
  };

  useEffect(() => {
    localStorage.setItem("decanterRecords", JSON.stringify(records));
  }, [records]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}-${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()]}-${String(currentDate.getFullYear()).slice(2)}`;
    
    const newRecord: DecanterRecord = {
      id: generateDecanterId(),
      date: formattedDate,
      requester: formData.requester,
      department: formData.department,
      purchaseOrder: formData.purchaseOrder || "0000-000000",
      amount: formData.amount + "KG",
      representative: formData.representative,
      requesterRepresentative: formData.requesterRepresentative
    };
    
    setRecords(prev => [newRecord, ...prev]);
    setActiveRecord(newRecord);
    
    setFormData({
      requester: "",
      department: "",
      purchaseOrder: "",
      amount: "",
      representative: "Tiaan van der Merwe",
      requesterRepresentative: "",
    });
  };

  const handleGeneratePDF = (record: DecanterRecord) => {
    import("@/lib/pdf-generator").then(module => {
      module.generatePDF(record);
    }).catch(error => {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value) return;
    
    const found = records.find(record => record.id === value);
    if (found) {
      setActiveRecord(found);
    } else {
      alert("No record found with that ID");
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
          <Card>
            <CardHeader>
              <CardTitle>Create New Decanting Record</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="requester">Requester Name</Label>
                    <Input 
                      id="requester" 
                      name="requester" 
                      value={formData.requester} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input 
                      id="department" 
                      name="department" 
                      value={formData.department} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchaseOrder">Purchase Order Number (optional)</Label>
                    <Input 
                      id="purchaseOrder" 
                      name="purchaseOrder" 
                      value={formData.purchaseOrder} 
                      onChange={handleInputChange} 
                      placeholder="0000-000000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KG)</Label>
                    <Input 
                      id="amount" 
                      name="amount" 
                      value={formData.amount} 
                      onChange={handleInputChange} 
                      type="number"
                      min="1"
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="representative">FARMOVS Representative</Label>
                    <Input 
                      id="representative" 
                      name="representative" 
                      value={formData.representative} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requesterRepresentative">Requester Representative</Label>
                    <Input 
                      id="requesterRepresentative" 
                      name="requesterRepresentative" 
                      value={formData.requesterRepresentative} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full md:w-auto">Create Record & Generate QR Code</Button>
              </form>
            </CardContent>
          </Card>
          
          {activeRecord && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Generated QR Code</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="mb-4 border p-4 bg-white">
                  <QRCodeCanvas value={activeRecord.id} size={200} />
                </div>
                <p className="text-lg font-semibold mb-2">Decanting ID: {activeRecord.id}</p>
                <p className="text-sm text-muted-foreground mb-4 text-center">Scan this code to retrieve the record</p>
                <Button onClick={() => handleGeneratePDF(activeRecord)}>Generate PDF Form</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Decanting Records</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] md:h-[500px]">
                {records.length > 0 ? (
                  <div className="space-y-4">
                    {records.map((record) => (
                      <Card key={record.id} className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold">ID: {record.id}</h3>
                            <p className="text-sm text-muted-foreground">Date: {record.date}</p>
                            <p className="text-sm">Requester: {record.requester} ({record.department})</p>
                            <p className="text-sm">Amount: {record.amount}</p>
                          </div>
                          <div className="flex flex-col gap-2 w-full md:w-auto">
                            <Button onClick={() => setActiveRecord(record)} size="sm" className="w-full md:w-auto">
                              View QR Code
                            </Button>
                            <Button onClick={() => handleGeneratePDF(record)} variant="outline" size="sm" className="w-full md:w-auto">
                              Generate PDF
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">No records found</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scan">
          <Card>
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">To simulate scanning, enter the Decanting ID directly:</p>
                <div className="flex flex-col md:flex-row gap-2">
                  <Input 
                    className="flex-1"
                    placeholder="Enter Decanting ID (e.g. LN21122)"
                    onChange={handleSearch} 
                  />
                  <Button variant="outline" className="w-full md:w-auto">Search</Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Note: In a real implementation, this would use the device camera to scan QR codes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
