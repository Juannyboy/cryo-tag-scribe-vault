
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DecanterRecord } from "@/types/decanter";

interface DecantFormProps {
  onSubmit: (record: Omit<DecanterRecord, "id" | "date">) => void;
}

export function DecantForm({ onSubmit }: DecantFormProps) {
  const [formData, setFormData] = useState({
    requester: "",
    department: "",
    purchaseOrder: "",
    amount: "",
    representative: "Tiaan van der Merwe",
    requesterRepresentative: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: formData.amount + "KG",
    });
    
    setFormData({
      requester: "",
      department: "",
      purchaseOrder: "",
      amount: "",
      representative: "Tiaan van der Merwe",
      requesterRepresentative: "",
    });
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
