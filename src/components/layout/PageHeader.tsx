
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, LogIn } from "lucide-react";
import { User } from "@supabase/supabase-js";

export function PageHeader() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="text-center mb-6 md:mb-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold">Liquid Nitrogen Decanting System</h1>
        <div className="flex gap-2">
          {user ? (
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button onClick={() => navigate('/auth')} variant="outline">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
          <Button onClick={() => navigate('/history')} variant="outline">
            <History className="mr-2 h-4 w-4" />
            History
          </Button>
        </div>
      </div>
      <p className="text-sm md:text-base text-muted-foreground">
        Track and generate QR codes for liquid nitrogen decanting
      </p>
    </div>
  );
}
