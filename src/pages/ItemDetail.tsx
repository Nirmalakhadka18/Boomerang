import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Calendar, Package, ArrowLeft, MessageCircle } from "lucide-react";

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    if (id) fetchItem(id);
  }, [id]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }
  };

  const fetchItem = async (itemId: string) => {
    const { data } = await supabase
      .from("items")
      .select("*, profiles!user_id(full_name, email), categories(name)")
      .eq("id", itemId)
      .single();
    
    if (data) setItem(data);
    setLoading(false);
  };

  const handleContactOwner = () => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }
    navigate(`/chat/${item.id}/${item.user_id}`);
  };

  if (loading) return <div className="min-h-screen bg-background"><Header /><div className="container py-8">Loading...</div></div>;
  if (!item) return <div className="min-h-screen bg-background"><Header /><div className="container py-8">Item not found</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-8">
            {item.image_url && (
              <img src={item.image_url} alt={item.title} className="w-full max-h-96 object-cover rounded-lg mb-6" />
            )}
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{item.title}</h1>
              <Badge variant={item.type === "lost" ? "destructive" : "default"} className="text-lg px-4 py-2">
                {item.type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
            <p className="text-lg text-muted-foreground mb-6">{item.description}</p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {item.categories && (
                <div className="flex items-center">
                  <Package className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{item.categories.name}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{item.location}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(item.date_occurred).toLocaleDateString()}</p>
                </div>
              </div>
              {item.color && (
                <div>
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-medium">{item.color}</p>
                </div>
              )}
            </div>
            <div className="bg-muted/50 p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <p className="text-sm text-muted-foreground">Posted by: {item.profiles?.full_name || "Anonymous"}</p>
              <p className="text-sm text-muted-foreground mb-4">Email: {item.profiles?.email}</p>
              {currentUserId && currentUserId !== item.user_id && (
                <Button onClick={handleContactOwner} className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Owner
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
