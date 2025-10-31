import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Package, MapPin, Calendar, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    fetchUserItems(session.user.id);
  };

  const fetchUserItems = async (userId: string) => {
    const { data } = await supabase
      .from("items")
      .select("*, categories(name)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    
    if (data) setItems(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
    } else {
      toast({ title: "Item deleted successfully" });
      setItems(items.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">My Items</h1>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl mb-4">No items posted yet</p>
              <Button onClick={() => navigate("/report-lost")}>Report Lost Item</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="hover:shadow-[var(--shadow-medium)] transition-all">
                <CardContent className="p-6">
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} className="w-full h-48 object-cover rounded-lg mb-4" />
                  )}
                  <div className="flex justify-between mb-3">
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <Badge variant={item.type === "lost" ? "destructive" : "default"}>{item.type}</Badge>
                  </div>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      {item.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(item.date_occurred).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => navigate(`/item/${item.id}`)} variant="outline" className="flex-1">
                      View
                    </Button>
                    <Button onClick={() => handleDelete(item.id)} variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
