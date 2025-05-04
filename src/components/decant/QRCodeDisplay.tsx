import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "@/components/QRCode";
import { DecanterRecord } from "@/types/decanter";

// Make sure to encode a full URL to the /record/:id page, not just the ID!
function getQRCodeValue(record: DecanterRecord): string {
  // Use the deployed URL instead of window.location.origin
  return `https://decanting.vercel.app/record/${record.id}`;
}

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
          <QRCodeCanvas id={`qr-display-${record.id}`} value={getQRCodeValue(record)} size={200} />
        </div>
        <p className="text-lg font-semibold mb-2">Decanting ID: {record.id}</p>
        <p className="text-sm text-muted-foreground mb-4 text-center">
          <span>
            Scan this code on any device to view/download the PDF for this record.
          </span>
        </p>
        <Button onClick={() => onGeneratePDF(record)}>Generate PDF Form</Button>
      </CardContent>
    </Card>
  );
}
