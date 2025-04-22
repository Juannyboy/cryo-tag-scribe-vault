
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DecanterRecord } from "@/types/decanter";

interface RecordsListProps {
  records: DecanterRecord[];
  onViewQRCode: (record: DecanterRecord) => void;
  onGeneratePDF: (record: DecanterRecord) => void;
}

export function RecordsList({ records, onViewQRCode, onGeneratePDF }: RecordsListProps) {
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
