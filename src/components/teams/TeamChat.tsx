"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TeamChat({
  teamId,
  currentUserId,
}: {
  teamId: string;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("chat_messages")
        .select("*, profiles(first_name, last_name, avatar_url, email)")
        .eq("team_id", teamId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    };
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`team_chat:${teamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `team_id=eq.${teamId}`,
        },
        (payload) => {
          // Fetch full profile for the new message
          const fetchNewMsgProfile = async () => {
            const { data: profile } = await supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url, email")
              .eq("id", payload.new.sender_id)
              .single();
            const newMsg = { ...payload.new, profiles: profile };
            setMessages((prev) => [...prev, newMsg]);
          };
          fetchNewMsgProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      // Locate the viewport element inside ScrollArea to scroll IT, or just use a ref on a container inside
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await supabase
      .from("chat_messages")
      .insert({
        team_id: teamId,
        sender_id: currentUserId,
        content: newMessage,
      });
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-card shadow-sm">
      <div className="p-4 border-b bg-muted/30 font-semibold flex items-center justify-between">
        <span>Team Chat</span>
        <span className="text-xs text-muted-foreground">
          {messages.length} messages
        </span>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4 pr-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.sender_id === currentUserId ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8 mt-1 border">
                <AvatarImage src={msg.profiles?.avatar_url} />
                <AvatarFallback>
                  {msg.profiles?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-2xl p-3 text-sm max-w-[80%] shadow-sm ${
                  msg.sender_id === currentUserId
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-muted rounded-tl-none"
                }`}
              >
                <p
                  className={`text-xs mb-1 font-medium ${
                    msg.sender_id === currentUserId
                      ? "text-primary-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.profiles?.first_name ||
                    msg.profiles?.email?.split("@")[0]}
                </p>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t gap-2 flex items-center">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1"
        />
        <Button onClick={sendMessage} size="sm">
          Send
        </Button>
      </div>
    </div>
  );
}
