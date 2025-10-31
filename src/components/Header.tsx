import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, LogOut, User, Menu, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Boomerang" className="h-10 w-auto" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Boomerang
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/browse" className="text-sm font-medium hover:text-primary transition-colors">
            Browse Items
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
                My Items
              </Link>
              <Link to="/conversations" className="text-sm font-medium hover:text-primary transition-colors">
                <MessageCircle className="h-5 w-5" />
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/conversations")}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Messages
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")} variant="outline">
              Login
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-6">
              <Link to="/browse" className="text-lg font-medium hover:text-primary transition-colors">
                Browse Items
              </Link>
              {user ? (
                <>
                  <Link to="/dashboard" className="text-lg font-medium hover:text-primary transition-colors">
                    My Items
                  </Link>
                  <Link to="/conversations" className="text-lg font-medium hover:text-primary transition-colors flex items-center">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Messages
                  </Link>
                  <Button onClick={handleLogout} variant="outline" className="justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")} variant="outline">
                  Login
                </Button>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
