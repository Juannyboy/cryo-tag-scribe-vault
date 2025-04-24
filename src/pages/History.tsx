
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordsList } from "@/components/decant/RecordsList";
import { DecanterRecord } from "@/types/decanter";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function History() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeRecords, setActiveRecords] = useState<DecanterRecord[]>([]);
  const [deletedRecords, setDeletedRecords] = useState<DecanterRecord[]>([]);

  const handleViewQRCode = (record: DecanterRecord) => {
    navigate(`/record/${record.id}`);
  };

  const handleGeneratePDF = async (record: DecanterRecord) => {
    import("@/lib/pdf-generator").then(module => {
      module.generatePDF(record);
    });
  };

  const restoreRecord = async (record: DecanterRecord) => {
    const { error } = await supabase
      .from('decanter_records')
      .update({ deleted: false, deleted_at: null })
      .eq('id', record.id);

    if (error) {
      toast({
        title: "Error Restoring Record",
        description: "There was an error restoring the record.",
        variant: "destructive"
      });
      return;
    }

    // Update local state
    setDeletedRecords(prev => prev.filter(r => r.id !== record.id));
    setActiveRecords(prev => [...prev, record]);

    toast({
      title: "Record Restored",
      description: "The record has been restored successfully."
    });
  };

  // Fetch records on mount and when tabs change
  const fetchRecords = async (deleted: boolean) => {
    const { data, error } = await supabase
      .from('decanter_records')
      .select('*')
      .eq('deleted', deleted)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Error Loading Records",
        description: "There was an error loading the records.",
        variant: "destructive"
      });
      return;
    }

    if (data) {
      const records: DecanterRecord[] = data.map(item => ({
        id: item.id,
        date: item.date,
        requester: item.requester,
        department: item.department,
        purchaseOrder: item.purchase_order,
        amount: item.amount,
        representative: item.representative,
        requesterRepresentative: item.requester_representative
      }));

      if (deleted) {
        setDeletedRecords(records);
      } else {
        setActiveRecords(records);
      }
    }
  };

  // Initial load
  useState(() => {
    fetchRecords(false);
    fetchRecords(true);
  });

  return (
    <div className="container mx-auto py-4 px-4 md:py-8 md:px-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/")}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Records History</h1>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Records</TabsTrigger>
          <TabsTrigger value="deleted">Bin</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <RecordsList
            records={activeRecords}
            onViewQRCode={handleViewQRCode}
            onGeneratePDF={handleGeneratePDF}
            showDeleteButton
          />
        </TabsContent>

        <TabsContent value="deleted">
          <RecordsList
            records={deletedRecords}
            onViewQRCode={handleViewQRCode}
            onGeneratePDF={handleGeneratePDF}
            showRestoreButton
            onRestore={restoreRecord}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
