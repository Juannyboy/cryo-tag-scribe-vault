
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ScanQRCodeProps {
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ScanQRCode({ onSearch }: ScanQRCodeProps) {
  return (
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
              onChange={onSearch} 
            />
            <Button variant="outline" className="w-full md:w-auto">Search</Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Note: In a real implementation, this would use the device camera to scan QR codes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
