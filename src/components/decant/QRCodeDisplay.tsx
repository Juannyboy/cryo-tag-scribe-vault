
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "@/components/QRCode";
import { DecanterRecord } from "@/types/decanter";

interface QRCodeDisplayProps {
  record: DecanterRecord;
  onGeneratePDF: (record: DecanterRecord) => void;
}

export function QRCodeDisplay({ record, onGeneratePDF }: QRCodeDisplayProps) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Generated QR Code</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="mb-4 border p-4 bg-white">
          <QRCodeCanvas value={record.id} size={200} />
        </div>
        <p className="text-lg font-semibold mb-2">Decanting ID: {record.id}</p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          Scan this code to retrieve the record
        </p>
        <Button onClick={() => onGeneratePDF(record)}>Generate PDF Form</Button>
      </CardContent>
    </Card>
  );
}
