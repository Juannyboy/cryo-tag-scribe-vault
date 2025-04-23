
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DecanterRecord } from "@/types/decanter";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DecantFormProps {
  onSubmit: (record: Omit<DecanterRecord, "date"> & { date: string }) => void;
}

export function DecantForm({ onSubmit }: DecantFormProps) {
  const [formData, setFormData] = useState({
    id: `LN2${new Date().getTime().toString().slice(-4)}`,
    requester: "",
    department: "",
    purchaseOrder: "",
    amount: "",
    representative: "Tiaan van der Merwe",
    requesterRepresentative: "",
  });

  const [decantDate, setDecantDate] = useState<Date | undefined>(new Date());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format the date
    const formattedDate = decantDate 
      ? `${decantDate.getDate()}-${['Jan','Feb','Mar','Apr','May','Jun', 'Jul','Aug','Sep','Oct','Nov','Dec'][decantDate.getMonth()]}-${String(decantDate.getFullYear()).slice(2)}`
      : format(new Date(), "dd-MMM-yy");
    
    onSubmit({
      ...formData,
      amount: formData.amount + "KG",
      date: formattedDate
    });
    
    setFormData({
      id: `LN2${new Date().getTime().toString().slice(-4)}`,
      requester: "",
      department: "",
      purchaseOrder: "",
      amount: "",
      representative: "Tiaan van der Merwe",
      requesterRepresentative: "",
    });
    setDecantDate(new Date());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Decanting Record</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Decanting ID</Label>
              <Input 
                id="id" 
                name="id" 
                value={formData.id} 
                onChange={handleInputChange} 
                required 
                placeholder="e.g., LN21001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="decantDate">Date of Decanting</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="decantDate"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !decantDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {decantDate ? format(decantDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={decantDate}
                    onSelect={setDecantDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

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
  );
}
