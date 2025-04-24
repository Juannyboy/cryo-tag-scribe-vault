
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DecanterRecord } from "@/types/decanter";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Trash2, History } from "lucide-react";

interface RecordsListProps {
  records: DecanterRecord[];
  onViewQRCode: (record: DecanterRecord) => void;
  onGeneratePDF: (record: DecanterRecord) => void;
  showDeleteButton?: boolean;
  showRestoreButton?: boolean;
  onRestore?: (record: DecanterRecord) => void;
}

export function RecordsList({ 
  records, 
  onViewQRCode, 
  onGeneratePDF,
  showDeleteButton,
  showRestoreButton,
  onRestore 
}: RecordsListProps) {
  const { toast } = useToast();

  const handleDelete = async (record: DecanterRecord, permanent: boolean = false) => {
    try {
      if (permanent) {
        // Permanently delete the record
        const { error } = await supabase
          .from('decanter_records')
          .delete()
          .eq('id', record.id);

        if (error) throw error;

        toast({
          title: "Record Deleted",
          description: "The record has been permanently deleted."
        });
      } else {
        // Soft delete (move to bin)
        const { error } = await supabase
          .from('decanter_records')
          .update({ deleted: true, deleted_at: new Date().toISOString() })
          .eq('id', record.id);

        if (error) throw error;

        toast({
          title: "Record Moved to Bin",
          description: "The record has been moved to the bin."
        });
      }

      // Refresh the page to update the list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
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
                      <Button onClick={() => onViewQRCode(record)} size="sm" className="w-full md:w-auto">
                        View QR Code
                      </Button>
                      <Button onClick={() => onGeneratePDF(record)} variant="outline" size="sm" className="w-full md:w-auto">
                        Generate PDF
                      </Button>
                      {showDeleteButton && (
                        <Button 
                          onClick={() => handleDelete(record)} 
                          variant="destructive" 
                          size="sm"
                          className="w-full md:w-auto"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Move to Bin
                        </Button>
                      )}
                      {showRestoreButton && (
                        <>
                          <Button 
                            onClick={() => onRestore && onRestore(record)} 
                            variant="outline" 
                            size="sm"
                            className="w-full md:w-auto"
                          >
                            <History className="mr-2 h-4 w-4" />
                            Restore
                          </Button>
                          <Button 
                            onClick={() => handleDelete(record, true)} 
                            variant="destructive" 
                            size="sm"
                            className="w-full md:w-auto"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Permanently
                          </Button>
                        </>
                      )}
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
  );
}
