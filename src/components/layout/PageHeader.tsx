
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function PageHeader() {
  const navigate = useNavigate();

  return (
    <div className="text-center mb-6 md:mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Liquid Nitrogen Decanting System</h1>
        <Button onClick={() => navigate('/history')} variant="outline">
          <History className="mr-2 h-4 w-4" />
          History
        </Button>
      </div>
      <p className="text-sm md:text-base text-muted-foreground">
        Track and generate QR codes for liquid nitrogen decanting
      </p>
    </div>
  );
}
