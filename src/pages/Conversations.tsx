import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Conversation {
  itemId: string;
  itemTitle: string;
  itemType: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export default function Conversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(session.user.id);
    await fetchConversations(session.user.id);
  };

  const fetchConversations = async (userId: string) => {
    // Get all messages where user is sender or receiver
    const { data: messagesData } = await supabase
      .from("messages")
      .select(`
        *,
        items!inner(id, title, type, user_id),
        sender:profiles!sender_id(full_name),
        receiver:profiles!receiver_id(full_name)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (!messagesData) {
      setLoading(false);
      return;
    }

    // Group messages by item and other user
    const conversationMap = new Map<string, Conversation>();

    messagesData.forEach((msg: any) => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      const key = `${msg.item_id}-${otherUserId}`;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          itemId: msg.item_id,
          itemTitle: msg.items.title,
          itemType: msg.items.type,
          otherUserId,
          otherUserName: msg.sender_id === userId 
            ? (msg.receiver?.full_name || "User")
            : (msg.sender?.full_name || "User"),
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: msg.sender_id !== userId && !msg.read ? 1 : 0,
        });
      } else {
        const conv = conversationMap.get(key)!;
        if (msg.sender_id !== userId && !msg.read) {
          conv.unreadCount++;
        }
      }
    });

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Conversations</h1>
        {loading ? (
          <p>Loading...</p>
        ) : conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-xl mb-2">No conversations yet</p>
              <p className="text-muted-foreground mb-4">
                Start chatting with people about their lost or found items
              </p>
              <Button onClick={() => navigate("/browse")}>Browse Items</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv) => (
              <Card
                key={`${conv.itemId}-${conv.otherUserId}`}
                className="hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/chat/${conv.itemId}/${conv.otherUserId}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{conv.itemTitle}</h3>
                        <Badge variant={conv.itemType === "lost" ? "destructive" : "default"}>
                          {conv.itemType}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        with {conv.otherUserName}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(conv.lastMessageTime).toLocaleString()}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <Badge variant="default" className="ml-4">
                        {conv.unreadCount} new
                      </Badge>
                    )}
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
