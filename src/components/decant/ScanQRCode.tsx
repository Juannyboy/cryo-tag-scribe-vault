
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ScanQRCodeProps {
  onSearch: (id: string) => void;
}

export function ScanQRCode({ onSearch }: ScanQRCodeProps) {
  const [searchId, setSearchId] = useState("");

  const handleSearch = () => {
    if (searchId.trim()) {
      onSearch(searchId.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              onClick={handleSearch}
              className="w-full md:w-auto"
            >
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Note: In a real implementation, this would use the device camera to scan QR codes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
