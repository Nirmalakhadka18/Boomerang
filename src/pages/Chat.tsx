import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Send, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  read: boolean;
}

export default function Chat() {
  const { itemId, userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [otherUserName, setOtherUserName] = useState("");
  const [itemTitle, setItemTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, [itemId, userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setCurrentUserId(session.user.id);

    // Fetch item details
    const { data: itemData } = await supabase
      .from("items")
      .select("title, user_id")
      .eq("id", itemId)
      .single();

    if (itemData) {
      setItemTitle(itemData.title);
    }

    // Fetch other user's profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    if (profileData) {
      setOtherUserName(profileData.full_name || "User");
    }

    await fetchMessages();
    setLoading(false);

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel(`chat-${itemId}-${session.user.id}-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `item_id=eq.${itemId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (
            (newMsg.sender_id === session.user.id && newMsg.receiver_id === userId) ||
            (newMsg.sender_id === userId && newMsg.receiver_id === session.user.id)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            
            // Mark as read if it's from the other user
            if (newMsg.sender_id === userId) {
              markAsRead(newMsg.id);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessages = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("item_id", itemId)
      .or(
        `and(sender_id.eq.${session.user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${session.user.id})`
      )
      .order("created_at", { ascending: true });

    if (data) {
      setMessages(data);
      // Mark unread messages from other user as read
      const unreadMessages = data.filter(
        (msg) => msg.sender_id === userId && !msg.read
      );
      unreadMessages.forEach((msg) => markAsRead(msg.id));
    }
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from("messages")
      .update({ read: true })
      .eq("id", messageId);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const { error } = await supabase.from("messages").insert({
      item_id: itemId,
      sender_id: currentUserId,
      receiver_id: userId,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
      // Refresh messages after sending
      await fetchMessages();
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
    toast({
      title: "Chat refreshed",
      description: "Messages updated",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container px-4 py-8 max-w-4xl mx-auto">
        <Button onClick={() => navigate(-1)} variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="h-[calc(100vh-250px)] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle>
                  Chat about: {itemTitle}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Chatting with {otherUserName}
                </p>
              </div>
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                disabled={refreshing}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === currentUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.sender_id === currentUserId
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === currentUserId
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
